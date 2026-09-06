from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError

from app.schemas.detection import DetectionResponse, ErrorResponse
from app.services.yolo_detector import (
    InferenceError,
    ModelUnavailableError,
    get_yolo_detector,
)

router = APIRouter(prefix="/detect", tags=["detection"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
MAX_IMAGE_PIXELS = 50_000_000
READ_CHUNK_BYTES = 1024 * 1024


async def _read_upload(file: UploadFile) -> bytes:
    content = bytearray()
    while chunk := await file.read(READ_CHUNK_BYTES):
        content.extend(chunk)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="Image must be 15 MB or smaller.",
            )
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image is empty.",
        )
    return bytes(content)


def _decode_image(content: bytes) -> Image.Image:
    try:
        with Image.open(BytesIO(content)) as source:
            if source.format not in {"JPEG", "PNG"}:
                raise ValueError("Unsupported image format")
            if source.width * source.height > MAX_IMAGE_PIXELS:
                raise HTTPException(
                    status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                    detail="Image dimensions are too large to process safely.",
                )
            source.verify()
        with Image.open(BytesIO(content)) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.load()
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded file is not a valid JPEG or PNG image.",
        ) from exc

    return image


@router.post(
    "/yolo",
    response_model=DetectionResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        415: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def detect_yolo(
    file: UploadFile = File(...),
    confidence: float = Form(0.25, ge=0.05, le=0.90),
) -> DetectionResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG and PNG images are supported.",
        )

    try:
        content = await _read_upload(file)
    finally:
        await file.close()

    image = _decode_image(content)
    try:
        return get_yolo_detector().detect(image, confidence)
    except ModelUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except InferenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference failed. Please try another image or check the server logs.",
        ) from exc

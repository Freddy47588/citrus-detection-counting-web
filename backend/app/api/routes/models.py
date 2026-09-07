from fastapi import APIRouter

from app.config import get_settings
from app.services.dfine_detector import get_dfine_detector
from app.schemas.detection import ModelStatus, ModelsResponse
from app.services.yolo_detector import get_yolo_detector

router = APIRouter(tags=["models"])


@router.get("/models", response_model=ModelsResponse)
def model_status() -> ModelsResponse:
    settings = get_settings()
    yolo_reason = get_yolo_detector().unavailable_reason
    dfine = get_dfine_detector()
    return ModelsResponse(
        yolo11s=ModelStatus(
            available=yolo_reason is None,
            name="YOLO11s",
            default_confidence=settings.yolo_default_confidence,
            reason=yolo_reason,
        ),
        dfine_s=ModelStatus(
            available=dfine.available, name="D-FINE-S",
            default_confidence=settings.dfine_default_confidence,
            reason=dfine.unavailable_reason,
        ),
    )

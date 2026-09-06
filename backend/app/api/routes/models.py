from fastapi import APIRouter

from app.schemas.detection import ModelStatus, ModelsResponse
from app.services.yolo_detector import get_yolo_detector

router = APIRouter(tags=["models"])


@router.get("/models", response_model=ModelsResponse)
def model_status() -> ModelsResponse:
    return ModelsResponse(
        yolo11s=ModelStatus(
            available=get_yolo_detector().available,
            name="YOLO11s",
        ),
        dfine_s=ModelStatus(available=False, name="D-FINE-S"),
    )

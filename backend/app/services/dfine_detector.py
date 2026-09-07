"""D-FINE-S integration boundary; no inference adapter is implemented yet."""

from functools import lru_cache

from PIL import Image

from app.config import get_settings
from app.schemas.detection import DetectionResponse
from app.services.yolo_detector import ModelUnavailableError


class DfineDetector:
    def __init__(self, model_path: str | None) -> None:
        self.model_path = model_path

    available = False
    unavailable_reason = "D-FINE-S is not available: its final Kalisongo checkpoint and inference adapter are required."

    def detect(self, image: Image.Image, confidence: float) -> DetectionResponse:
        raise ModelUnavailableError(self.unavailable_reason)


@lru_cache
def get_dfine_detector() -> DfineDetector:
    return DfineDetector(get_settings().dfine_model_path)

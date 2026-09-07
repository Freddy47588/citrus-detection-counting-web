from typing import Literal

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionItem(BaseModel):
    class_id: Literal[0]
    class_name: Literal["Citrus Fruit"]
    confidence: float
    bbox: BoundingBox


class DetectionResponse(BaseModel):
    model: Literal["YOLO11s", "D-FINE-S"] = "YOLO11s"
    image_width: int
    image_height: int
    confidence_threshold: float
    detections: list[DetectionItem]
    count: int = Field(ge=0)
    inference_time_ms: float


class ComparisonResponse(BaseModel):
    """Future adapter contract: both predictions must use the same uploaded image."""

    yolo11s: DetectionResponse
    dfine_s: DetectionResponse


class ModelStatus(BaseModel):
    available: bool
    name: str
    default_confidence: float
    reason: str | None = None


class ModelsResponse(BaseModel):
    yolo11s: ModelStatus
    dfine_s: ModelStatus


class ErrorResponse(BaseModel):
    detail: str = Field(description="A user-safe explanation of the error")

from typing import Literal

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionItem(BaseModel):
    class_id: int
    class_name: Literal["Fruit on Ground", "Fruit on Tree"]
    confidence: float
    bbox: BoundingBox


class DetectionCounts(BaseModel):
    fruit_on_tree: int
    fruit_on_ground: int
    total: int


class DetectionResponse(BaseModel):
    model: Literal["YOLO11s"] = "YOLO11s"
    image_width: int
    image_height: int
    confidence_threshold: float
    detections: list[DetectionItem]
    counts: DetectionCounts
    inference_time_ms: float


class ModelStatus(BaseModel):
    available: bool
    name: str


class ModelsResponse(BaseModel):
    yolo11s: ModelStatus
    dfine_s: ModelStatus


class ErrorResponse(BaseModel):
    detail: str = Field(description="A user-safe explanation of the error")

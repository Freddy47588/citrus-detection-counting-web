from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from threading import Lock
from time import perf_counter
from typing import Any

from PIL import Image

from app.config import get_settings
from app.schemas.detection import (
    BoundingBox,
    DetectionCounts,
    DetectionItem,
    DetectionResponse,
)

CLASS_NAMES = {0: "Fruit on Ground", 1: "Fruit on Tree"}


class ModelUnavailableError(RuntimeError):
    pass


class InferenceError(RuntimeError):
    pass


class YoloDetector:
    def __init__(self, model_path: str | None) -> None:
        self._model_path = self._resolve_model_path(model_path)
        self._model: Any | None = None
        self._load_lock = Lock()
        self._inference_lock = Lock()

    @staticmethod
    def _resolve_model_path(model_path: str | None) -> Path | None:
        if not model_path or not model_path.strip():
            return None

        path = Path(model_path).expanduser()
        if path.is_absolute():
            return path.resolve()

        backend_root = Path(__file__).resolve().parents[2]
        return (backend_root / path).resolve()

    @property
    def available(self) -> bool:
        return self._model_path is not None and self._model_path.is_file()

    def _get_model(self) -> Any:
        if not self.available:
            raise ModelUnavailableError(
                "YOLO11s model is unavailable. Configure YOLO_MODEL_PATH with a valid local weight file."
            )

        if self._model is None:
            with self._load_lock:
                if self._model is None:
                    try:
                        from ultralytics import YOLO

                        self._model = YOLO(str(self._model_path))
                    except Exception as exc:
                        raise ModelUnavailableError(
                            "YOLO11s model could not be loaded. Verify the configured weight file."
                        ) from exc
        return self._model

    def detect(self, image: Image.Image, confidence: float) -> DetectionResponse:
        model = self._get_model()
        width, height = image.size

        try:
            with self._inference_lock:
                started_at = perf_counter()
                results = model.predict(source=image, conf=confidence, imgsz=640, verbose=False)
                elapsed_ms = (perf_counter() - started_at) * 1000
        except Exception as exc:
            raise InferenceError("YOLO11s could not process this image.") from exc

        detections: list[DetectionItem] = []
        if results:
            boxes = results[0].boxes
            for class_id, score, coordinates in zip(
                boxes.cls.cpu().tolist(),
                boxes.conf.cpu().tolist(),
                boxes.xyxy.cpu().tolist(),
                strict=True,
            ):
                parsed_class_id = int(class_id)
                class_name = CLASS_NAMES.get(parsed_class_id)
                if class_name is None:
                    continue
                x1, y1, x2, y2 = coordinates
                detections.append(
                    DetectionItem(
                        class_id=parsed_class_id,
                        class_name=class_name,
                        confidence=round(float(score), 6),
                        bbox=BoundingBox(
                            x1=float(x1), y1=float(y1), x2=float(x2), y2=float(y2)
                        ),
                    )
                )

        fruit_on_ground = sum(item.class_id == 0 for item in detections)
        fruit_on_tree = sum(item.class_id == 1 for item in detections)
        return DetectionResponse(
            image_width=width,
            image_height=height,
            confidence_threshold=confidence,
            detections=detections,
            counts=DetectionCounts(
                fruit_on_tree=fruit_on_tree,
                fruit_on_ground=fruit_on_ground,
                total=len(detections),
            ),
            inference_time_ms=round(elapsed_ms, 2),
        )


@lru_cache
def get_yolo_detector() -> YoloDetector:
    return YoloDetector(get_settings().yolo_model_path)

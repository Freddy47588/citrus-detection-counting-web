import sys
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from PIL import Image
from pydantic import ValidationError

from app.config import Settings
from app.schemas.detection import DetectionItem
from app.services import yolo_detector
from app.services.yolo_detector import ModelUnavailableError, YoloDetector


class Tensor:
    def __init__(self, values):
        self.values = values

    def cpu(self):
        return self

    def tolist(self):
        return self.values


@pytest.fixture
def model_factory(monkeypatch, tmp_path):
    checkpoint = tmp_path / "best.pt"
    checkpoint.touch()

    def create(names, classes=(), task="detect"):
        boxes = SimpleNamespace(
            cls=Tensor(list(classes)), conf=Tensor([0.91] * len(classes)),
            xyxy=Tensor([[100, 120, 180, 210]] * len(classes)),
        )
        model = SimpleNamespace(names=names, task=task, predict=Mock(return_value=[SimpleNamespace(boxes=boxes)]))
        loader = Mock(return_value=model)
        monkeypatch.setitem(sys.modules, "ultralytics", SimpleNamespace(YOLO=loader))
        return YoloDetector(str(checkpoint), max_det=1234), model, loader

    return create


@pytest.mark.parametrize("names", [{0: "Citrus Fruit"}, ["Citrus Fruit"]])
@pytest.mark.parametrize("count", [0, 3])
def test_schema_count_coordinates_and_max_det(model_factory, names, count):
    detector, model, loader = model_factory(names, [0] * count)
    loader.assert_not_called()
    assert detector.available
    result = detector.detect(Image.new("RGB", (1920, 1080)), 0.35)
    assert result.count == count == len(result.detections)
    assert result.image_width == 1920 and result.image_height == 1080
    assert result.confidence_threshold == 0.35
    assert result.model == "YOLO11s"
    assert result.inference_time_ms >= 0
    for item in result.detections:
        assert item.class_id == 0 and item.class_name == "Citrus Fruit"
        assert item.bbox.model_dump() == dict(x1=100, y1=120, x2=180, y2=210)
    assert model.predict.call_args.kwargs["max_det"] == 1234
    assert model.predict.call_args.kwargs["imgsz"] == 640
    assert model.predict.call_args.kwargs["conf"] == 0.35
    loader.assert_called_once()


@pytest.mark.parametrize("names", [{0: "wrong"}, {0: "Citrus Fruit", 1: "other"}, {1: "Citrus Fruit"}, {}])
def test_rejects_unexpected_schema(model_factory, names):
    detector, model, _ = model_factory(names)
    assert not detector.available
    with pytest.raises(ModelUnavailableError, match="exactly 0"):
        detector.detect(Image.new("RGB", (8, 6)), 0.25)
    model.predict.assert_not_called()


def test_rejects_wrong_task(model_factory):
    detector, _, _ = model_factory({0: "Citrus Fruit"}, task="classify")
    assert not detector.available


def test_rejects_unexpected_prediction_class(model_factory):
    detector, _, _ = model_factory({0: "Citrus Fruit"}, [1])
    with pytest.raises(ModelUnavailableError, match="outside"):
        detector.detect(Image.new("RGB", (8, 6)), 0.25)


def test_missing_and_unloadable_weights(monkeypatch, tmp_path):
    assert not YoloDetector(str(tmp_path / "missing.pt")).available
    checkpoint = tmp_path / "broken.pt"
    checkpoint.touch()
    monkeypatch.setitem(sys.modules, "ultralytics", SimpleNamespace(YOLO=Mock(side_effect=RuntimeError())))
    detector = YoloDetector(str(checkpoint))
    assert not detector.available
    with pytest.raises(ModelUnavailableError, match="could not be loaded"):
        detector._get_model()


def test_configured_max_det_reaches_service(monkeypatch):
    settings = Settings(_env_file=None, yolo_max_det=1500)
    monkeypatch.setattr(yolo_detector, "get_settings", lambda: settings)
    yolo_detector.get_yolo_detector.cache_clear()
    try:
        assert yolo_detector.get_yolo_detector()._max_det == 1500
    finally:
        yolo_detector.get_yolo_detector.cache_clear()


@pytest.mark.parametrize("values", [{"yolo_max_det": 0}, {"yolo_default_confidence": 0.01}, {"dfine_default_confidence": 1}])
def test_invalid_configuration(values):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **values)


def test_response_rejects_other_class():
    with pytest.raises(ValidationError):
        DetectionItem(class_id=1, class_name="other", confidence=0.8, bbox=dict(x1=0, y1=0, x2=1, y2=1))

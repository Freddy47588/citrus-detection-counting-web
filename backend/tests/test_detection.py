from io import BytesIO
from types import SimpleNamespace

import pytest

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.api.routes import detection
from app.schemas.detection import DetectionResponse, DetectionItem, BoundingBox

client = TestClient(app)


def test_rejects_non_image_upload() -> None:
    response = client.post(
        "/api/detect/yolo",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
        data={"confidence": "0.25"},
    )

    assert response.status_code == 415
    assert response.json() == {"detail": "Only JPEG and PNG images are supported."}


def test_rejects_empty_image() -> None:
    response = client.post(
        "/api/detect/yolo",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
    )

    assert response.status_code == 400


def test_rejects_corrupt_image() -> None:
    response = client.post(
        "/api/detect/yolo",
        files={"file": ("broken.png", b"broken", "image/png")},
    )

    assert response.status_code == 422


def test_valid_image_returns_unavailable_when_weight_is_not_configured(monkeypatch) -> None:
    from app.api.routes import detection

    class UnavailableDetector:
        def detect(self, image: Image.Image, confidence: float):
            from app.services.yolo_detector import ModelUnavailableError

            raise ModelUnavailableError("YOLO11s model is unavailable for this test.")

    image_buffer = BytesIO()
    Image.new("RGB", (8, 6), "orange").save(image_buffer, format="PNG")
    monkeypatch.setattr(detection, "get_yolo_detector", lambda: UnavailableDetector())

    response = client.post(
        "/api/detect/yolo",
        files={"file": ("citrus.png", image_buffer.getvalue(), "image/png")},
        data={"confidence": "0.25"},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "YOLO11s model is unavailable for this test."


def image_bytes(format="PNG", mode="RGB", exif=None):
    buffer = BytesIO()
    options = {"exif": exif} if exif is not None else {}
    Image.new(mode, (8, 6)).save(buffer, format=format, **options)
    return buffer.getvalue()


@pytest.mark.parametrize("format,mime", [("JPEG", "image/jpeg"), ("PNG", "image/png")])
@pytest.mark.parametrize("count", [0, 3])
def test_valid_upload_and_count(monkeypatch, format, mime, count):
    def detect(image, confidence):
        assert image.size == (8, 6)
        assert image.mode == "RGB"
        return DetectionResponse(
            image_width=8, image_height=6, confidence_threshold=confidence,
            detections=[DetectionItem(class_id=0, class_name="Citrus Fruit", confidence=0.9,
                bbox=BoundingBox(x1=1, y1=1, x2=3, y2=4)) for _ in range(count)],
            count=count, inference_time_ms=1.5,
        )
    monkeypatch.setattr(detection, "get_yolo_detector", lambda: SimpleNamespace(detect=detect))
    response = client.post("/api/detect/yolo", files={"file": ("image", image_bytes(format), mime)})
    assert response.status_code == 200
    payload = response.json()
    assert payload["count"] == count == len(payload["detections"])
    assert "counts" not in payload
    assert all(item["class_id"] == 0 and item["class_name"] == "Citrus Fruit" for item in payload["detections"])


@pytest.mark.parametrize("confidence,expected", [(0.04, 422), (0.91, 422), (0.05, 503), (0.90, 503)])
def test_confidence_boundaries(monkeypatch, confidence, expected):
    from app.services.yolo_detector import YoloDetector
    monkeypatch.setattr(detection, "get_yolo_detector", lambda: YoloDetector(None))
    response = client.post("/api/detect/yolo", files={"file": ("image.png", image_bytes(), "image/png")}, data={"confidence": confidence})
    assert response.status_code == expected


def test_configured_default_confidence(monkeypatch):
    monkeypatch.setattr(detection, "get_settings", lambda: SimpleNamespace(yolo_default_confidence=0.4))
    def detect(image, confidence):
        assert confidence == 0.4
        return DetectionResponse(image_width=8, image_height=6, confidence_threshold=confidence, detections=[], count=0, inference_time_ms=0)
    monkeypatch.setattr(detection, "get_yolo_detector", lambda: SimpleNamespace(detect=detect))
    response = client.post("/api/detect/yolo", files={"file": ("image.png", image_bytes(), "image/png")})
    assert response.status_code == 200
    assert response.json()["confidence_threshold"] == 0.4


def test_oversized_upload():
    response = client.post("/api/detect/yolo", files={"file": ("large.png", b"x" * (detection.MAX_UPLOAD_BYTES + 1), "image/png")})
    assert response.status_code == 413


def test_oversized_dimensions(monkeypatch):
    monkeypatch.setattr(detection, "MAX_IMAGE_PIXELS", 47)
    response = client.post("/api/detect/yolo", files={"file": ("large.png", image_bytes(), "image/png")})
    assert response.status_code == 413


def test_rejects_disguised_format():
    response = client.post("/api/detect/yolo", files={"file": ("fake.png", image_bytes("GIF"), "image/png")})
    assert response.status_code == 422


def test_exif_normalization_and_rgb():
    exif = Image.Exif()
    exif[274] = 6
    image = detection._decode_image(image_bytes("JPEG", exif=exif))
    assert image.size == (6, 8)
    assert image.mode == "RGB"
    assert detection._decode_image(image_bytes(mode="RGBA")).mode == "RGB"

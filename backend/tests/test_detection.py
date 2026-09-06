from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

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

from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api.routes import models
from app.main import app
from app.services.dfine_detector import DfineDetector
from app.services.yolo_detector import ModelUnavailableError


@pytest.mark.parametrize("reason", [None, "Missing checkpoint", "Invalid class schema"])
def test_model_status(monkeypatch, reason):
    monkeypatch.setattr(models, "get_yolo_detector", lambda: SimpleNamespace(unavailable_reason=reason))
    response = TestClient(app).get("/api/models")
    assert response.status_code == 200
    payload = response.json()
    assert payload["yolo11s"]["available"] is (reason is None)
    assert payload["yolo11s"]["reason"] == reason
    assert payload["yolo11s"]["name"] == "YOLO11s"
    assert payload["yolo11s"]["default_confidence"] == models.get_settings().yolo_default_confidence
    assert payload["dfine_s"]["available"] is False
    assert payload["dfine_s"]["name"] == "D-FINE-S"


def test_dfine_requires_adapter_even_with_file(tmp_path):
    checkpoint = tmp_path / "best.pth"
    checkpoint.touch()
    detector = DfineDetector(str(checkpoint))
    assert not detector.available
    with pytest.raises(ModelUnavailableError, match="adapter"):
        detector.detect(None, 0.25)

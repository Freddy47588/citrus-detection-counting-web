from fastapi.testclient import TestClient

from app.main import app


def test_model_status_has_honest_dfine_state() -> None:
    response = TestClient(app).get("/api/models")

    assert response.status_code == 200
    payload = response.json()
    assert payload["yolo11s"]["name"] == "YOLO11s"
    assert isinstance(payload["yolo11s"]["available"], bool)
    assert payload["dfine_s"] == {"available": False, "name": "D-FINE-S"}

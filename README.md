# KalisCitrus - Citrus Detection & Counting in Kalisongo

> YOLO11s x D-FINE-S Research Demonstration

KalisCitrus supports an undergraduate thesis comparing YOLO11s and D-FINE-S for citrus fruit detection and counting on trees in the orchards of Kalisongo Village. This repository is an inference web demonstration, not a training pipeline, annotation application, or official evaluation pipeline.

## Final research scope

The final Kalisongo dataset has exactly one class:

```text
0 = Citrus Fruit
```

Citrus Fruit means fruit still attached to / located on the tree within the research annotation and counting scope. Fruit on Ground is outside the final research scope. CitDet was an earlier pilot/preparation dataset only; its two-class checkpoint must not be used as the final Kalisongo model.

Official Precision, Recall, mAP@0.50, mAP@0.50:0.95, MAE, RMSE, and Mean Count Bias come from separate controlled Kalisongo research notebooks. Web counts are predictions. Neither one uploaded image nor its inference latency establishes model accuracy or an official performance comparison.

## Current model readiness

- **YOLO11s:** inference adapter implemented; available only when the configured local checkpoint exists, loads, has detection task metadata, and declares exactly `0 = Citrus Fruit`. Both dictionary and list representations of that schema are accepted. Invalid schemas fail with a clear configuration error, never a silent relabeling.
- **D-FINE-S:** unavailable. The service boundary and configuration exist, but the real adapter and final checkpoint are still required. A weight file alone does not enable it.
- **Compare Models:** disabled until both models are available. Shared response contracts are prepared in Python and TypeScript; comparison inference and the side-by-side result flow remain future integration work. Both adapters must receive the same uploaded image, with each model's threshold displayed. No winner should be selected from one image.

Schema checks cannot establish a checkpoint's training provenance. Supply the verified final Kalisongo YOLO11s weight, not a renamed preparation checkpoint. Restart the backend after replacing weights or changing configuration. Successful loads are cached with separate loading and inference locks; loading is deferred until a status or inference request. The first status check may take longer while loading the checkpoint.

## Stack and architecture

- Frontend: React, Vite, TypeScript, Tailwind CSS, Lucide icons.
- Backend: Python, FastAPI, Ultralytics YOLO, Pillow, Uvicorn.
- Tests: pytest and FastAPI TestClient, with mocked inference and no checkpoint requirement.

```text
frontend/src/
  components/       Upload, model selection, SVG overlay, result cards
  services/api.ts   Multipart requests and API errors
  types/detection.ts  Shared detection and future comparison contracts
backend/app/
  api/routes/       Health, model readiness, upload validation
  schemas/          Detection and model status contracts
  services/         YOLO adapter and unavailable D-FINE-S boundary
  config.py         Environment settings
```

Uploads are limited to JPEG/PNG, 15 MB, and 50 million pixels. Empty, corrupt, and disguised unsupported formats are rejected. EXIF orientation is normalized and images are converted to RGB. Bounding boxes use EXIF-oriented original-image pixel coordinates, not the internal inference size. YOLO inference retains `imgsz=640` and explicitly passes configured `max_det` (default 1000).

## Local installation

Use Python 3.11+ and Node.js 20+.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

On macOS/Linux, activate with `source .venv/bin/activate` and copy configuration with `cp .env.example .env`.

Expected local weights (not committed):

```text
backend/models/yolo11s/best.pt
backend/models/dfine_s/best.pth
```

Configure `backend/.env`:

```dotenv
YOLO_MODEL_PATH=models/yolo11s/best.pt
YOLO_DEFAULT_CONFIDENCE=0.25
YOLO_MAX_DET=1000
DFINE_MODEL_PATH=models/dfine_s/best.pth
DFINE_DEFAULT_CONFIDENCE=0.25
```

YOLO relative paths resolve from `backend/`. D-FINE-S path configuration is reserved for the future adapter and should follow the same convention. No absolute Windows path is required. `.env`, `*.pt`, `*.pth`, `*.onnx`, virtual environments, dependency folders, build output, and caches are gitignored.

Start from `backend/`:

```sh
uvicorn app.main:app --reload
```

In another terminal:

```sh
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` (`Copy-Item` on PowerShell or `cp` on macOS/Linux), then run `npm run dev`. The default frontend is `http://localhost:5173`, with `VITE_API_BASE_URL=http://127.0.0.1:8000`. Backend CORS origins are configured through `FRONTEND_ORIGINS`.

## Backend API

- `GET /api/health`: API health.
- `GET /api/models`: actual YOLO readiness, unavailable reasons, and each model's configured demo confidence default. D-FINE-S remains unavailable.
- `POST /api/detect/yolo`: YOLO inference.
- `/docs`: interactive API documentation.

Model status example when weights are missing:

```json
{
  "yolo11s": {"available": false, "name": "YOLO11s", "default_confidence": 0.25, "reason": "YOLO11s model is unavailable. Configure YOLO_MODEL_PATH with a valid local weight file."},
  "dfine_s": {"available": false, "name": "D-FINE-S", "default_confidence": 0.25, "reason": "D-FINE-S is not available: its final Kalisongo checkpoint and inference adapter are required."}
}
```

Send multipart form data with `file` and optional `confidence` (range `0.05` to `0.90`). Omission uses `YOLO_DEFAULT_CONFIDENCE`. The frontend initializes its slider from `/api/models`. The slider is for interactive demonstration only; official thresholds are selected using the validation set in the research notebooks, never tuned from web uploads.

Illustrative response, not a research measurement:

```json
{
  "model": "YOLO11s",
  "image_width": 1920,
  "image_height": 1080,
  "confidence_threshold": 0.25,
  "detections": [{
    "class_id": 0,
    "class_name": "Citrus Fruit",
    "confidence": 0.91,
    "bbox": {"x1": 100, "y1": 120, "x2": 180, "y2": 210}
  }],
  "count": 1,
  "inference_time_ms": 42.5
}
```

`count` equals the number of returned detections. Zero means no Citrus Fruit was detected above the selected threshold, not proof that the image contains no fruit. `model` supports `YOLO11s` and `D-FINE-S` for the future adapter. There are no D-FINE-S or comparison inference endpoints yet.

Errors use `detail`: 400 empty upload, 413 size/dimension limit, 415 invalid MIME, 422 invalid image or confidence, 503 unavailable/incompatible model, and 500 inference failure.

## Validation

From `backend/` with the virtual environment activated:

```sh
python -m pytest
```

From `frontend/`:

```sh
npm run lint
npm run build
```

Tests cover health, readiness, model schema, configured maximum detections, response counts, confidence defaults/bounds, JPEG/PNG validation, size protections, corrupt/empty uploads, EXIF orientation, and RGB conversion without requiring model weights.

## Research disclaimer

Detection counts shown by KalisCitrus are model predictions. Official model performance metrics are produced through the controlled Kalisongo research evaluation pipeline.

## License

[MIT License](LICENSE).

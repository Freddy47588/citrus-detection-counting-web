# CitDet — Citrus Detection & Counting

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![YOLO11s](https://img.shields.io/badge/YOLO11s-Image_Inference-FF6F00)
![D-FINE-S](https://img.shields.io/badge/D--FINE--S-Planned-lightgrey)
![Research Prototype](https://img.shields.io/badge/Status-Research_Prototype-2F7D4A)

## 🍊 Project Overview

CitDet is a local-first research prototype for detecting and estimating citrus fruit counts in field images. It provides an end-to-end YOLO11s workflow: upload a JPEG or PNG image, run FastAPI inference, receive structured detection JSON, and visualize responsive bounding boxes and category counts in React.

## 🔬 Research Context

CitDet supports the study **“Performance Comparison of YOLO11s and D-FINE-S Models for Citrus Fruit Detection and Counting in Kalisongo Village.”** The current website is a deployment/demo prototype for inference only.

Official Precision, Recall, F1, mAP, MAE, and RMSE results come from a separate controlled evaluation pipeline. This application does not calculate or alter research metrics, datasets, or model weights.

## ✨ Features

- JPEG/PNG upload with client- and server-side validation (maximum 15 MB)
- Lazy-loaded, cached YOLO11s inference at `imgsz=640`
- Configurable confidence threshold from `0.05` to `0.90`
- Original-resolution pixel coordinates in structured JSON
- Responsive SVG bounding-box overlay with labels and confidence values
- Estimated Fruit on Tree, Fruit on Ground, and total counts
- Model availability, loading, empty-result, network, and API error states
- EXIF orientation handling while preserving the oriented image dimensions

## 🧠 Models

| Capability | Status |
| --- | --- |
| YOLO11s image inference | Available |
| D-FINE-S | Planned / Not Integrated |
| Compare Models | Planned / Disabled until D-FINE-S is available |
| Video processing | Planned |
| Cloud storage | Planned |
| Kalisongo field model | Planned |

The YOLO11s class mapping is fixed to:

```text
0 = Fruit on Ground
1 = Fruit on Tree
```

## 🏗️ Architecture

```text
Image upload
    → React + TypeScript
    → multipart/form-data
    → FastAPI validation
    → cached Ultralytics YOLO11s
    → detection JSON
    → SVG overlay + estimated counts
```

Backend routes, schemas, and inference logic remain separated under `api`, `schemas`, and `services`. The frontend keeps API calls, response types, upload controls, visualization, and summary presentation modular.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide
- **Backend:** Python, FastAPI, Uvicorn, Ultralytics, Pillow
- **Tests:** Pytest and FastAPI TestClient

## 🚀 Running Locally

Requirements: Python 3.11+ and Node.js 20+.

### Backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1
```

```bash
# macOS/Linux
source .venv/bin/activate
```

Install dependencies and create local configuration:

```bash
pip install -r requirements.txt
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env` for the final command.

Place the local weight at:

```text
backend/models/yolo11s/best.pt
```

Configure its path in `backend/.env`:

```dotenv
YOLO_MODEL_PATH=models/yolo11s/best.pt
```

The path is resolved from the backend directory. It is environment-configured rather than hard-coded. Model files (`*.pt`, `*.pth`, and `*.onnx`) are ignored by Git and must never be committed.

Start the API from `backend/`:

```bash
uvicorn app.main:app --reload
```

Useful endpoints:

- `GET http://127.0.0.1:8000/api/health`
- `GET http://127.0.0.1:8000/api/models`
- `POST http://127.0.0.1:8000/api/detect/yolo`
- `GET http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env`. The development default is:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Open `http://localhost:5173`.

## API Contract

Send `multipart/form-data` to `POST /api/detect/yolo`:

- `file`: JPEG or PNG, non-empty, maximum 15 MB
- `confidence`: optional float, default `0.25`, range `0.05–0.90`

Example response:

```json
{
  "model": "YOLO11s",
  "image_width": 1920,
  "image_height": 1080,
  "confidence_threshold": 0.25,
  "detections": [
    {
      "class_id": 1,
      "class_name": "Fruit on Tree",
      "confidence": 0.873,
      "bbox": { "x1": 100.0, "y1": 120.0, "x2": 180.0, "y2": 220.0 }
    }
  ],
  "counts": { "fruit_on_tree": 1, "fruit_on_ground": 0, "total": 1 },
  "inference_time_ms": 42.5
}
```

Coordinates refer to the EXIF-oriented original image dimensions, not the internal `640` inference size.

## 🗺️ Roadmap

- Integrate D-FINE-S inference
- Enable honest side-by-side comparison after both models are available
- Add video detection and tracking
- Add optional compression and cloud storage
- Add database-backed result history
- Package and deploy the prototype

## ⚠️ Research Disclaimer

Estimated counts are model predictions, not guaranteed ground-truth measurements. CitDet is a research prototype and must not replace the separate official evaluation pipeline.

## License

Released under the [MIT License](LICENSE).

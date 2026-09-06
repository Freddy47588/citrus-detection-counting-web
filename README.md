# CitDet — Citrus Detection & Counting

CitDet is a local-first web prototype for visualizing citrus object-detection and counting workflows. This repository currently provides a clean application foundation; model inference is intentionally not included in this release.

## Project Overview

The application pairs a responsive React interface with a small FastAPI service. Users can select a local citrus image, preview it, choose a planned model workflow, and configure a confidence threshold. Result areas are honest placeholders until trained model weights and inference services are integrated.

## Research Context

CitDet supports the undergraduate research project **“Performance Comparison of YOLO11s and D-FINE-S Models for Citrus Fruit Detection and Counting in Kalisongo Village.”** It is intended as a field-oriented demonstration interface for model inference.

Official research metrics—including Precision, Recall, F1-score, mAP@50, mAP@50:95, MAE, and RMSE—are produced by a separate evaluation pipeline. This website does not calculate, modify, or replace official evaluation results.

## Features

- Drag-and-drop or browse-based JPG, JPEG, and PNG image selection
- Client-side file type and size validation with a local preview
- YOLO11s, D-FINE-S, and comparison workflow selectors
- Configurable confidence threshold from 0.05 to 0.90
- Clearly labelled, non-inference result placeholders
- Responsive, accessible research-demo interface
- FastAPI health endpoint and configurable local CORS

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Development:** Git and VS Code compatible

## Architecture

The frontend and backend are independent applications. FastAPI routes live behind `/api`; schemas define API contracts, while `services` is reserved for future inference adapters. Model paths are environment-configured and model artifacts live outside Git.

No database, object storage, authentication, inference runtime, or cloud dependency is used at this stage.

## Project Structure

```text
citrus-detection-counting-web/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   └── main.py
│   ├── models/{yolo11s,dfine_s}/
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/components/
│   └── src/App.tsx
├── .gitignore
├── LICENSE
└── README.md
```

## Local Setup

Requirements: Node.js 20+, npm, and Python 3.11+.

Clone the repository, then set up each application in a separate terminal. Configuration is optional for the default local ports.

## Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Then install dependencies and optionally create local configuration:

```bash
pip install -r requirements.txt
cp .env.example .env  # use: Copy-Item .env.example .env on PowerShell
```

## Frontend Setup

```bash
cd frontend
npm install
```

## Running Locally

Backend, from `backend/`:

```bash
uvicorn app.main:app --reload
```

Frontend, from `frontend/`:

```bash
npm run dev
```

Open `http://localhost:5173`. API health is available at `http://127.0.0.1:8000/api/health`.

## Planned Features

- YOLO11s and D-FINE-S inference services
- Side-by-side model comparison and bounding-box overlays
- Fruit-on-tree and fruit-on-ground counting
- Image and video processing and compression
- Object storage and result history
- Kalisongo field-trained models
- ONNX deployment and public hosting

These items are roadmap context, not implemented functionality.

## Model Weights

Model weights are not stored in Git. `.pt`, `.pth`, and `.onnx` files are ignored. When inference is added, configure paths through local environment variables:

```dotenv
YOLO_MODEL_PATH=
DFINE_MODEL_PATH=
```

Never commit credentials, local absolute paths, or model artifacts.

## Research Disclaimer

CitDet is a research prototype, not a production agricultural measurement system. Placeholder counts are not model predictions. Reproducible model assessment remains the responsibility of the separate research evaluation pipeline.

## License

Released under the [MIT License](LICENSE).


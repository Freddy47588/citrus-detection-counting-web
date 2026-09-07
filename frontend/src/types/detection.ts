export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectionItem {
  class_id: 0;
  class_name: "Citrus Fruit";
  confidence: number;
  bbox: BoundingBox;
}

export interface DetectionResponse {
  model: "YOLO11s" | "D-FINE-S";
  image_width: number;
  image_height: number;
  confidence_threshold: number;
  detections: DetectionItem[];
  count: number;
  inference_time_ms: number;
}

export interface ModelStatus {
  available: boolean;
  name: string;
  default_confidence: number;
  reason: string | null;
}

export interface ModelsResponse {
  yolo11s: ModelStatus;
  dfine_s: ModelStatus;
}

export type RequestState = "idle" | "loading" | "success" | "error";

// Future comparison must use the same File for both adapters.
export interface ComparisonResponse {
  yolo11s: DetectionResponse;
  dfine_s: DetectionResponse;
}

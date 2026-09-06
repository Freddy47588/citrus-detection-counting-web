export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectionItem {
  class_id: number;
  class_name: "Fruit on Ground" | "Fruit on Tree";
  confidence: number;
  bbox: BoundingBox;
}

export interface DetectionResponse {
  model: "YOLO11s";
  image_width: number;
  image_height: number;
  confidence_threshold: number;
  detections: DetectionItem[];
  counts: {
    fruit_on_tree: number;
    fruit_on_ground: number;
    total: number;
  };
  inference_time_ms: number;
}

export interface ModelStatus {
  available: boolean;
  name: string;
}

export interface ModelsResponse {
  yolo11s: ModelStatus;
  dfine_s: ModelStatus;
}

export type RequestState = "idle" | "loading" | "success" | "error";

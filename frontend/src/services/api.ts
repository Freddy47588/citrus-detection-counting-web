import type { DetectionResponse, ModelsResponse } from "../types/detection";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 120_000;

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: string | Array<{ msg?: string }> };
    if (typeof payload.detail === "string") return payload.detail;
    if (Array.isArray(payload.detail)) return payload.detail[0]?.msg ?? "The request was invalid.";
  } catch {
    // The backend did not return a JSON error body.
  }
  return `Request failed with status ${response.status}.`;
}

async function request(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE_URL}${input}`, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The inference request timed out. Please try again.");
    }
    throw new ApiError("Cannot reach the CitDet API. Make sure the backend is running.");
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getModels(): Promise<ModelsResponse> {
  const response = await request("/api/models");
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  return response.json() as Promise<ModelsResponse>;
}

export async function detectWithYolo(file: File, confidence: number): Promise<DetectionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("confidence", confidence.toString());

  const response = await request("/api/detect/yolo", { method: "POST", body: formData });
  if (!response.ok) throw new ApiError(await parseError(response), response.status);
  return response.json() as Promise<DetectionResponse>;
}

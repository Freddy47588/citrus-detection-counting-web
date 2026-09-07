from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "KalisCitrus API"
    app_env: str = "development"
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    yolo_model_path: str | None = "models/yolo11s/best.pt"
    yolo_default_confidence: float = Field(0.25, ge=0.05, le=0.90)
    yolo_max_det: int = Field(1000, gt=0)
    dfine_model_path: str | None = "models/dfine_s/best.pth"
    dfine_default_confidence: float = Field(0.25, ge=0.05, le=0.90)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

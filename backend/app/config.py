from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "GarudaANPR Enterprise"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "garuda_anpr_super_secret_jwt_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/garuda_anpr"
    
    # ANPR & Vision
    YOLO_MODEL_PATH: str = "models/yolov8n_indian_vehicles.pt"
    PADDLE_OCR_LANG: str = "en"
    OCR_CONFIDENCE_THRESHOLD: float = 0.75
    FRAME_SKIP_RATE: int = 2
    DUPLICATE_SUPPRESSION_SECONDS: int = 45
    
    # Storage
    UPLOAD_DIR: str = "uploads"
    SAVE_FULL_FRAMES: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

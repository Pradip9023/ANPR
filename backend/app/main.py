"""
GarudaANPR FastAPI Server
Production REST APIs and Real-time WebSocket Gateway for Indian ANPR & Parking Management
"""

import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.ai_engine.ocr_engine import normalize_indian_plate

app = FastAPI(
    title="GarudaANPR Enterprise API",
    description="Production REST APIs and Real-time WebSocket Gateway for Indian Automatic Number Plate Recognition and Automated Parking Systems.",
    version="2.4.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Schemas
class PlateParseRequest(BaseModel):
    raw_ocr_text: str
    camera_id: Optional[str] = "cam-01"

class VehicleRegisterSchema(BaseModel):
    plate_number: str
    owner_name: str
    mobile_number: str
    department: str
    vehicle_type: str = "CAR"
    ownership_type: str = "EMPLOYEE"
    make_model: Optional[str] = None
    color: Optional[str] = None
    assigned_slot: Optional[str] = None
    rfid_tag: Optional[str] = None

class PlateCorrectionSchema(BaseModel):
    detection_id: str
    corrected_plate: str
    notes: Optional[str] = None

# Routes
@app.get("/")
def root():
    return {
        "system": "GarudaANPR Enterprise System",
        "status": "ONLINE",
        "version": "2.4.0",
        "mode": "DUAL_MODE (Office Parking + Highway Road Surveillance)",
        "docs_url": "/docs",
    }

@app.post("/api/v1/anpr/parse-plate")
def parse_plate_endpoint(req: PlateParseRequest):
    """Parses raw OCR output into normalized Indian registration number."""
    result = normalize_indian_plate(req.raw_ocr_text)
    return {
        "status": "SUCCESS",
        "timestamp": datetime.utcnow().isoformat(),
        "result": result,
    }

@app.post("/api/v1/anpr/correct-detection")
async def correct_detection_endpoint(payload: PlateCorrectionSchema):
    """Allows manual operator verification and correction of uncertain OCR plates."""
    normalized = normalize_indian_plate(payload.corrected_plate)
    event_data = {
        "event": "PLATE_CORRECTED",
        "detection_id": payload.detection_id,
        "corrected_plate": normalized["normalized_plate"],
        "is_valid": normalized["is_valid"],
        "notes": payload.notes,
        "timestamp": datetime.utcnow().isoformat(),
    }
    await manager.broadcast(event_data)
    return {"status": "SUCCESS", "data": event_data}

@app.websocket("/ws/detections")
async def websocket_detections_endpoint(websocket: WebSocket):
    """Real-time detection and gate event WebSocket broadcast channel."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process client ping
            await websocket.send_json({"status": "CONNECTED", "server_time": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

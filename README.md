# 🇮🇳 GarudaANPR: Enterprise AI-Powered Automatic Number Plate Recognition & Parking Management System

**GarudaANPR** is a production-oriented, dual-mode Automatic Number Plate Recognition (ANPR) and intelligent surveillance platform engineered specifically for **Indian vehicle registration formats**, high-speed road conditions, and automated office parking facilities.

---

## 🌟 Key Highlights & Architecture

### Dual Operating Modes
1. **Office Parking Automation Mode**:
   - Automated entry and exit lane camera detection.
   - Boom barrier auto-open for registered employees and VIPs.
   - Real-time slot allocation (Zone A Executive, Zone B 2-Wheelers, Zone C Visitors, EV Charging Bays).
   - Duplicate frame detection debounce window (prevents gate idling duplicate tickets).
   - Dynamic dwell-time calculation and tariff collection in Indian Rupees (INR ₹).
   - Daily, weekly, and monthly reporting with instant CSV and Excel exports.

2. **Outdoor Road & Moving Vehicle Surveillance Mode**:
   - High-speed multi-lane vehicle detection (Cars, Motorcycles, Auto-Rickshaws, Trucks, Buses).
   - Speed estimation radar with red-light/speed limit violation alerts (>80 km/h).
   - Day / Night infrared (IR) vision filter.
   - Confidence threshold filter with automatic operator verification queue.
   - Support for RTSP CCTV streams, USB/webcams, uploaded MP4/WEBM files, and synthetic test streams.

---

## 🚘 Indian Registration Number Plate Engine

Optimized for the full range of Indian MoRTH (Ministry of Road Transport and Highways) number plate formats:

| Format Type | Example Plate | Description |
|---|---|---|
| **Standard Private** | `GJ01AB1234`, `MH12EF3456`, `KA03MN9876` | White reflective plate with Black lettering & IND hologram |
| **Delhi Special** | `DL8CAF1234` | Single-digit RTO with alphanumeric series block |
| **Bharat Series (BH)** | `22BH1234AA` | Pan-India unified registration for defense and central employees |
| **Commercial** | `GJ05CD5678` | Yellow plate with Black lettering |
| **Electric Vehicles (EV)** | `DL01EV1234` | Green reflective plate with White lettering |

### Context-Aware OCR Character Disambiguation
Indian plates have deterministic alphanumeric positions. GarudaANPR applies rule-based context normalization:
- **State Code (Positions 1-2)**: Corrects `0L` / `OL` → `DL`, `K4` → `KA`, `M1` → `MH`, `G3` → `GJ`, `U9` → `UP`, `7N` → `TN`.
- **District Block**: Enforces digits (e.g. `O1` → `01`, `I2` → `12`).
- **Series Block**: Enforces alphabets (e.g. `8` → `B`, `0` → `O` or `D`).
- **Number Block**: Enforces 4 digits padded with zeros (e.g. `12S4` → `1254`, `ABIZ` → `AB12`).

---

## 📂 Project Architecture

```
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI REST API & WebSocket server
│   │   ├── config.py                   # Pydantic environment settings
│   │   ├── models/models.py            # Normalized PostgreSQL SQLAlchemy ORM
│   │   ├── ai_engine/
│   │   │   ├── detector.py             # YOLOv8 vehicle & plate bounding box detector
│   │   │   └── ocr_engine.py           # PaddleOCR Indian plate normalizer
│   │   └── camera_service/
│   │       └── stream_processor.py     # Asynchronous OpenCV RTSP ingestion worker
│   ├── tests/
│   │   └── test_plate_ocr.py           # Python unit tests for OCR normalization
│   └── requirements.txt                # Python backend dependencies
├── src/
│   ├── context/AppContext.tsx          # Central application state & live simulation
│   ├── components/
│   │   ├── common/PlateBadge.tsx       # Realistic Indian HSRP graphic badge
│   │   ├── common/CameraFeedCanvas.tsx # Real webcam / uploaded video / synthetic stream canvas
│   │   ├── common/ManualReviewModal.tsx# Operator uncertain-plate review & override modal
│   │   └── layout/Navbar.tsx & Sidebar.tsx
│   ├── pages/                          # 12 Application Pages
│   │   ├── Dashboard.tsx               # High-level KPIs, live stream & occupancy
│   │   ├── OfficeParking.tsx           # Dual-gate lane view, barrier controls & sessions
│   │   ├── RoadDetection.tsx           # Outdoor highway mode & speed radar
│   │   ├── LiveCameras.tsx             # 1x1, 2x2, 3x3 CCTV matrix
│   │   ├── VehicleRegistry.tsx         # Authorized vehicle database & blacklists
│   │   ├── DetectionHistory.tsx        # Forensic detection logs & plate crops
│   │   ├── ParkingHistory.tsx          # Complete entry/exit ledger & financial fees
│   │   ├── CameraManagement.tsx        # RTSP stream configuration & ping tests
│   │   ├── ReportsAnalytics.tsx        # Traffic charts, state breakdown, CSV/Excel export
│   │   ├── UserManagement.tsx          # Role-based access (Admin, Operator, Security, Auditor)
│   │   ├── Settings.tsx                # ANPR thresholds, duplicate suppression, tariff rules
│   │   └── Profile.tsx                 # System telemetry & model status
│   └── utils/
│       ├── plateParser.ts              # TypeScript Indian plate validation & parser
│       ├── parkingLogic.ts             # Dwell time, fee calculation, duplicate suppression
│       └── exportUtils.ts              # CSV & Excel (XLS) export generators
└── README.md
```

---

## 🚀 Quickstart & Execution

### 1. Web Application (React Vite Frontend)
Pre-configured and running live inside the AI Studio container on port 3000:
```bash
npm run dev
```

### 2. Running Unit Tests
- **TypeScript Logic Tests** (Node test runner):
  ```bash
  npx --yes tsx --test src/utils/plateParser.test.ts
  npx --yes tsx --test src/utils/parkingLogic.test.ts
  ```
- **Python OCR Tests**:
  ```bash
  python3 -m unittest backend/tests/test_plate_ocr.py
  ```

### 3. Deploying the Python FastAPI Backend (Standalone)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📹 Camera Hardware Ingestion
- **RTSP IP Camera**: Configure URL as `rtsp://<user>:<password>@<camera_ip>:554/stream1`. Passwords are encrypted and masked in the frontend.
- **USB / Laptop Webcam**: Click "Use Webcam" inside any camera viewport to grant WebRTC permission and test live physical plates.
- **Video File Upload**: Drop any pre-recorded traffic video (`.mp4`, `.webm`) into the feed canvas.
- **Mock Camera Mode**: Built-in synthetic stream with moving Indian vehicles, day/night lighting, and license plate labels.

---

## 🔒 Security & Role-Based Access Control (RBAC)
- **ADMIN**: Complete system control, camera CRUD, blacklist management, configuration edits.
- **OPERATOR**: Parking gate operations, manual OCR review, and visitor pass creation.
- **SECURITY**: Checkpoint clearance, manual barrier open overrides.
- **AUDITOR**: Forensic logs and reports inspection.
- **Audit Logs**: Every manual plate edit, barrier override, and blacklist event is permanently recorded with timestamp, operator ID, and IP address.

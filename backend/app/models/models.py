import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Text,
    Index,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"
    SECURITY = "SECURITY"
    AUDITOR = "AUDITOR"

class VehicleType(str, enum.Enum):
    CAR = "CAR"
    MOTORCYCLE = "MOTORCYCLE"
    AUTO_RICKSHAW = "AUTO_RICKSHAW"
    BUS = "BUS"
    TRUCK = "TRUCK"
    ELECTRIC = "ELECTRIC"

class OwnershipType(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    VISITOR = "VISITOR"
    VIP = "VIP"
    COMMERCIAL = "COMMERCIAL"
    BLACKLISTED = "BLACKLISTED"

class CameraType(str, enum.Enum):
    PARKING_ENTRY = "PARKING_ENTRY"
    PARKING_EXIT = "PARKING_EXIT"
    ROAD_SURVEILLANCE = "ROAD_SURVEILLANCE"
    HIGHWAY_JUNCTION = "HIGHWAY_JUNCTION"
    BAY_OVERVIEW = "BAY_OVERVIEW"

class ParkingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    OVERSTAY = "OVERSTAY"
    DISPUTED = "DISPUTED"

# 1. Users Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.OPERATOR, nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    audit_logs = relationship("AuditLog", back_populates="user")

# 2. Vehicle Owners Table
class VehicleOwner(Base):
    __tablename__ = "vehicle_owners"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    mobile_number = Column(String(20), index=True, nullable=False)
    email = Column(String(120), nullable=True)
    department = Column(String(100), nullable=True)
    employee_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="owner")

# 3. Vehicles Table
class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, index=True, nullable=False)
    raw_ocr_plate = Column(String(30), nullable=True)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.CAR, nullable=False)
    ownership_type = Column(Enum(OwnershipType), default=VehicleType.CAR, nullable=False)
    owner_id = Column(Integer, ForeignKey("vehicle_owners.id"), nullable=True)
    make_model = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    assigned_slot = Column(String(20), nullable=True)
    rfid_tag = Column(String(50), unique=True, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("VehicleOwner", back_populates="vehicles")
    detections = relationship("Detection", back_populates="vehicle")
    parking_sessions = relationship("ParkingSession", back_populates="vehicle")

    __table_args__ = (
        Index("idx_vehicle_plate_type", "plate_number", "ownership_type"),
    )

# 4. Cameras Table
class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    camera_type = Column(Enum(CameraType), nullable=False)
    ip_address = Column(String(45), nullable=True)
    rtsp_url = Column(String(255), nullable=True)  # Passwords encrypted
    resolution = Column(String(30), default="1920x1080")
    fps = Column(Integer, default=30)
    assigned_lane = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    detections = relationship("Detection", back_populates="camera")

# 5. Detections Table
class Detection(Base):
    __tablename__ = "detections"

    id = Column(String(50), primary_key=True)
    camera_id = Column(String(50), ForeignKey("cameras.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    raw_ocr_text = Column(String(50), nullable=False)
    normalized_plate = Column(String(20), index=True, nullable=False)
    confidence_score = Column(Float, nullable=False)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.CAR)
    vehicle_speed_kmh = Column(Float, nullable=True)
    is_valid_format = Column(Boolean, default=True)
    is_reviewed = Column(Boolean, default=False)
    manual_override_plate = Column(String(20), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    camera = relationship("Camera", back_populates="detections")
    vehicle = relationship("Vehicle", back_populates="detections")
    images = relationship("DetectionImage", back_populates="detection", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_detection_timestamp_plate", "timestamp", "normalized_plate"),
    )

# 6. Detection Images Table
class DetectionImage(Base):
    __tablename__ = "detection_images"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(String(50), ForeignKey("detections.id"), nullable=False)
    image_type = Column(String(30), nullable=False)  # 'PLATE_CROP', 'FULL_FRAME', 'VEHICLE_BBOX'
    file_path = Column(String(255), nullable=False)
    bounding_box_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    detection = relationship("Detection", back_populates="images")

# 7. Parking Sessions Table
class ParkingSession(Base):
    __tablename__ = "parking_sessions"

    id = Column(String(50), primary_key=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    plate_number = Column(String(20), index=True, nullable=False)
    allocated_slot = Column(String(20), nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow, index=True)
    entry_camera_id = Column(String(50), ForeignKey("cameras.id"), nullable=True)
    exit_time = Column(DateTime, nullable=True, index=True)
    exit_camera_id = Column(String(50), ForeignKey("cameras.id"), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    fee_inr = Column(Float, default=0.0)
    status = Column(Enum(ParkingStatus), default=ParkingStatus.ACTIVE, nullable=False)
    payment_status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="parking_sessions")

# 8. Audit Logs Table
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(80), nullable=False)
    details = Column(Text, nullable=False)
    target_id = Column(String(50), nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")

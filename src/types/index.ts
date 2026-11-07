/**
 * GarudaANPR System Types & Interfaces
 */

export type UserRole = 'ADMIN' | 'OPERATOR' | 'SECURITY' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  lastLogin?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'AUTO_RICKSHAW' | 'BUS' | 'TRUCK' | 'ELECTRIC';
export type OwnershipType = 'EMPLOYEE' | 'VISITOR' | 'VIP' | 'BLACKLISTED' | 'COMMERCIAL';

export interface RegisteredVehicle {
  id: string;
  plateNumber: string; // Normalized
  rawOcrPlate?: string;
  ownerName: string;
  mobileNumber: string;
  department: string;
  vehicleType: VehicleType;
  ownershipType: OwnershipType;
  makeModel: string;
  color: string;
  assignedSlot?: string;
  rfidTag?: string;
  registeredAt: string;
  notes?: string;
}

export type CameraType = 'PARKING_ENTRY' | 'PARKING_EXIT' | 'ROAD_SURVEILLANCE' | 'HIGHWAY_JUNCTION' | 'BAY_OVERVIEW';
export type CameraSourceType = 'WEBCAM' | 'RTSP' | 'MOCK_STREAM' | 'VIDEO_UPLOAD';

export interface Camera {
  id: string;
  name: string;
  location: string;
  type: CameraType;
  sourceType: CameraSourceType;
  rtspUrl?: string; // Hidden or masked in UI
  ipAddress?: string;
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'ERROR';
  fps: number;
  resolution: string;
  latencyMs: number;
  isProcessing: boolean;
  assignedLane?: string;
  lastPing: string;
}

export interface BoundingBox {
  x: number; // percentage 0-100 or pixels
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
}

export interface VehicleDetection {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  rawPlateText: string;
  normalizedPlate: string;
  isPlateValid: boolean;
  confidenceScore: number;
  vehicleType: VehicleType;
  vehicleSpeedKmH?: number;
  vehicleBox: BoundingBox;
  plateBox: BoundingBox;
  mode: 'PARKING_ENTRY' | 'PARKING_EXIT' | 'ROAD_MONITORING';
  isRegistered: boolean;
  registeredVehicleInfo?: RegisteredVehicle;
  vehicleImageUrl: string;
  plateImageUrl: string;
  isReviewed: boolean;
  reviewedBy?: string;
  manualOverridePlate?: string;
  reviewNotes?: string;
  needsReview: boolean;
}

export interface ParkingSession {
  id: string;
  vehiclePlate: string;
  normalizedPlate: string;
  vehicleType: VehicleType;
  ownershipType: OwnershipType;
  ownerName?: string;
  department?: string;
  entryTime: string;
  entryCameraId: string;
  entryGateName: string;
  entryPlateImageUrl: string;
  allocatedSlot: string;
  exitTime?: string;
  exitCameraId?: string;
  exitGateName?: string;
  exitPlateImageUrl?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERSTAY' | 'DISPUTED';
  durationMinutes?: number;
  feeInr?: number;
  paidStatus?: 'PAID' | 'WAIVED' | 'PENDING';
}

export interface ParkingSlot {
  slotId: string;
  slotNumber: string;
  zone: 'A' | 'B' | 'C' | 'EV';
  category: 'CAR' | 'MOTORCYCLE' | 'EV';
  isOccupied: boolean;
  currentPlate?: string;
  occupiedSince?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'MANUAL_PLATE_CORRECTION' | 'BARRIER_OVERRIDE' | 'VEHICLE_REGISTERED' | 'VEHICLE_BLACKLISTED' | 'CAMERA_CONFIG_UPDATED' | 'SETTINGS_CHANGED' | 'LOGIN';
  targetId?: string;
  details: string;
  ipAddress: string;
}

export interface SystemSettings {
  anprConfidenceThreshold: number; // e.g. 0.75
  frameSkipRate: number; // e.g. 2
  duplicateSuppressionSeconds: number; // e.g. 45
  autoOpenBarrierForEmployees: boolean;
  autoOpenBarrierForVisitors: boolean;
  overstayAlertHours: number; // e.g. 10
  visitorHourlyRate: number; // INR
  visitorFreeMinutes: number;
  enforceIndianPlateRegex: boolean;
  nightModeEnhancement: boolean;
  saveFullFrames: boolean;
}

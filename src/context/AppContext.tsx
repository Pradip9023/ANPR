import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  RegisteredVehicle,
  Camera,
  ParkingSession,
  VehicleDetection,
  ParkingSlot,
  AuditLog,
  SystemSettings,
  VehicleType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_VEHICLES,
  INITIAL_CAMERAS,
  INITIAL_PARKING_SESSIONS,
  INITIAL_PARKING_SLOTS,
  INITIAL_DETECTIONS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_SETTINGS,
} from '../data/mockData';
import { parseAndNormalizeIndianPlate } from '../utils/plateParser';
import { calculateParkingFee, calculateDuration, isDuplicateDetection } from '../utils/parkingLogic';

export type NavigationPage =
  | 'login'
  | 'dashboard'
  | 'office_parking'
  | 'live_cameras'
  | 'road_detection'
  | 'vehicle_registry'
  | 'detection_history'
  | 'parking_history'
  | 'camera_management'
  | 'reports'
  | 'user_management'
  | 'settings'
  | 'profile';

interface AppContextType {
  currentUser: User | null;
  currentPage: NavigationPage;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setCurrentPage: (page: NavigationPage) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // Data State
  cameras: Camera[];
  vehicles: RegisteredVehicle[];
  parkingSessions: ParkingSession[];
  parkingSlots: ParkingSlot[];
  detections: VehicleDetection[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  
  // Live Barriers & Hardware simulation
  entryBarrierState: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING';
  exitBarrierState: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING';
  openBarrier: (gate: 'entry' | 'exit', manual?: boolean) => void;
  closeBarrier: (gate: 'entry' | 'exit') => void;

  // Real-time Simulation
  isSimulatorActive: boolean;
  toggleSimulator: () => void;
  simulateVehicleArrival: (plateOverride?: string, typeOverride?: VehicleType, targetGate?: 'entry' | 'exit' | 'road') => void;
  
  // Operations & Actions
  registerVehicle: (veh: Omit<RegisteredVehicle, 'id' | 'registeredAt'>) => void;
  updateVehicle: (id: string, veh: Partial<RegisteredVehicle>) => void;
  deleteVehicle: (id: string) => void;
  toggleVehicleBlacklist: (id: string) => void;

  addCamera: (cam: Omit<Camera, 'id' | 'latencyMs' | 'lastPing'>) => void;
  updateCamera: (id: string, cam: Partial<Camera>) => void;
  deleteCamera: (id: string) => void;
  toggleCameraProcessing: (id: string) => void;
  testCameraPing: (id: string) => Promise<boolean>;

  correctPlateDetection: (detectionId: string, correctedPlate: string, note?: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => void;

  // Alerts & Notifications
  activeAlert: { type: 'WARNING' | 'SUCCESS' | 'DANGER' | 'INFO'; message: string; title: string } | null;
  clearAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>(INITIAL_VEHICLES);
  const [parkingSessions, setParkingSessions] = useState<ParkingSession[]>(INITIAL_PARKING_SESSIONS);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(INITIAL_PARKING_SLOTS);
  const [detections, setDetections] = useState<VehicleDetection[]>(INITIAL_DETECTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  const [entryBarrierState, setEntryBarrierState] = useState<'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING'>('CLOSED');
  const [exitBarrierState, setExitBarrierState] = useState<'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING'>('CLOSED');
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(true);
  const [activeAlert, setActiveAlert] = useState<{ type: 'WARNING' | 'SUCCESS' | 'DANGER' | 'INFO'; message: string; title: string } | null>(null);

  // Sync theme to root html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const clearAlert = () => setActiveAlert(null);

  const logAuditAction = (action: AuditLog['action'], details: string, targetId?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System Auto-Engine',
      userRole: currentUser?.role || 'OPERATOR',
      action,
      targetId,
      details,
      ipAddress: '192.168.1.10',
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    logAuditAction('LOGIN', `User ${user.name} (${user.role}) logged in`);
  };

  const logout = () => {
    if (currentUser) {
      logAuditAction('LOGIN', `User ${currentUser.name} logged out`);
    }
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const openBarrier = (gate: 'entry' | 'exit', manual: boolean = false) => {
    if (gate === 'entry') {
      setEntryBarrierState('OPENING');
      setTimeout(() => setEntryBarrierState('OPEN'), 800);
      if (manual) {
        logAuditAction('BARRIER_OVERRIDE', 'Security operator opened North Entry Barrier manually');
      }
      // Auto close after 5 seconds
      setTimeout(() => {
        setEntryBarrierState('CLOSING');
        setTimeout(() => setEntryBarrierState('CLOSED'), 800);
      }, 5000);
    } else {
      setExitBarrierState('OPENING');
      setTimeout(() => setExitBarrierState('OPEN'), 800);
      if (manual) {
        logAuditAction('BARRIER_OVERRIDE', 'Security operator opened North Exit Barrier manually');
      }
      setTimeout(() => {
        setExitBarrierState('CLOSING');
        setTimeout(() => setExitBarrierState('CLOSED'), 800);
      }, 5000);
    }
  };

  const closeBarrier = (gate: 'entry' | 'exit') => {
    if (gate === 'entry') {
      setEntryBarrierState('CLOSING');
      setTimeout(() => setEntryBarrierState('CLOSED'), 600);
    } else {
      setExitBarrierState('CLOSING');
      setTimeout(() => setExitBarrierState('CLOSED'), 600);
    }
  };

  const toggleSimulator = () => {
    setIsSimulatorActive((prev) => !prev);
  };

  // Automated Vehicle Arrival / ANPR Pipeline Handler
  const simulateVehicleArrival = (
    plateOverride?: string,
    typeOverride?: VehicleType,
    targetGate?: 'entry' | 'exit' | 'road'
  ) => {
    const candidatePlates = [
      { plate: 'GJ01AB1234', type: 'CAR' as VehicleType, ocr: 'GJ01AB1234' },
      { plate: 'MH12EF3456', type: 'CAR' as VehicleType, ocr: 'MH12EF34S6' }, // with OCR noise
      { plate: 'DL08CAF1234', type: 'CAR' as VehicleType, ocr: 'DL8CAF1234' },
      { plate: 'KA03MN9876', type: 'MOTORCYCLE' as VehicleType, ocr: 'KA03MN9876' },
      { plate: '22BH1234AA', type: 'CAR' as VehicleType, ocr: '228H1234AA' },
      { plate: 'HR26DQ5551', type: 'CAR' as VehicleType, ocr: 'HR26DQ5551' }, // Blacklisted
      { plate: 'TN09AZ7788', type: 'CAR' as VehicleType, ocr: 'TN09AZ7788' }, // Unregistered
      { plate: 'UP32EF9900', type: 'AUTO_RICKSHAW' as VehicleType, ocr: 'UP32EF9900' },
      { plate: 'TS07KA4521', type: 'TRUCK' as VehicleType, ocr: 'TSO7KA4521' },
    ];

    const pick = plateOverride
      ? { plate: plateOverride, type: typeOverride || 'CAR', ocr: plateOverride }
      : candidatePlates[Math.floor(Math.random() * candidatePlates.length)];

    const parsed = parseAndNormalizeIndianPlate(pick.ocr);
    const normalized = parsed.normalizedPlate;

    // Check duplicate detection debounce
    const recentSamePlate = detections.find(
      (d) => d.normalizedPlate === normalized && isDuplicateDetection(d.timestamp, new Date().toISOString(), settings.duplicateSuppressionSeconds)
    );
    if (recentSamePlate) {
      console.log(`[ANPR] Suppressed duplicate detection for ${normalized} within ${settings.duplicateSuppressionSeconds}s window.`);
      return;
    }

    // Determine target mode
    const mode = targetGate || (Math.random() > 0.4 ? 'entry' : Math.random() > 0.5 ? 'exit' : 'road');
    
    // Check if vehicle is in registry
    const regVehicle = vehicles.find((v) => v.plateNumber === normalized);
    const isRegistered = Boolean(regVehicle);
    const isBlacklisted = regVehicle?.ownershipType === 'BLACKLISTED';

    const cam =
      mode === 'entry'
        ? cameras.find((c) => c.type === 'PARKING_ENTRY') || cameras[0]
        : mode === 'exit'
        ? cameras.find((c) => c.type === 'PARKING_EXIT') || cameras[1]
        : cameras.find((c) => c.type === 'ROAD_SURVEILLANCE') || cameras[2];

    const speed = mode === 'road' ? Math.floor(45 + Math.random() * 55) : Math.floor(5 + Math.random() * 15);
    const needsReview = parsed.confidenceScore < settings.anprConfidenceThreshold || !parsed.isValid;

    const newDetection: VehicleDetection = {
      id: `det-${Date.now()}`,
      cameraId: cam.id,
      cameraName: cam.name,
      timestamp: new Date().toISOString(),
      rawPlateText: pick.ocr,
      normalizedPlate: normalized,
      isPlateValid: parsed.isValid,
      confidenceScore: parsed.confidenceScore,
      vehicleType: pick.type,
      vehicleSpeedKmH: speed,
      vehicleBox: {
        x: Math.floor(25 + Math.random() * 20),
        y: Math.floor(30 + Math.random() * 15),
        width: Math.floor(35 + Math.random() * 15),
        height: Math.floor(40 + Math.random() * 15),
        confidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
        label: `${pick.type}`,
      },
      plateBox: {
        x: 44,
        y: 68,
        width: 14,
        height: 6,
        confidence: parsed.confidenceScore,
        label: 'IND HSRP Plate',
      },
      mode: mode === 'entry' ? 'PARKING_ENTRY' : mode === 'exit' ? 'PARKING_EXIT' : 'ROAD_MONITORING',
      isRegistered,
      registeredVehicleInfo: regVehicle,
      vehicleImageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      plateImageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=250&q=80',
      isReviewed: !needsReview,
      needsReview,
    };

    setDetections((prev) => [newDetection, ...prev.slice(0, 199)]);

    // Check Blacklist alert
    if (isBlacklisted) {
      setActiveAlert({
        type: 'DANGER',
        title: 'SECURITY ALERT: BLACKLISTED VEHICLE DETECTED',
        message: `Vehicle ${normalized} flagged as high security alert detected at ${cam.name}! Entry barred.`,
      });
      logAuditAction('VEHICLE_BLACKLISTED', `ALERT: Blacklisted vehicle ${normalized} detected at ${cam.name}`, normalized);
      return;
    }

    // Handle Parking Entry
    if (mode === 'entry') {
      const activeSession = parkingSessions.find((s) => s.normalizedPlate === normalized && s.status === 'ACTIVE');
      if (!activeSession) {
        // Allocate free slot
        const freeSlot = parkingSlots.find((s) => !s.isOccupied && (pick.type === 'MOTORCYCLE' ? s.category === 'MOTORCYCLE' : s.category === 'CAR'));
        const allocatedSlotNumber = freeSlot ? freeSlot.slotNumber : 'Overflow-01';

        const newSession: ParkingSession = {
          id: `sess-${Date.now()}`,
          vehiclePlate: normalized,
          normalizedPlate: normalized,
          vehicleType: pick.type,
          ownershipType: regVehicle?.ownershipType || 'VISITOR',
          ownerName: regVehicle?.ownerName || 'Visitor / Guest',
          department: regVehicle?.department || 'Visitor Reception',
          entryTime: new Date().toISOString(),
          entryCameraId: cam.id,
          entryGateName: cam.name,
          entryPlateImageUrl: newDetection.plateImageUrl,
          allocatedSlot: allocatedSlotNumber,
          status: 'ACTIVE',
        };

        setParkingSessions((prev) => [newSession, ...prev]);

        // Mark slot occupied
        if (freeSlot) {
          setParkingSlots((prev) =>
            prev.map((s) => (s.slotId === freeSlot.slotId ? { ...s, isOccupied: true, currentPlate: normalized } : s))
          );
        }

        // Auto open barrier if employee or visitor auto-open enabled
        if (isRegistered || settings.autoOpenBarrierForVisitors) {
          openBarrier('entry');
          setActiveAlert({
            type: 'SUCCESS',
            title: `Vehicle Entry Authorized: ${normalized}`,
            message: `${regVehicle ? `Employee ${regVehicle.ownerName}` : 'Visitor'} admitted. Slot assigned: ${allocatedSlotNumber}`,
          });
        } else {
          setActiveAlert({
            type: 'WARNING',
            title: `Visitor Vehicle Detected: ${normalized}`,
            message: `Unregistered visitor vehicle awaiting security barrier clearance at ${cam.name}.`,
          });
        }
      }
    }

    // Handle Parking Exit
    if (mode === 'exit') {
      const activeSession = parkingSessions.find((s) => s.normalizedPlate === normalized && s.status === 'ACTIVE');
      if (activeSession) {
        const exitTime = new Date().toISOString();
        const { totalMinutes } = calculateDuration(activeSession.entryTime, exitTime);
        const fee = calculateParkingFee(activeSession.entryTime, exitTime, activeSession.ownershipType as any, settings.visitorHourlyRate);

        setParkingSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  exitTime,
                  exitCameraId: cam.id,
                  exitGateName: cam.name,
                  exitPlateImageUrl: newDetection.plateImageUrl,
                  status: 'COMPLETED',
                  durationMinutes: totalMinutes,
                  feeInr: fee,
                  paidStatus: fee > 0 ? 'PAID' : 'WAIVED',
                }
              : s
          )
        );

        // Free slot
        setParkingSlots((prev) =>
          prev.map((s) => (s.currentPlate === normalized ? { ...s, isOccupied: false, currentPlate: undefined } : s))
        );

        openBarrier('exit');
        setActiveAlert({
          type: 'INFO',
          title: `Vehicle Exit Logged: ${normalized}`,
          message: `Dwell time: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m. Fee: ₹${fee}. Barrier opening.`,
        });
      }
    }
  };

  // Periodic simulation timer when simulator active
  useEffect(() => {
    if (!isSimulatorActive) return;
    const interval = setInterval(() => {
      // Pick random mode
      const modes: ('entry' | 'exit' | 'road')[] = ['road', 'road', 'entry', 'exit'];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      simulateVehicleArrival(undefined, undefined, randomMode);
    }, 18000); // Trigger every 18 seconds smoothly

    return () => clearInterval(interval);
  }, [isSimulatorActive, settings, vehicles, detections, parkingSessions, parkingSlots]);

  // Registry Actions
  const registerVehicle = (veh: Omit<RegisteredVehicle, 'id' | 'registeredAt'>) => {
    const parsed = parseAndNormalizeIndianPlate(veh.plateNumber);
    const newVeh: RegisteredVehicle = {
      ...veh,
      id: `veh-${Date.now()}`,
      plateNumber: parsed.normalizedPlate,
      registeredAt: new Date().toISOString(),
    };
    setVehicles((prev) => [newVeh, ...prev]);
    logAuditAction('VEHICLE_REGISTERED', `Registered new vehicle ${newVeh.plateNumber} to ${newVeh.ownerName}`, newVeh.id);
  };

  const updateVehicle = (id: string, updated: Partial<RegisteredVehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (target) {
      logAuditAction('VEHICLE_REGISTERED', `Removed vehicle registration for ${target.plateNumber}`, id);
    }
  };

  const toggleVehicleBlacklist = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const isNowBlacklisted = v.ownershipType !== 'BLACKLISTED';
          const newType = isNowBlacklisted ? 'BLACKLISTED' : 'VISITOR';
          logAuditAction('VEHICLE_BLACKLISTED', `${isNowBlacklisted ? 'Blacklisted' : 'Un-blacklisted'} vehicle ${v.plateNumber}`, id);
          return { ...v, ownershipType: newType };
        }
        return v;
      })
    );
  };

  // Camera Actions
  const addCamera = (cam: Omit<Camera, 'id' | 'latencyMs' | 'lastPing'>) => {
    const newCam: Camera = {
      ...cam,
      id: `cam-${Date.now()}`,
      latencyMs: Math.floor(25 + Math.random() * 20),
      lastPing: 'Just now',
    };
    setCameras((prev) => [...prev, newCam]);
    logAuditAction('CAMERA_CONFIG_UPDATED', `Added new camera ${newCam.name} (${newCam.type})`, newCam.id);
  };

  const updateCamera = (id: string, partial: Partial<Camera>) => {
    setCameras((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
    logAuditAction('CAMERA_CONFIG_UPDATED', `Updated camera settings for ID ${id}`, id);
  };

  const deleteCamera = (id: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
    logAuditAction('CAMERA_CONFIG_UPDATED', `Deleted camera ID ${id}`, id);
  };

  const toggleCameraProcessing = (id: string) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isProcessing: !c.isProcessing } : c))
    );
  };

  const testCameraPing = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCameras((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'ONLINE', latencyMs: Math.floor(20 + Math.random() * 15), lastPing: 'Just now' } : c))
        );
        resolve(true);
      }, 700);
    });
  };

  // Detection Manual Review
  const correctPlateDetection = (detectionId: string, correctedPlate: string, note?: string) => {
    const parsed = parseAndNormalizeIndianPlate(correctedPlate);
    setDetections((prev) =>
      prev.map((d) =>
        d.id === detectionId
          ? {
              ...d,
              manualOverridePlate: parsed.normalizedPlate,
              normalizedPlate: parsed.normalizedPlate,
              isReviewed: true,
              needsReview: false,
              reviewedBy: currentUser?.name || 'Operator',
              reviewNotes: note || 'Manually verified by operator',
            }
          : d
      )
    );
    logAuditAction('MANUAL_PLATE_CORRECTION', `Manually corrected detection ${detectionId} to ${parsed.normalizedPlate}: ${note || ''}`, detectionId);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAuditAction('SETTINGS_CHANGED', 'Updated ANPR system operational settings');
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const u: User = { ...newUser, id: `usr-${Date.now()}` };
    logAuditAction('SETTINGS_CHANGED', `Created user account ${u.name} (${u.role})`, u.id);
  };

  const updateUserStatus = (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    logAuditAction('SETTINGS_CHANGED', `Changed user status for ID ${id} to ${status}`, id);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentPage,
        theme,
        toggleTheme,
        setCurrentPage,
        login,
        logout,
        cameras,
        vehicles,
        parkingSessions,
        parkingSlots,
        detections,
        auditLogs,
        settings,
        entryBarrierState,
        exitBarrierState,
        openBarrier,
        closeBarrier,
        isSimulatorActive,
        toggleSimulator,
        simulateVehicleArrival,
        registerVehicle,
        updateVehicle,
        deleteVehicle,
        toggleVehicleBlacklist,
        addCamera,
        updateCamera,
        deleteCamera,
        toggleCameraProcessing,
        testCameraPing,
        correctPlateDetection,
        updateSettings,
        addUser,
        updateUserStatus,
        activeAlert,
        clearAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

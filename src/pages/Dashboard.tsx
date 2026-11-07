import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CameraFeedCanvas } from '../components/common/CameraFeedCanvas';
import { PlateBadge } from '../components/common/PlateBadge';
import { ManualReviewModal } from '../components/common/ManualReviewModal';
import { VehicleDetection } from '../types';
import { computeOccupancy } from '../utils/parkingLogic';
import {
  Car,
  TrendingUp,
  Clock,
  ShieldCheck,
  Video,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Radio,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    detections,
    parkingSessions,
    parkingSlots,
    cameras,
    vehicles,
    setCurrentPage,
    simulateVehicleArrival,
  } = useApp();

  const [selectedDetection, setSelectedDetection] = useState<VehicleDetection | null>(null);

  // Stats computation
  const activeParkedCount = parkingSessions.filter((s) => s.status === 'ACTIVE').length;
  const completedTodayCount = parkingSessions.filter((s) => s.status === 'COMPLETED').length;
  const totalEntriesToday = activeParkedCount + completedTodayCount;
  const registeredCount = vehicles.length;
  const unknownCount = detections.filter((d) => !d.isRegistered).length;
  const roadDetectionsCount = detections.filter((d) => d.mode === 'ROAD_MONITORING').length;
  const onlineCams = cameras.filter((c) => c.status === 'ONLINE').length;

  const occupancy = computeOccupancy(parkingSlots.length, activeParkedCount);

  // Pick primary entry gate camera for live preview
  const primaryCam = cameras.find((c) => c.type === 'PARKING_ENTRY') || cameras[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Enterprise ANPR Command Hub</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              LIVE SYSTEM
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automatic number plate recognition & surveillance telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentPage('office_parking')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Open Parking Gate</span>
          </button>
          <button
            onClick={() => setCurrentPage('road_detection')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Road Mode View</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Currently Parked */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Currently Parked</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{activeParkedCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {parkingSlots.length} slots</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                occupancy.status === 'FULL'
                  ? 'bg-red-500'
                  : occupancy.status === 'NEAR_FULL'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancy.percentage}%` }}
            ></div>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{occupancy.percentage}% Occupancy</span>
            <span className="text-emerald-400">{occupancy.available} Available</span>
          </div>
        </div>

        {/* Card 2: Today's Gate Entries */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Entries Today</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalEntriesToday}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              +14% vs yesterday
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Exits: {completedTodayCount}</span>
            <span>Net Delta: +{activeParkedCount}</span>
          </div>
        </div>

        {/* Card 3: Road Detections */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Road Moving Vehicles</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{roadDetectionsCount}</span>
            <span className="text-xs text-indigo-400 font-mono">Real-time Stream</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Avg Speed: 64 km/h</span>
            <span className="text-sky-400">Highway Ring Road</span>
          </div>
        </div>

        {/* Card 4: CCTV Network Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Camera Network</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{onlineCams}</span>
            <span className="text-xs text-slate-400 font-mono">/ {cameras.length} Active</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> 100% Stream Health
            </span>
            <span>Avg 32ms</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Camera Stream + Live Detection Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Camera Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-sky-400" />
              <span>Primary ANPR Feed ({primaryCam.name})</span>
            </h2>
            <button
              onClick={() => setCurrentPage('live_cameras')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>Multi-Matrix View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <CameraFeedCanvas
            camera={primaryCam}
            heightClass="h-[360px]"
            showControls={true}
          />
        </div>

        {/* Right 1 Col: Live Detection Stream */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Recent Plate Detections</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {detections.length} Total Captured
            </span>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 max-h-[415px] overflow-y-auto">
            {detections.slice(0, 7).map((det) => (
              <div
                key={det.id}
                onClick={() => setSelectedDetection(det)}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                  det.needsReview
                    ? 'bg-amber-950/20 border-amber-800/60 hover:bg-amber-900/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PlateBadge plateNumber={det.normalizedPlate} size="sm" />
                    {det.needsReview && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Review
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="font-medium text-slate-300">{det.vehicleType}</span>
                    <span>•</span>
                    <span>{new Date(det.timestamp).toLocaleTimeString('en-IN', { hour12: false })}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">{Math.round(det.confidenceScore * 100)}%</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      det.mode === 'PARKING_ENTRY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : det.mode === 'PARKING_EXIT'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {det.mode === 'PARKING_ENTRY' ? 'ENTRY' : det.mode === 'PARKING_EXIT' ? 'EXIT' : 'ROAD'}
                  </span>
                  <div className="text-[9px] text-slate-400 truncate max-w-[100px] mt-1 font-mono">
                    {det.cameraName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parking Occupancy Zone Visualizer */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-400" />
              <span>Real-time Parking Slot Allocation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Zone A (Executive), Zone B (Two-Wheelers), Zone C (Visitors), EV Charging Bays
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-800 border border-slate-600"></span> Available
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span> Reserved/EV
            </span>
          </div>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2.5">
          {parkingSlots.map((slot) => (
            <div
              key={slot.slotId}
              className={`p-2 rounded-lg border text-center transition ${
                slot.isOccupied
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold font-mono">{slot.slotNumber}</div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                {slot.category}
              </div>
              <div className="mt-1 font-mono text-[10px] truncate">
                {slot.isOccupied && slot.currentPlate ? (
                  <span className="text-white font-bold bg-slate-900 px-1 py-0.5 rounded text-[8px] border border-slate-700">
                    {slot.currentPlate}
                  </span>
                ) : (
                  <span className="text-slate-400">FREE</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Review Modal if Selected */}
      {selectedDetection && (
        <ManualReviewModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
        />
      )}
    </div>
  );
};

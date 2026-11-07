import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CameraFeedCanvas } from '../components/common/CameraFeedCanvas';
import { PlateBadge } from '../components/common/PlateBadge';
import { ManualReviewModal } from '../components/common/ManualReviewModal';
import { VehicleDetection, VehicleType } from '../types';
import {
  Radio,
  Gauge,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Camera,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const RoadDetection: React.FC = () => {
  const { detections, cameras, settings, updateSettings, simulateVehicleArrival } = useApp();

  const [selectedCamId, setSelectedCamId] = useState<string>(
    cameras.find((c) => c.type === 'ROAD_SURVEILLANCE')?.id || cameras[0].id
  );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedDetectionForReview, setSelectedDetectionForReview] = useState<VehicleDetection | null>(null);

  const activeCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  const roadDetections = detections.filter(
    (d) => d.mode === 'ROAD_MONITORING' && (selectedTypeFilter === 'ALL' || d.vehicleType === selectedTypeFilter)
  );

  const speedViolationsCount = detections.filter(
    (d) => d.mode === 'ROAD_MONITORING' && d.vehicleSpeedKmH && d.vehicleSpeedKmH > 80
  ).length;

  const uncertainDetectionsCount = detections.filter(
    (d) => d.mode === 'ROAD_MONITORING' && d.needsReview
  ).length;

  const handleSimulateSpeedVehicle = (type: VehicleType = 'CAR') => {
    simulateVehicleArrival(undefined, type, 'road');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <span>Outdoor Road & Moving Vehicle Surveillance Mode</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            High-speed multi-lane ANPR telemetry, speed estimation radar, and OCR confidence validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCamId}
            onChange={(e) => setSelectedCamId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {cameras
              .filter((c) => c.type.includes('ROAD') || c.type.includes('HIGHWAY'))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.resolution})
                </option>
              ))}
          </select>

          <button
            onClick={() => handleSimulateSpeedVehicle()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Drive-By</span>
          </button>
        </div>
      </div>

      {/* Road Telemetry Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Moving Vehicles</span>
          <div className="text-xl font-bold text-white mt-1 font-mono">{roadDetections.length}</div>
          <div className="text-[10px] text-indigo-400 font-mono mt-1">Telemetry stream live</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Speed Limit Violations (&gt;80 km/h)</span>
          <div className="text-xl font-bold text-red-400 mt-1 font-mono">{speedViolationsCount}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Outer Ring Road Km 14</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Uncertain Plate Flagged</span>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{uncertainDetectionsCount}</div>
          <div className="text-[10px] text-amber-300 font-mono mt-1">Pending review</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">YOLO Confidence Gate</span>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            {Math.round(settings.anprConfidenceThreshold * 100)}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">PaddleOCR-IN-v4 tuned</div>
        </div>
      </div>

      {/* Camera Live Stream + Detection Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CameraFeedCanvas
            camera={activeCam}
            heightClass="h-[420px]"
            showControls={true}
            onDetectVehicle={() => handleSimulateSpeedVehicle()}
          />

          {/* Quick Engine Fine-Tuning Slider */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-white">OCR Confidence Acceptance Threshold:</span>
                <span className="ml-2 font-mono font-bold text-indigo-400">
                  {Math.round(settings.anprConfidenceThreshold * 100)}%
                </span>
                <p className="text-[11px] text-slate-400">
                  Readings below this value are automatically routed to the operator review drawer.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">50%</span>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={settings.anprConfidenceThreshold}
                onChange={(e) => updateSettings({ anprConfidenceThreshold: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400">95%</span>
            </div>
          </div>
        </div>

        {/* Right: Live Detection Stream with Speed Radar & Crops */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Real-Time Stream Feed</span>
            </h3>

            {/* Filter by vehicle type */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="text-[11px] font-mono bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300"
            >
              <option value="ALL">All Classes</option>
              <option value="CAR">Cars & SUVs</option>
              <option value="MOTORCYCLE">Bikes</option>
              <option value="AUTO_RICKSHAW">Auto</option>
              <option value="TRUCK">Trucks</option>
            </select>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3 max-h-[500px] overflow-y-auto">
            {roadDetections.slice(0, 10).map((det) => (
              <div
                key={det.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <PlateBadge plateNumber={det.normalizedPlate} size="sm" />
                  <div className="flex items-center gap-2">
                    {det.vehicleSpeedKmH && (
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          det.vehicleSpeedKmH > 80
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {det.vehicleSpeedKmH} km/h
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-emerald-400">
                      {Math.round(det.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Cropped Plate vs Raw OCR */}
                <div className="flex items-center gap-3">
                  <div className="w-20 h-10 bg-black rounded border border-slate-800 overflow-hidden shrink-0">
                    <img
                      src={det.plateImageUrl}
                      alt="Plate crop"
                      className="w-full h-full object-contain filter contrast-125"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5 truncate">
                    <div>
                      Raw OCR: <span className="font-mono text-amber-300 font-bold">{det.rawPlateText}</span>
                    </div>
                    <div>
                      Class: <span className="text-white font-medium">{det.vehicleType}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(det.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                    </div>
                  </div>
                </div>

                {/* Review status / action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span
                    className={`text-[10px] font-mono ${
                      det.needsReview ? 'text-amber-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {det.needsReview ? '⚠️ Flagged for Operator Verification' : '✓ Verified Standard'}
                  </span>

                  <button
                    onClick={() => setSelectedDetectionForReview(det)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer"
                  >
                    Review & Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Review Modal if Active */}
      {selectedDetectionForReview && (
        <ManualReviewModal
          detection={selectedDetectionForReview}
          onClose={() => setSelectedDetectionForReview(null)}
        />
      )}
    </div>
  );
};

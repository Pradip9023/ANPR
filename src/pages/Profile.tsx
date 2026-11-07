import React from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, Shield, HardDrive, Cpu, Database, CheckCircle2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, cameras, detections, vehicles, parkingSessions } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-sky-400" />
          <span>Operator Profile & Edge System Telemetry</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Active session identity, AI inference model versions, and hardware device status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={currentUser?.avatarUrl}
              alt={currentUser?.name}
              className="w-20 h-20 rounded-full border-2 border-sky-500 object-cover shadow-xl"
            />
            <div>
              <h2 className="text-base font-bold text-white">{currentUser?.name}</h2>
              <div className="text-xs font-mono text-sky-400">{currentUser?.email}</div>
              <span className="inline-block mt-2 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 uppercase font-bold">
                Role: {currentUser?.role}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Station IP:</span>
              <span className="text-slate-200">192.168.1.10</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>2FA Authentication:</span>
              <span className="text-emerald-400">ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Right 2 cols: System & Model Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Models Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">AI Vision & OCR Pipelines</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">VEHICLE & PLATE DETECTOR</span>
                <div className="font-bold text-white text-sm">YOLOv8-IndianVehicles-Large</div>
                <div className="text-[11px] text-emerald-400 mt-1">Inference latency: 8.2 ms</div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">CHARACTER RECOGNITION</span>
                <div className="font-bold text-white text-sm">PaddleOCR-IN-v4 (Mobile)</div>
                <div className="text-[11px] text-sky-400 mt-1">MoRTH Indian Font Tuned</div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">IMAGE PROCESSING</span>
                <div className="font-bold text-white text-sm">OpenCV 4.10.0 + CUDA</div>
                <div className="text-[11px] text-slate-400 mt-1">Adaptive CLAHE & Denoising</div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">NORMALIZATION ENGINE</span>
                <div className="font-bold text-white text-sm">Garuda Indian State Parser v2.4</div>
                <div className="text-[11px] text-emerald-400 mt-1">36 States + BH Series Disambiguation</div>
              </div>
            </div>
          </div>

          {/* Database & Storage Telemetry */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Database & Storage Metrics</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">TOTAL DETECTIONS</span>
                <div className="text-base font-bold text-white">{detections.length}</div>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">REGISTERED FLEET</span>
                <div className="text-base font-bold text-white">{vehicles.length}</div>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">PARKING SESSIONS</span>
                <div className="text-base font-bold text-white">{parkingSessions.length}</div>
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
                <span className="text-slate-500 text-[10px]">STORAGE USAGE</span>
                <div className="text-base font-bold text-emerald-400">1.4 GB / 500 GB</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

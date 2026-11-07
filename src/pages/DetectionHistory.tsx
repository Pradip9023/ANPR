import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlateBadge } from '../components/common/PlateBadge';
import { ManualReviewModal } from '../components/common/ManualReviewModal';
import { VehicleDetection } from '../types';
import { exportToCSV } from '../utils/exportUtils';
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  Eye,
  Sliders,
  Calendar,
} from 'lucide-react';

export const DetectionHistory: React.FC = () => {
  const { detections, cameras } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCameraFilter, setSelectedCameraFilter] = useState<string>('ALL');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('ALL');
  const [onlyReviewNeeded, setOnlyReviewNeeded] = useState<boolean>(false);
  const [reviewModalDetection, setReviewModalDetection] = useState<VehicleDetection | null>(null);

  const filteredDetections = detections.filter((det) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      det.normalizedPlate.toLowerCase().includes(q) ||
      det.rawPlateText.toLowerCase().includes(q) ||
      det.cameraName.toLowerCase().includes(q) ||
      det.vehicleType.toLowerCase().includes(q);

    const matchesCam = selectedCameraFilter === 'ALL' || det.cameraId === selectedCameraFilter;
    const matchesMode = selectedModeFilter === 'ALL' || det.mode === selectedModeFilter;
    const matchesReview = onlyReviewNeeded ? det.needsReview : true;

    return matchesSearch && matchesCam && matchesMode && matchesReview;
  });

  const handleExportCSV = () => {
    const rows = filteredDetections.map((d) => ({
      'Detection ID': d.id,
      'Timestamp (IST)': new Date(d.timestamp).toLocaleString('en-IN'),
      'Normalized Plate': d.normalizedPlate,
      'Raw OCR Prediction': d.rawPlateText,
      'Confidence Score': `${Math.round(d.confidenceScore * 100)}%`,
      'Camera Source': d.cameraName,
      'Surveillance Mode': d.mode,
      'Vehicle Classification': d.vehicleType,
      'Speed (km/h)': d.vehicleSpeedKmH || 'N/A',
      'Operator Reviewed': d.isReviewed ? 'Yes' : 'Pending',
      'Review Note': d.reviewNotes || 'N/A',
    }));
    exportToCSV(`Detection_Log_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            <span>Surveillance Detection Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanent forensic detection logs with raw OCR vs normalized plate comparisons & image crops
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Detections CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate, OCR text, camera..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCameraFilter}
            onChange={(e) => setSelectedCameraFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
          >
            <option value="ALL">All Cameras</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedModeFilter}
            onChange={(e) => setSelectedModeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
          >
            <option value="ALL">All Modes</option>
            <option value="PARKING_ENTRY">Parking Entry</option>
            <option value="PARKING_EXIT">Parking Exit</option>
            <option value="ROAD_MONITORING">Road Surveillance</option>
          </select>

          <button
            onClick={() => setOnlyReviewNeeded((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
              onlyReviewNeeded
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Uncertain Plates Only</span>
          </button>
        </div>
      </div>

      {/* Detection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDetections.map((det) => (
          <div
            key={det.id}
            className={`rounded-xl border p-4 space-y-3 transition flex flex-col justify-between ${
              det.needsReview
                ? 'bg-amber-950/10 border-amber-800/60 shadow-amber-900/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <PlateBadge plateNumber={det.normalizedPlate} size="sm" />
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    det.confidenceScore >= 0.85
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {Math.round(det.confidenceScore * 100)}% Conf
                </span>
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-2 h-24">
                <div className="bg-black rounded-lg border border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={det.plateImageUrl}
                    alt="Cropped Plate"
                    className="max-h-full max-w-full object-contain filter contrast-125"
                  />
                </div>
                <div className="bg-black rounded-lg border border-slate-800 overflow-hidden">
                  <img
                    src={det.vehicleImageUrl}
                    alt="Vehicle frame"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Meta details */}
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Raw OCR:</span>
                  <span className="text-amber-300 font-bold">{det.rawPlateText}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera:</span>
                  <span className="text-white truncate max-w-[160px]">{det.cameraName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-slate-300">{new Date(det.timestamp).toLocaleTimeString('en-IN')}</span>
                </div>
                {det.vehicleSpeedKmH && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Speed:</span>
                    <span className="text-sky-400 font-bold">{det.vehicleSpeedKmH} km/h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span
                className={`text-[10px] font-mono ${
                  det.isReviewed ? 'text-emerald-400' : 'text-amber-400 font-bold'
                }`}
              >
                {det.isReviewed ? '✓ Verified' : '⚠️ Pending Review'}
              </span>

              <button
                onClick={() => setReviewModalDetection(det)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded text-xs font-semibold transition"
              >
                Inspect / Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviewModalDetection && (
        <ManualReviewModal
          detection={reviewModalDetection}
          onClose={() => setReviewModalDetection(null)}
        />
      )}
    </div>
  );
};

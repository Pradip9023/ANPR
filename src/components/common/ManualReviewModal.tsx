import React, { useState } from 'react';
import { VehicleDetection } from '../../types';
import { useApp } from '../../context/AppContext';
import { PlateBadge } from './PlateBadge';
import { INDIAN_STATE_CODES, parseAndNormalizeIndianPlate } from '../../utils/plateParser';
import { Check, X, AlertTriangle, Edit3, Image, ShieldCheck } from 'lucide-react';

interface ManualReviewModalProps {
  detection: VehicleDetection | null;
  onClose: () => void;
}

export const ManualReviewModal: React.FC<ManualReviewModalProps> = ({ detection, onClose }) => {
  const { correctPlateDetection } = useApp();

  const [inputPlate, setInputPlate] = useState<string>(detection?.normalizedPlate || '');
  const [reviewNote, setReviewNote] = useState<string>('');

  if (!detection) return null;

  const previewAnalysis = parseAndNormalizeIndianPlate(inputPlate);

  const handleSave = () => {
    if (!inputPlate.trim()) return;
    correctPlateDetection(detection.id, inputPlate.trim().toUpperCase(), reviewNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Manual Plate Verification & Correction</h3>
              <p className="text-xs text-slate-400">
                Camera: {detection.cameraName} • ID: {detection.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Images Section: Crop & Vehicle Context */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Image className="w-3.5 h-3.5" /> High-Res Plate Crop
              </span>
              <div className="h-28 bg-black rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={detection.plateImageUrl}
                  alt="Cropped number plate"
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Vehicle Overview Frame
              </span>
              <div className="h-28 bg-black rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
                <img
                  src={detection.vehicleImageUrl}
                  alt="Vehicle contextual frame"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* OCR Raw vs Current */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Raw OCR Prediction:</span>
              <span className="font-mono text-sm text-amber-300 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                {detection.rawPlateText}
              </span>
              <div className="mt-2 text-xs text-slate-400">
                Confidence: <span className="font-bold text-white">{Math.round(detection.confidenceScore * 100)}%</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Normalized Indian Plate:</span>
              <PlateBadge plateNumber={detection.normalizedPlate} size="sm" />
              <div className="mt-2 text-xs text-slate-400">
                Format: <span className="text-sky-400 font-medium">{detection.isPlateValid ? 'Valid Indian Format' : 'Uncertain Format'}</span>
              </div>
            </div>
          </div>

          {/* Operator Correction Form */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Correct Vehicle Registration Number (Uppercase):
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputPlate}
                onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
                placeholder="e.g. GJ01AB1234 or 22BH1234AA"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                {inputPlate.length} chars
              </span>
            </div>

            {/* Live Normalization Preview */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Preview Result:</span>
                <PlateBadge plateNumber={previewAnalysis.normalizedPlate} size="md" />
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Identified State:</span>
                <span className="text-xs font-medium text-emerald-400">
                  {previewAnalysis.stateName || 'All-India / BH Series'}
                </span>
              </div>
            </div>

            {/* Correction Reason Note */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Audit Log Reason / Notes (Optional):
              </label>
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. Corrected character 'S' to '5' due to road mud obstruction"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!inputPlate.trim()}
            className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Update Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

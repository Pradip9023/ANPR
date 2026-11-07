import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SystemSettings } from '../types';
import { Settings as SettingsIcon, Save, Shield, Sliders, Cpu, Bell, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState<SystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-sky-400" />
            <span>ANPR Engine & Gate Operational Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure YOLO inference pipeline, Indian plate OCR rules, barrier timing, and duplicate suppression
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: AI & ANPR OCR Pipeline */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Computer Vision & OCR Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Confidence Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-200">
                  Acceptance Confidence Threshold:
                </label>
                <span className="font-mono text-sky-400 font-bold">
                  {Math.round(form.anprConfidenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={form.anprConfidenceThreshold}
                onChange={(e) => setForm({ ...form, anprConfidenceThreshold: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                OCR readings with lower confidence are held in the operator review queue.
              </p>
            </div>

            {/* Frame Skip Rate */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-200 block">
                Inference Frame Skip Rate (CPU Optimization):
              </label>
              <select
                value={form.frameSkipRate}
                onChange={(e) => setForm({ ...form, frameSkipRate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              >
                <option value="1">Process Every Frame (1:1 - High GPU)</option>
                <option value="2">Process 1 in 2 Frames (Balanced Default)</option>
                <option value="3">Process 1 in 3 Frames (Low Hardware Load)</option>
                <option value="5">Process 1 in 5 Frames (Extreme Power Saver)</option>
              </select>
            </div>

            {/* Duplicate Suppression Window */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-200 block">
                Duplicate Detection Suppression Time (Seconds):
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={form.duplicateSuppressionSeconds}
                onChange={(e) => setForm({ ...form, duplicateSuppressionSeconds: parseInt(e.target.value) || 45 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Prevents repeated camera frames of the same idling vehicle from creating multiple records.
              </p>
            </div>

            {/* Indian Plate Strict Regex Validation */}
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold">
                <input
                  type="checkbox"
                  checked={form.enforceIndianPlateRegex}
                  onChange={(e) => setForm({ ...form, enforceIndianPlateRegex: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <span>Enforce Indian MoRTH Plate Syntax Normalization</span>
              </label>
              <p className="text-[11px] text-slate-400 pl-6">
                Validates against 36 State/UT codes and BH Series (Bharat Series).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Gate & Parking Operations */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Boom Barrier & Parking Tariff Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold">
                <input
                  type="checkbox"
                  checked={form.autoOpenBarrierForEmployees}
                  onChange={(e) => setForm({ ...form, autoOpenBarrierForEmployees: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <span>Auto-Open Barrier for Registered Employees / VIPs</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-semibold">
                <input
                  type="checkbox"
                  checked={form.autoOpenBarrierForVisitors}
                  onChange={(e) => setForm({ ...form, autoOpenBarrierForVisitors: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <span>Auto-Open Barrier for Visitors (Unregistered)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Visitor Free Grace (Mins):</label>
                <input
                  type="number"
                  value={form.visitorFreeMinutes}
                  onChange={(e) => setForm({ ...form, visitorFreeMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Visitor Rate (₹/Hour):</label>
                <input
                  type="number"
                  value={form.visitorHourlyRate}
                  onChange={(e) => setForm({ ...form, visitorHourlyRate: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

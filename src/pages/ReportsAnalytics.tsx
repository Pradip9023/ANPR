import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  Car,
  Clock,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { detections, parkingSessions, vehicles } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  // Compute Indian State distribution from detections
  const stateCounts: Record<string, number> = {};
  detections.forEach((d) => {
    const state = d.normalizedPlate.substring(0, 2);
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  const sortedStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);

  // Hourly traffic estimation
  const hourlyTraffic = [
    { hour: '06:00', count: 4 },
    { hour: '08:00', count: 18 },
    { hour: '09:00', count: 42 },
    { hour: '10:00', count: 36 },
    { hour: '12:00', count: 15 },
    { hour: '14:00', count: 19 },
    { hour: '17:00', count: 38 },
    { hour: '18:00', count: 45 },
    { hour: '20:00', count: 12 },
  ];

  const maxTraffic = Math.max(...hourlyTraffic.map((h) => h.count));

  // Vehicle class breakdown
  const classBreakdown = {
    Cars: detections.filter((d) => d.vehicleType === 'CAR').length,
    Motorcycles: detections.filter((d) => d.vehicleType === 'MOTORCYCLE').length,
    Commercial: detections.filter((d) => d.vehicleType === 'TRUCK' || d.vehicleType === 'BUS').length,
    Autos: detections.filter((d) => d.vehicleType === 'AUTO_RICKSHAW').length,
  };

  const handleExportFullReport = (format: 'CSV' | 'EXCEL') => {
    const rows = detections.map((d) => ({
      'Detection ID': d.id,
      'Timestamp (IST)': new Date(d.timestamp).toLocaleString('en-IN'),
      'Normalized Plate': d.normalizedPlate,
      'State Code': d.normalizedPlate.substring(0, 2),
      'Vehicle Class': d.vehicleType,
      'Confidence (%)': Math.round(d.confidenceScore * 100),
      Speed: d.vehicleSpeedKmH ? `${d.vehicleSpeedKmH} km/h` : 'N/A',
      Camera: d.cameraName,
      Mode: d.mode,
      Registered: d.isRegistered ? 'Yes' : 'No',
    }));

    if (format === 'CSV') {
      exportToCSV(`ANPR_Comprehensive_Report_${reportPeriod}`, rows);
    } else {
      exportToExcel(`ANPR_Comprehensive_Report_${reportPeriod}`, rows, 'Analytics Data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>ANPR Intelligence & Traffic Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical breakdown of vehicle registrations, peak entry hours, and regional state distributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-mono">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setReportPeriod(p)}
                className={`px-3 py-1 rounded font-medium transition ${
                  reportPeriod === p ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleExportFullReport('CSV')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Report</span>
          </button>

          <button
            onClick={() => handleExportFullReport('EXCEL')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (XLS)</span>
          </button>
        </div>
      </div>

      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Heatmap / Bar Chart */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Peak Traffic Ingress Profile (Today)</span>
              </h3>
              <p className="text-xs text-slate-400">Peak rush observed between 09:00 - 10:00 & 17:30 - 18:30</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Peak: 45 veh/hr
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {hourlyTraffic.map((bar) => {
              const heightPct = Math.round((bar.count / maxTraffic) * 100);
              return (
                <div key={bar.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    {bar.count}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-sky-600 to-indigo-500 rounded-t-md hover:brightness-125 transition-all"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-[10px] font-mono text-slate-400">{bar.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle Classification Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Vehicle Classification Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">Class distribution recognized by YOLOv8</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {Object.entries(classBreakdown).map(([label, count]) => {
              const total = Object.values(classBreakdown).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>{label}</span>
                    <span className="font-bold text-white">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400">
            Total Recognized: <span className="font-mono text-white font-bold">{detections.length} vehicles</span>
          </div>
        </div>
      </div>

      {/* Indian State Distribution */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Indian State Registration Distribution</span>
          </h3>
          <p className="text-xs text-slate-400">
            Vehicle origin analysis based on normalized RTO 2-letter state codes
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {sortedStates.map(([code, count]) => (
            <div
              key={code}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="text-sm font-bold text-sky-400">{code}</span>
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {code === 'GJ'
                  ? 'Gujarat'
                  : code === 'MH'
                  ? 'Maharashtra'
                  : code === 'DL'
                  ? 'Delhi'
                  : code === 'KA'
                  ? 'Karnataka'
                  : code === 'UP'
                  ? 'Uttar Pradesh'
                  : code === 'HR'
                  ? 'Haryana'
                  : code === '22'
                  ? 'BH Series'
                  : 'Other State'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

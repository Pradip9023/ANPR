import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlateBadge } from '../components/common/PlateBadge';
import { calculateDuration } from '../utils/parkingLogic';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import {
  Clock,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  DollarSign,
  Filter,
} from 'lucide-react';

export const ParkingHistory: React.FC = () => {
  const { parkingSessions } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredSessions = parkingSessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.normalizedPlate.toLowerCase().includes(q) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      s.allocatedSlot.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = parkingSessions
    .filter((s) => s.status === 'COMPLETED' && s.feeInr)
    .reduce((sum, s) => sum + (s.feeInr || 0), 0);

  const handleExportCSV = () => {
    const rows = filteredSessions.map((s) => ({
      'Session ID': s.id,
      'Registration Plate': s.normalizedPlate,
      'Vehicle Type': s.vehicleType,
      'Ownership Class': s.ownershipType,
      'Owner / Visitor': s.ownerName || 'Visitor',
      'Department / Purpose': s.department || 'N/A',
      'Slot Occupied': s.allocatedSlot,
      'Entry Time (IST)': new Date(s.entryTime).toLocaleString('en-IN'),
      'Exit Time (IST)': s.exitTime ? new Date(s.exitTime).toLocaleString('en-IN') : 'Still Active',
      'Duration (Mins)': s.durationMinutes || calculateDuration(s.entryTime).totalMinutes,
      'Parking Fee (INR)': s.feeInr || 0,
      'Payment Status': s.paidStatus || 'N/A',
      'Session State': s.status,
    }));
    exportToCSV(`Parking_History_Report_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filteredSessions.map((s) => ({
      'Session ID': s.id,
      'Registration Plate': s.normalizedPlate,
      'Vehicle Type': s.vehicleType,
      'Ownership Class': s.ownershipType,
      'Owner / Visitor': s.ownerName || 'Visitor',
      'Slot Occupied': s.allocatedSlot,
      'Entry Time (IST)': new Date(s.entryTime).toLocaleString('en-IN'),
      'Exit Time (IST)': s.exitTime ? new Date(s.exitTime).toLocaleString('en-IN') : 'Still Active',
      'Parking Fee (INR)': s.feeInr || 0,
      'Session State': s.status,
    }));
    exportToExcel(`Parking_History_Report_${new Date().toISOString().slice(0, 10)}`, rows, 'Parking History');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>Complete Parking Sessions Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical logs of all vehicle entries, exits, dwell times, and collected revenues
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Recorded Sessions</span>
          <div className="text-xl font-bold text-white mt-1 font-mono">{parkingSessions.length}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Currently Parked</span>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            {parkingSessions.filter((s) => s.status === 'ACTIVE').length}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Completed Exits</span>
          <div className="text-xl font-bold text-sky-400 mt-1 font-mono">
            {parkingSessions.filter((s) => s.status === 'COMPLETED').length}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Collected Revenue</span>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">₹{totalRevenue}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate, owner, department, slot..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
          >
            <option value="ALL">All Session States</option>
            <option value="ACTIVE">Currently Active</option>
            <option value="COMPLETED">Completed Checkout</option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Registration Plate</th>
              <th className="px-4 py-3">Owner / Purpose</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Entry Time</th>
              <th className="px-4 py-3">Exit Time</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Fee (INR)</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredSessions.map((session) => {
              const duration = session.durationMinutes
                ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
                : calculateDuration(session.entryTime).formattedDuration;

              return (
                <tr key={session.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3">
                    <PlateBadge plateNumber={session.normalizedPlate} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{session.ownerName || 'Visitor'}</div>
                    <div className="text-[10px] text-slate-400">{session.department || 'General'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {session.ownershipType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-sky-400">
                    {session.allocatedSlot}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {new Date(session.entryTime).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {session.exitTime
                      ? new Date(session.exitTime).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                    {duration}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    ₹{session.feeInr ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        session.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

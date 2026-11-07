import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CameraFeedCanvas } from '../components/common/CameraFeedCanvas';
import { PlateBadge } from '../components/common/PlateBadge';
import { ManualReviewModal } from '../components/common/ManualReviewModal';
import { ParkingSession, VehicleDetection, VehicleType } from '../types';
import { calculateDuration, calculateParkingFee } from '../utils/parkingLogic';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import {
  Building2,
  Car,
  KeyRound,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  CreditCard,
  Sliders,
  ChevronRight,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';

export const OfficeParking: React.FC = () => {
  const {
    parkingSessions,
    cameras,
    vehicles,
    entryBarrierState,
    exitBarrierState,
    openBarrier,
    closeBarrier,
    simulateVehicleArrival,
    settings,
  } = useApp();

  const [activeLaneTab, setActiveLaneTab] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSessionReview, setSelectedSessionReview] = useState<VehicleDetection | null>(null);

  // New Visitor Form state
  const [visitorPlate, setVisitorPlate] = useState<string>('');
  const [visitorName, setVisitorName] = useState<string>('');
  const [visitorMobile, setVisitorMobile] = useState<string>('');
  const [visitorType, setVisitorType] = useState<VehicleType>('CAR');
  const [showVisitorModal, setShowVisitorModal] = useState<boolean>(false);

  const entryCam = cameras.find((c) => c.type === 'PARKING_ENTRY') || cameras[0];
  const exitCam = cameras.find((c) => c.type === 'PARKING_EXIT') || cameras[1];

  const activeSessions = parkingSessions.filter((s) => s.status === 'ACTIVE');
  const completedSessions = parkingSessions.filter((s) => s.status === 'COMPLETED');

  // Filter sessions
  const filteredActiveSessions = activeSessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.normalizedPlate.toLowerCase().includes(q) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      s.allocatedSlot.toLowerCase().includes(q)
    );
  });

  const handleSimulateEntry = (plate?: string) => {
    simulateVehicleArrival(plate, 'CAR', 'entry');
  };

  const handleSimulateExit = (plate?: string) => {
    // Pick an active vehicle to exit
    const target = plate || (activeSessions.length > 0 ? activeSessions[0].normalizedPlate : undefined);
    simulateVehicleArrival(target, 'CAR', 'exit');
  };

  const handleCreateVisitorPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorPlate.trim()) return;
    simulateVehicleArrival(visitorPlate.toUpperCase(), visitorType, 'entry');
    setVisitorPlate('');
    setVisitorName('');
    setVisitorMobile('');
    setShowVisitorModal(false);
  };

  const handleExportCSV = () => {
    const exportRows = parkingSessions.map((s) => {
      const dur = s.durationMinutes
        ? `${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m`
        : calculateDuration(s.entryTime).formattedDuration;
      return {
        'Session ID': s.id,
        'Vehicle Plate': s.normalizedPlate,
        'Ownership Category': s.ownershipType,
        'Owner Name': s.ownerName || 'Visitor',
        Department: s.department || 'N/A',
        'Slot Allocated': s.allocatedSlot,
        'Entry Time (IST)': new Date(s.entryTime).toLocaleString('en-IN'),
        'Exit Time (IST)': s.exitTime ? new Date(s.exitTime).toLocaleString('en-IN') : 'Still Parked',
        Duration: dur,
        'Fee Charged (INR)': s.feeInr ?? calculateParkingFee(s.entryTime, undefined, s.ownershipType as any, settings.visitorHourlyRate),
        Status: s.status,
      };
    });
    exportToCSV(`Parking_Report_${new Date().toISOString().slice(0, 10)}`, exportRows);
  };

  const handleExportExcel = () => {
    const exportRows = parkingSessions.map((s) => ({
      'Session ID': s.id,
      'Vehicle Plate': s.normalizedPlate,
      'Ownership Category': s.ownershipType,
      'Owner Name': s.ownerName || 'Visitor',
      Department: s.department || 'N/A',
      'Slot Allocated': s.allocatedSlot,
      'Entry Time (IST)': new Date(s.entryTime).toLocaleString('en-IN'),
      'Exit Time (IST)': s.exitTime ? new Date(s.exitTime).toLocaleString('en-IN') : 'Still Parked',
      'Fee Charged (INR)': s.feeInr ?? 0,
      Status: s.status,
    }));
    exportToExcel(`Parking_Report_${new Date().toISOString().slice(0, 10)}`, exportRows, 'Parking Sessions');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Automated Office Parking Facility</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gate ANPR sensor integration, boom barrier control, and real-time visitor/employee validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVisitorModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Generate Visitor Entry</span>
          </button>
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

      {/* Lane Monitoring & Hardware Gate Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Lane Section */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DoorOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Entry Gate 1 (North Lane)</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Camera: {entryCam.name} • Auto-ANPR
                </span>
              </div>
            </div>

            {/* Barrier Boom Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Boom Barrier:</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  entryBarrierState === 'OPEN'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                    : entryBarrierState === 'OPENING' || entryBarrierState === 'CLOSING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {entryBarrierState}
              </span>
            </div>
          </div>

          {/* Entry Feed Canvas */}
          <CameraFeedCanvas
            camera={entryCam}
            heightClass="h-[280px]"
            showControls={false}
            onDetectVehicle={(plate) => handleSimulateEntry(plate)}
          />

          {/* Barrier Manual Controls & Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => openBarrier('entry', true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                Open Barrier (Manual)
              </button>
              <button
                onClick={() => closeBarrier('entry')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                Close Barrier
              </button>
            </div>

            <button
              onClick={() => handleSimulateEntry()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Vehicle Entry</span>
            </button>
          </div>
        </div>

        {/* Exit Lane Section */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <DoorClosed className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Exit Gate 1 (North Lane)</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Camera: {exitCam.name} • Auto-Checkout
                </span>
              </div>
            </div>

            {/* Exit Barrier Status */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Exit Barrier:</span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  exitBarrierState === 'OPEN'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                    : exitBarrierState === 'OPENING' || exitBarrierState === 'CLOSING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {exitBarrierState}
              </span>
            </div>
          </div>

          {/* Exit Feed Canvas */}
          <CameraFeedCanvas
            camera={exitCam}
            heightClass="h-[280px]"
            showControls={false}
            onDetectVehicle={(plate) => handleSimulateExit(plate)}
          />

          {/* Exit Manual Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => openBarrier('exit', true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                Open Barrier (Manual)
              </button>
              <button
                onClick={() => closeBarrier('exit')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                Close Barrier
              </button>
            </div>

            <button
              onClick={() => handleSimulateExit()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Vehicle Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Parked Vehicles Real-Time Table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Currently Parked Vehicles ({activeSessions.length} Active)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live dwell time, assigned slots, and parking fee accrual
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plate, owner, slot, dept..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Vehicle Plate</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Owner / Department</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Entry Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Accrued Fee</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredActiveSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-mono">
                    No active parked vehicles matching search query.
                  </td>
                </tr>
              ) : (
                filteredActiveSessions.map((session) => {
                  const duration = calculateDuration(session.entryTime);
                  const fee = calculateParkingFee(
                    session.entryTime,
                    undefined,
                    session.ownershipType as any,
                    settings.visitorHourlyRate
                  );

                  return (
                    <tr key={session.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <PlateBadge plateNumber={session.normalizedPlate} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            session.ownershipType === 'EMPLOYEE'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : session.ownershipType === 'VIP'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {session.ownershipType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{session.ownerName || 'Guest'}</div>
                        <div className="text-[10px] text-slate-400">{session.department || 'Visitor'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-sky-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {session.allocatedSlot}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {new Date(session.entryTime).toLocaleTimeString('en-IN', { hour12: false })}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                        {duration.formattedDuration}
                      </td>
                      <td className="px-4 py-3 font-mono text-white font-bold">
                        ₹{fee}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSimulateExit(session.normalizedPlate)}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded text-xs font-semibold transition"
                          title="Checkout vehicle and open exit barrier"
                        >
                          Process Exit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Entry Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <span>Issue Visitor Parking Pass</span>
            </h3>
            <p className="text-xs text-slate-400">
              Registers entry for a guest or client vehicle and authorizes gate barrier.
            </p>

            <form onSubmit={handleCreateVisitorPass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registration Number:
                </label>
                <input
                  type="text"
                  value={visitorPlate}
                  onChange={(e) => setVisitorPlate(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. DL8CAF1234 or GJ05CD5678"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Visitor Name:
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Sumanth Verma"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vehicle Type:
                  </label>
                  <select
                    value={visitorType}
                    onChange={(e) => setVisitorType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="CAR">Car</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="AUTO_RICKSHAW">Auto</option>
                    <option value="TRUCK">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Number:
                  </label>
                  <input
                    type="text"
                    value={visitorMobile}
                    onChange={(e) => setVisitorMobile(e.target.value)}
                    placeholder="+91 98xxx"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Issue Pass & Open Gate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Review Modal if Selected */}
      {selectedSessionReview && (
        <ManualReviewModal
          detection={selectedSessionReview}
          onClose={() => setSelectedSessionReview(null)}
        />
      )}
    </div>
  );
};

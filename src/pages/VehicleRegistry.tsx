import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlateBadge } from '../components/common/PlateBadge';
import { RegisteredVehicle, VehicleType, OwnershipType } from '../types';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { parseAndNormalizeIndianPlate } from '../utils/plateParser';
import {
  Car,
  Search,
  Plus,
  Download,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  Phone,
  Building,
} from 'lucide-react';

export const VehicleRegistry: React.FC = () => {
  const { vehicles, registerVehicle, updateVehicle, deleteVehicle, toggleVehicleBlacklist } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterOwnership, setFilterOwnership] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>('Engineering & R&D');
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('EMPLOYEE');
  const [makeModel, setMakeModel] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [assignedSlot, setAssignedSlot] = useState<string>('');
  const [rfidTag, setRfidTag] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.mobileNumber.toLowerCase().includes(q) ||
      v.department.toLowerCase().includes(q);

    const matchesType = filterType === 'ALL' || v.vehicleType === filterType;
    const matchesOwnership = filterOwnership === 'ALL' || v.ownershipType === filterOwnership;

    return matchesSearch && matchesType && matchesOwnership;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setPlateNumber('');
    setOwnerName('');
    setMobileNumber('');
    setDepartment('Engineering');
    setVehicleType('CAR');
    setOwnershipType('EMPLOYEE');
    setMakeModel('');
    setColor('');
    setAssignedSlot('');
    setRfidTag('');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (v: RegisteredVehicle) => {
    setEditingId(v.id);
    setPlateNumber(v.plateNumber);
    setOwnerName(v.ownerName);
    setMobileNumber(v.mobileNumber);
    setDepartment(v.department);
    setVehicleType(v.vehicleType);
    setOwnershipType(v.ownershipType);
    setMakeModel(v.makeModel);
    setColor(v.color);
    setAssignedSlot(v.assignedSlot || '');
    setRfidTag(v.rfidTag || '');
    setNotes(v.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAndNormalizeIndianPlate(plateNumber);

    if (editingId) {
      updateVehicle(editingId, {
        plateNumber: parsed.normalizedPlate,
        ownerName,
        mobileNumber,
        department,
        vehicleType,
        ownershipType,
        makeModel,
        color,
        assignedSlot,
        rfidTag,
        notes,
      });
    } else {
      registerVehicle({
        plateNumber: parsed.normalizedPlate,
        ownerName,
        mobileNumber,
        department,
        vehicleType,
        ownershipType,
        makeModel,
        color,
        assignedSlot,
        rfidTag,
        notes,
      });
    }
    setShowModal(false);
  };

  const handleExportCSV = () => {
    const rows = filteredVehicles.map((v) => ({
      'Registration Plate': v.plateNumber,
      'Owner Name': v.ownerName,
      Mobile: v.mobileNumber,
      Department: v.department,
      'Vehicle Type': v.vehicleType,
      'Ownership Class': v.ownershipType,
      'Make / Model': v.makeModel,
      Color: v.color,
      'Assigned Slot': v.assignedSlot || 'Unassigned',
      'RFID Tag': v.rfidTag || 'N/A',
      'Registered Date': new Date(v.registeredAt).toLocaleDateString('en-IN'),
    }));
    exportToCSV(`Vehicle_Registry_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-sky-400" />
            <span>Authorized Vehicle Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Database of authorized employee vehicles, VIPs, commercial vendors, and security blacklists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate, owner, mobile, dept..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="CAR">Car</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="TRUCK">Truck</option>
            <option value="ELECTRIC">Electric</option>
          </select>

          <select
            value={filterOwnership}
            onChange={(e) => setFilterOwnership(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">All Categories</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="VIP">VIP</option>
            <option value="VISITOR">Visitor</option>
            <option value="BLACKLISTED">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Vehicle Database Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Registration Plate</th>
              <th className="px-4 py-3">Owner Details</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Make / Model / Color</th>
              <th className="px-4 py-3">Assigned Slot</th>
              <th className="px-4 py-3">RFID Tag</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                  No vehicles found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((veh) => (
                <tr key={veh.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3">
                    <PlateBadge plateNumber={veh.plateNumber} ownershipType={veh.ownershipType} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{veh.ownerName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-2.5 h-2.5" /> {veh.mobileNumber}
                      </span>
                      <span>•</span>
                      <span>{veh.department}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        veh.ownershipType === 'EMPLOYEE'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : veh.ownershipType === 'VIP'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : veh.ownershipType === 'BLACKLISTED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {veh.ownershipType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{veh.makeModel || 'N/A'}</div>
                    <div className="text-[10px] text-slate-400">{veh.color}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-sky-400">
                    {veh.assignedSlot || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                    {veh.rfidTag || 'None'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleVehicleBlacklist(veh.id)}
                        className={`p-1.5 rounded transition ${
                          veh.ownershipType === 'BLACKLISTED'
                            ? 'text-red-400 bg-red-950/40 hover:bg-red-900/50'
                            : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
                        }`}
                        title={veh.ownershipType === 'BLACKLISTED' ? 'Remove from Blacklist' : 'Flag to Security Blacklist'}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(veh)}
                        className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVehicle(veh.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register/Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-sky-400" />
              <span>{editingId ? 'Edit Vehicle Record' : 'Register New Vehicle'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Registration Plate:
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. GJ01AB1234"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category:
                  </label>
                  <select
                    value={ownershipType}
                    onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="VIP">VIP Executive</option>
                    <option value="COMMERCIAL">Commercial / Vendor</option>
                    <option value="VISITOR">Visitor</option>
                    <option value="BLACKLISTED">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Owner Full Name:
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    placeholder="e.g. Amit Trivedi"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Number:
                  </label>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    placeholder="+91 98250 12345"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vehicle Type:
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as VehicleType)}
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
                    Department:
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Assigned Slot:
                  </label>
                  <input
                    type="text"
                    value={assignedSlot}
                    onChange={(e) => setAssignedSlot(e.target.value)}
                    placeholder="e.g. A-01"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Make / Model:
                  </label>
                  <input
                    type="text"
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    placeholder="e.g. Tata Nexon EV"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    RFID Tag (Optional):
                  </label>
                  <input
                    type="text"
                    value={rfidTag}
                    onChange={(e) => setRfidTag(e.target.value)}
                    placeholder="e.g. RFID-GJ-9021"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  {editingId ? 'Update Record' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

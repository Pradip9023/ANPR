import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, CameraType, CameraSourceType } from '../types';
import {
  Video,
  Plus,
  RefreshCw,
  Power,
  Trash2,
  Edit3,
  Wifi,
  WifiOff,
  Shield,
  Layers,
  Lock,
} from 'lucide-react';

export const CameraManagement: React.FC = () => {
  const { cameras, addCamera, updateCamera, deleteCamera, toggleCameraProcessing, testCameraPing } = useApp();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingCameraId, setEditingCameraId] = useState<string | null>(null);
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [type, setType] = useState<CameraType>('PARKING_ENTRY');
  const [sourceType, setSourceType] = useState<CameraSourceType>('RTSP');
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.105');
  const [rtspUrl, setRtspUrl] = useState<string>('rtsp://admin:••••••••@192.168.1.105:554/live/ch0');
  const [resolution, setResolution] = useState<string>('1920x1080 (FHD)');
  const [fps, setFps] = useState<number>(30);
  const [assignedLane, setAssignedLane] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingCameraId(null);
    setName('');
    setLocation('');
    setType('PARKING_ENTRY');
    setSourceType('RTSP');
    setIpAddress('192.168.1.105');
    setRtspUrl('rtsp://admin:••••••••@192.168.1.105:554/live/ch0');
    setResolution('1920x1080 (FHD)');
    setFps(30);
    setAssignedLane('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (cam: Camera) => {
    setEditingCameraId(cam.id);
    setName(cam.name);
    setLocation(cam.location);
    setType(cam.type);
    setSourceType(cam.sourceType);
    setIpAddress(cam.ipAddress || '');
    setRtspUrl(cam.rtspUrl || 'rtsp://admin:••••••••@ip:554/h264');
    setResolution(cam.resolution);
    setFps(cam.fps);
    setAssignedLane(cam.assignedLane || '');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCameraId) {
      updateCamera(editingCameraId, {
        name,
        location,
        type,
        sourceType,
        ipAddress,
        rtspUrl,
        resolution,
        fps,
        assignedLane,
      });
    } else {
      addCamera({
        name,
        location,
        type,
        sourceType,
        ipAddress,
        rtspUrl,
        status: 'ONLINE',
        fps,
        resolution,
        isProcessing: true,
        assignedLane,
      });
    }
    setShowAddModal(false);
  };

  const handlePing = async (id: string) => {
    setPingingId(id);
    await testCameraPing(id);
    setPingingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-sky-400" />
            <span>Camera Sensor & Edge RTSP Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure CCTV, USB & IP cameras, RTSP ingestion, latency calibration, and ANPR assignment
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Camera</span>
        </button>
      </div>

      {/* Camera List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      camera.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}
                  ></span>
                  <h3 className="text-sm font-bold text-white font-mono">{camera.name}</h3>
                </div>
                <div className="text-xs text-slate-400">{camera.location}</div>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  camera.type.includes('ENTRY')
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : camera.type.includes('EXIT')
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {camera.type}
              </span>
            </div>

            {/* Technical Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 block">IP Address</span>
                <span className="text-slate-300 font-bold">{camera.ipAddress || 'DHCP'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">FPS</span>
                <span className="text-slate-300 font-bold">{camera.fps} fps</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Resolution</span>
                <span className="text-slate-300 font-bold">{camera.resolution.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Latency</span>
                <span className="text-emerald-400 font-bold">{camera.latencyMs} ms</span>
              </div>
            </div>

            {/* RTSP Stream Masking (Password never exposed) */}
            <div className="text-xs flex items-center justify-between p-2 rounded bg-slate-800/50 border border-slate-700/60 font-mono">
              <span className="text-slate-400 flex items-center gap-1.5 truncate">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">rtsp://admin:••••••••@{camera.ipAddress || '192.168.1.100'}:554</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium shrink-0 ml-2">CREDENTIALS MASKED</span>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePing(camera.id)}
                  disabled={pingingId === camera.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                  title="Test RTSP Ping Connectivity"
                >
                  <RefreshCw className={`w-3 h-3 ${pingingId === camera.id ? 'animate-spin' : ''}`} />
                  <span>Test Ping</span>
                </button>

                <button
                  onClick={() => toggleCameraProcessing(camera.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                    camera.isProcessing
                      ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                      : 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
                  }`}
                  title="Toggle ANPR Inference Processing"
                >
                  <Power className="w-3 h-3" />
                  <span>{camera.isProcessing ? 'ANPR Active' : 'Paused'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(camera)}
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition"
                  title="Edit Configuration"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCamera(camera.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                  title="Remove Camera"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-sky-400" />
              <span>{editingCameraId ? 'Edit Camera Configuration' : 'Add Surveillance Camera'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Camera Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Gate 2 - South Entry ANPR"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Camera Assignment:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CameraType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="PARKING_ENTRY">Parking Entry ANPR</option>
                    <option value="PARKING_EXIT">Parking Exit ANPR</option>
                    <option value="ROAD_SURVEILLANCE">Road Surveillance</option>
                    <option value="HIGHWAY_JUNCTION">Highway Junction</option>
                    <option value="BAY_OVERVIEW">Bay Overview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source Ingestion:</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as CameraSourceType)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="RTSP">IP / RTSP Stream</option>
                    <option value="WEBCAM">USB / Local Webcam</option>
                    <option value="MOCK_STREAM">Synthetic AI Stream</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">IP Address:</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.105"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Lane:</label>
                  <input
                    type="text"
                    value={assignedLane}
                    onChange={(e) => setAssignedLane(e.target.value)}
                    placeholder="e.g. Lane 1 North"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  RTSP Stream URL (Credentials will be masked & encrypted):
                </label>
                <input
                  type="text"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  placeholder="rtsp://user:pass@192.168.1.105:554/stream1"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Resolution:</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="1920x1080 (FHD)">1920x1080 (FHD)</option>
                    <option value="2560x1440 (2K QHD)">2560x1440 (2K QHD)</option>
                    <option value="3840x2160 (4K UHD)">3840x2160 (4K UHD)</option>
                    <option value="1280x720 (HD)">1280x720 (HD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target FPS:</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  {editingCameraId ? 'Update Camera' : 'Connect Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

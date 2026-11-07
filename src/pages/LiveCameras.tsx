import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CameraFeedCanvas } from '../components/common/CameraFeedCanvas';
import { Video, Grid, Maximize, Plus, RefreshCw, Sliders } from 'lucide-react';

export const LiveCameras: React.FC = () => {
  const { cameras, testCameraPing, setCurrentPage } = useApp();
  const [gridLayout, setGridLayout] = useState<'1x1' | '2x2' | '3x3'>('2x2');
  const [selectedSingleCam, setSelectedSingleCam] = useState<string>(cameras[0].id);
  const [isPingingAll, setIsPingingAll] = useState<boolean>(false);

  const handlePingAll = async () => {
    setIsPingingAll(true);
    for (const cam of cameras) {
      await testCameraPing(cam.id);
    }
    setIsPingingAll(false);
  };

  const displayedCameras =
    gridLayout === '1x1'
      ? cameras.filter((c) => c.id === selectedSingleCam)
      : gridLayout === '2x2'
      ? cameras.slice(0, 4)
      : cameras;

  const gridClass =
    gridLayout === '1x1'
      ? 'grid-cols-1'
      : gridLayout === '2x2'
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-sky-400" />
            <span>Multi-Matrix Live CCTV Surveillance Feed</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized live streams, edge RTSP connectivity, and continuous ANPR inference
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
            {(['1x1', '2x2', '3x3'] as const).map((layout) => (
              <button
                key={layout}
                onClick={() => setGridLayout(layout)}
                className={`px-2.5 py-1 rounded font-mono font-medium transition ${
                  gridLayout === layout ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {layout}
              </button>
            ))}
          </div>

          <button
            onClick={handlePingAll}
            disabled={isPingingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin' : ''}`} />
            <span>Ping Feeds</span>
          </button>

          <button
            onClick={() => setCurrentPage('camera_management')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Camera</span>
          </button>
        </div>
      </div>

      {gridLayout === '1x1' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Select Stream:</span>
          <select
            value={selectedSingleCam}
            onChange={(e) => setSelectedSingleCam(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-mono"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Grid of Cameras */}
      <div className={`grid ${gridClass} gap-4`}>
        {displayedCameras.map((camera) => (
          <div key={camera.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-white font-mono truncate max-w-[200px]">
                  {camera.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {camera.assignedLane || camera.location}
              </span>
            </div>

            <CameraFeedCanvas
              camera={camera}
              heightClass={gridLayout === '1x1' ? 'h-[500px]' : gridLayout === '2x2' ? 'h-[270px]' : 'h-[210px]'}
              showControls={gridLayout !== '3x3'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Activity,
  Video,
  Sun,
  Moon,
  LogOut,
  Car,
  Radio,
  Play,
  Square,
  AlertCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    theme,
    toggleTheme,
    cameras,
    currentPage,
    setCurrentPage,
    isSimulatorActive,
    toggleSimulator,
    simulateVehicleArrival,
    activeAlert,
    clearAlert,
  } = useApp();

  const onlineCameras = cameras.filter((c) => c.status === 'ONLINE').length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 dark:bg-slate-950/95 border-b border-slate-800 backdrop-blur-md">
      {/* Alert Banner if Active */}
      {activeAlert && (
        <div
          className={`px-4 py-2 flex items-center justify-between text-xs font-medium border-b ${
            activeAlert.type === 'DANGER'
              ? 'bg-red-950/90 text-red-200 border-red-800'
              : activeAlert.type === 'WARNING'
              ? 'bg-amber-950/90 text-amber-200 border-amber-800'
              : activeAlert.type === 'SUCCESS'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
              : 'bg-sky-950/90 text-sky-200 border-sky-800'
          }`}
        >
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <strong className="font-semibold">{activeAlert.title}:</strong>
            <span className="truncate">{activeAlert.message}</span>
          </div>
          <button
            onClick={clearAlert}
            className="text-xs px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-sky-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-sky-400 via-indigo-200 to-amber-400 bg-clip-text text-transparent">
                GARUDA<span className="text-white font-mono text-xs ml-1 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700/60">ANPR</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.4 IN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate hidden sm:block">
              AI-Powered Indian Number Plate & Surveillance Engine
            </p>
          </div>
        </div>

        {/* Center: Quick Mode Shortcuts */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentPage('office_parking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              currentPage === 'office_parking'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Office Parking Mode</span>
          </button>

          <button
            onClick={() => setCurrentPage('road_detection')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              currentPage === 'road_detection'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Outdoor Road Mode</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Simulation Trigger */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => simulateVehicleArrival()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded transition"
              title="Instantly generate an ANPR vehicle arrival"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Vehicle</span>
            </button>

            <button
              onClick={toggleSimulator}
              className={`p-1 rounded transition text-xs flex items-center gap-1 px-2 ${
                isSimulatorActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
              title="Toggle automatic periodic traffic simulator"
            >
              {isSimulatorActive ? <Play className="w-3 h-3" /> : <Square className="w-3 h-3" />}
              <span className="hidden md:inline">{isSimulatorActive ? 'Auto' : 'Off'}</span>
            </button>
          </div>

          {/* Camera Status Pill */}
          <div
            onClick={() => setCurrentPage('camera_management')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs cursor-pointer hover:border-slate-600 transition"
            title="Active CCTV Feeds"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Video className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono">{onlineCameras}/{cameras.length} Cams</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile / Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition text-left"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-sky-500 object-cover"
                />
                <div className="hidden xl:block">
                  <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] font-mono text-sky-400 uppercase leading-none">{currentUser.role}</div>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

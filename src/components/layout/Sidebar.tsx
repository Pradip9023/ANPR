import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Video,
  Radio,
  FileSpreadsheet,
  Clock,
  Car,
  Settings,
  Users,
  BarChart3,
  Sliders,
  UserCheck,
  AlertTriangle,
  History,
} from 'lucide-react';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  category: 'CORE' | 'OPERATIONS' | 'DATA' | 'SYSTEM';
}

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, detections, parkingSessions, cameras } = useApp();

  const unreviewedDetectionsCount = detections.filter((d) => d.needsReview).length;
  const activeSessionsCount = parkingSessions.filter((s) => s.status === 'ACTIVE').length;
  const activeCamsCount = cameras.filter((c) => c.status === 'ONLINE').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, category: 'CORE' },
    {
      id: 'office_parking',
      label: 'Office Parking',
      icon: Building2,
      badge: activeSessionsCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      category: 'OPERATIONS',
    },
    {
      id: 'road_detection',
      label: 'Road Detection Mode',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
      category: 'OPERATIONS',
    },
    {
      id: 'live_cameras',
      label: 'Live CCTV Matrix',
      icon: Video,
      badge: activeCamsCount,
      badgeColor: 'bg-sky-500/20 text-sky-300',
      category: 'OPERATIONS',
    },
    { id: 'vehicle_registry', label: 'Vehicle Registry', icon: Car, category: 'DATA' },
    {
      id: 'detection_history',
      label: 'Detection History',
      icon: History,
      badge: unreviewedDetectionsCount > 0 ? unreviewedDetectionsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      category: 'DATA',
    },
    { id: 'parking_history', label: 'Parking History', icon: Clock, category: 'DATA' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, category: 'DATA' },
    { id: 'camera_management', label: 'Camera Management', icon: Sliders, category: 'SYSTEM' },
    { id: 'user_management', label: 'User Management', icon: Users, category: 'SYSTEM' },
    { id: 'settings', label: 'System Settings', icon: Settings, category: 'SYSTEM' },
    { id: 'profile', label: 'Profile & Hardware', icon: UserCheck, category: 'SYSTEM' },
  ];

  const renderGroup = (category: NavItem['category'], title: string) => {
    const items = navItems.filter((i) => i.category === category);
    return (
      <div className="space-y-1 mb-4" key={category}>
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
          {title}
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-4 px-3 select-none overflow-y-auto">
      <div>
        {renderGroup('CORE', 'Overview')}
        {renderGroup('OPERATIONS', 'Real-Time Surveillance')}
        {renderGroup('DATA', 'Records & Intelligence')}
        {renderGroup('SYSTEM', 'Administration')}
      </div>

      {/* Indian ANPR Engine Status Card */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">ANPR OCR ENGINE</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Online
          </span>
        </div>
        <div className="text-[11px] font-bold text-slate-200">Indian State Normalizer</div>
        <div className="text-[10px] text-slate-400 font-mono">
          Model: YOLOv8-IN + PaddleOCR
        </div>
      </div>
    </aside>
  );
};

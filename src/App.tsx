/**
 * GarudaANPR - Enterprise Indian Automatic Number Plate Recognition & Parking Management
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { OfficeParking } from './pages/OfficeParking';
import { LiveCameras } from './pages/LiveCameras';
import { RoadDetection } from './pages/RoadDetection';
import { VehicleRegistry } from './pages/VehicleRegistry';
import { DetectionHistory } from './pages/DetectionHistory';
import { ParkingHistory } from './pages/ParkingHistory';
import { CameraManagement } from './pages/CameraManagement';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

const AppContent: React.FC = () => {
  const { currentPage, currentUser } = useApp();

  if (currentPage === 'login' || !currentUser) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'office_parking':
        return <OfficeParking />;
      case 'live_cameras':
        return <LiveCameras />;
      case 'road_detection':
        return <RoadDetection />;
      case 'vehicle_registry':
        return <VehicleRegistry />;
      case 'detection_history':
        return <DetectionHistory />;
      case 'parking_history':
        return <ParkingHistory />;
      case 'camera_management':
        return <CameraManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'user_management':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">{renderActivePage()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

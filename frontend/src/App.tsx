import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PortProvider } from './context/PortContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { TutorialProvider } from './context/TutorialContext';
import { ProtectedRoute, RequireRole } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import RoleSelectPage from './pages/RoleSelectPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DispatcherHomePage from './pages/DispatcherHomePage';
import SlotBookingPage from './pages/SlotBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import FleetTrackerPage from './pages/FleetTrackerPage';
import FleetManagerPage from './pages/FleetManagerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';

export default function App() {
  return (
    <ThemeProvider>
      <PortProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <TutorialProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<RoleSelectPage />} />
                <Route path="/login/:role" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/dashboard" element={<RequireRole allowed={['port_admin']}><DashboardPage /></RequireRole>} />
                    <Route path="/home" element={<RequireRole allowed={['dispatcher']}><DispatcherHomePage /></RequireRole>} />
                    <Route path="/slots" element={<RequireRole allowed={['dispatcher']}><SlotBookingPage /></RequireRole>} />
                    <Route path="/my-bookings" element={<RequireRole allowed={['dispatcher']}><MyBookingsPage /></RequireRole>} />
                    <Route path="/profile" element={<RequireRole allowed={['dispatcher']}><ProfilePage /></RequireRole>} />
                    <Route path="/fleet" element={<RequireRole allowed={['fleet_manager']}><FleetTrackerPage /></RequireRole>} />
                    <Route path="/fleet-manage" element={<RequireRole allowed={['fleet_manager']}><FleetManagerPage /></RequireRole>} />
                    <Route path="/admin/users" element={<RequireRole allowed={['port_admin']}><AdminUsersPage /></RequireRole>} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <TutorialOverlay />
          </TutorialProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
      </PortProvider>
    </ThemeProvider>
  );
}

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function roleHome(role: string): string {
  if (role === 'dispatcher') return '/home';
  if (role === 'fleet_manager') return '/fleet-manage';
  return '/dashboard';
}

export function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (!user) return <div className="p-8 text-sm">Loading session…</div>;
  if (!allowed.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

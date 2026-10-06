import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, Truck, BarChart3, Settings, Home, ClipboardList, User, Users, Wrench, ChevronLeft, ChevronRight, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

const ALL_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: 'All 12 ports overview', roles: ['port_admin'] },
  { path: '/home', icon: Home, label: 'Home', sub: 'My live routes', roles: ['dispatcher'] },
  { path: '/slots', icon: CalendarClock, label: 'Slot Booking', sub: 'Gate Allocation & AI Rec.', roles: ['dispatcher'] },
  { path: '/my-bookings', icon: ClipboardList, label: 'My Bookings', sub: 'Own bookings & e-Pass', roles: ['dispatcher'] },
  { path: '/profile', icon: User, label: 'Profile Settings', sub: 'Account & vehicle', roles: ['dispatcher'] },
  { path: '/fleet-manage', icon: Wrench, label: 'Fleet Dashboard', sub: 'Bookings & live status', roles: ['fleet_manager'] },
  { path: '/fleet', icon: Truck, label: 'Fleet Tracker', sub: 'Telematics & Live GIS', roles: ['fleet_manager'] },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', sub: 'Heatmaps & Turnaround', roles: ['port_admin', 'fleet_manager'] },
  { path: '/admin/users', icon: Users, label: 'Fleet Managers', sub: 'User management & access', roles: ['port_admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', sub: 'Preferences', roles: ['port_admin', 'fleet_manager', 'dispatcher'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'dispatcher';
  const items = ALL_ITEMS.filter(i => i.roles.includes(role));

  return (
    <aside className={clsx('flex flex-col h-full flex-shrink-0 transition-all duration-300 relative z-20',
      'liquid-glass border-r border-r-white/50 dark:border-r-white/10 backdrop-blur-2xl',
      collapsed ? 'w-[72px]' : 'w-[264px]')}>
      <button onClick={() => setCollapsed(p => !p)}
        className="absolute -right-3.5 top-6 z-30 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border neu-button flex items-center justify-center text-slate-500 shadow-md"
        aria-label={collapsed ? 'Expand' : 'Collapse'}>
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
      <nav className="flex-1 overflow-y-auto py-5 space-y-1.5 px-3">
        {items.map(({ path, icon: Icon, label, sub }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) => clsx('flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all group',
              isActive ? 'bg-black/[0.05] dark:bg-white/[0.08] font-bold border-l-[3px] border-cyan-500'
                : 'text-[#6B7280] dark:text-slate-400 hover:bg-black/[0.03] border-l-[3px] border-transparent')}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <div className="min-w-0"><div className="text-xs font-bold truncate">{label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{sub}</div></div>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/40 dark:border-white/10 p-3.5">
        {!collapsed && (
          <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border neu-flat-sm mb-2">
            <div className="text-xs font-bold truncate">{user?.name || 'User'}</div>
            <div className="text-[9px] text-cyan-600 uppercase font-semibold">{role.replace('_', ' ')}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-emerald-600"><Shield className="w-3 h-3" /> LOCAL JWT</div>
          </div>
        )}
        <button onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-500 text-xs font-bold hover:bg-red-500/10">
          <LogOut className="w-4 h-4" />{!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldCheck,
  Truck,
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
  Anchor,
  AlertCircle,
  Radio,
  Info,
} from 'lucide-react';

interface RoleTheme {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: typeof ShieldCheck;
  defaultEmail: string;
  infoNote?: string;
  iconBox: string;
  iconColor: string;
  badge: string;
  tabActive: string;
  tabIdle: string;
  btnGradient: string;
  inputFocus: string;
  orb1: string;
  orb2: string;
  orb3: string;
  pageBg: string;
  pageBgDark: string;
  topoStroke: string;
  topoStrokeDark: string;
}

const ROLES: Record<string, RoleTheme> = {
  port_admin: {
    id: 'port_admin',
    title: 'Port Admin',
    subtitle: 'Terminal Authority & Governance Center',
    tag: 'PORT AUTHORITY • MULTI-TERMINAL',
    icon: ShieldCheck,
    defaultEmail: 'admin@logisync.ai',
    iconBox: 'bg-amber-100 border-amber-300 dark:bg-amber-500/20 dark:border-amber-400/30',
    iconColor: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-400/30',
    tabActive: 'bg-gradient-to-r from-[#0b2a4a] via-[#134e6f] to-[#b8860b] text-white border-amber-400/50 shadow-lg shadow-amber-900/30',
    tabIdle: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10',
    btnGradient: 'from-[#0b2a4a] via-[#166f9e] to-[#d4a017] hover:from-[#134e6f] hover:via-[#1a8fc1] hover:to-[#e8b923] shadow-[0_10px_30px_rgba(11,42,74,0.45)]',
    inputFocus: 'focus:border-amber-500 focus:ring-amber-200 dark:focus:border-amber-400 dark:focus:ring-amber-500/30',
    orb1: 'none', orb2: 'none', orb3: 'none',
    pageBg: 'linear-gradient(135deg,#081c33 0%,#0b2a4a 35%,#134e6f 60%,#e8dcc3 130%)',
    pageBgDark: 'radial-gradient(1200px 600px at 20% 10%,#b8860b33,transparent),radial-gradient(1000px 700px at 85% 90%,#166f9e55,transparent),linear-gradient(160deg,#040b16,#081c33 60%,#0b2a4a)',
    topoStroke: '#b8860b', topoStrokeDark: '#e8c547',
  },
  fleet_manager: {
    id: 'fleet_manager',
    title: 'Fleet Manager',
    subtitle: 'Live Telematics & Port Ingress Command',
    tag: 'OPERATIONAL CLEARANCE • ASSIGNED PORT',
    icon: Truck,
    defaultEmail: '',
    infoNote: 'Fleet Manager accounts are created by the Port Admin. Sign in with the credentials assigned to your operational terminal.',
    iconBox: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-400/30',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30',
    tabActive: 'bg-gradient-to-r from-[#052e2b] via-[#0d5c46] to-[#a3e635] text-white border-lime-400/50 shadow-lg shadow-emerald-900/30',
    tabIdle: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10',
    btnGradient: 'from-[#052e2b] via-[#12936f] to-[#a3e635] hover:from-[#0d5c46] hover:via-[#16b183] hover:to-[#bef264] shadow-[0_10px_30px_rgba(5,46,43,0.45)]',
    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-lime-300 dark:focus:ring-lime-400/30',
    orb1: 'none', orb2: 'none', orb3: 'none',
    pageBg: 'linear-gradient(135deg,#04211f 0%,#052e2b 35%,#0d5c46 60%,#d9f99d 135%)',
    pageBgDark: 'radial-gradient(1100px 600px at 15% 15%,#a3e6352e,transparent),radial-gradient(900px 650px at 90% 85%,#12936f55,transparent),linear-gradient(160deg,#020f0e,#052e2b 60%,#07332f)',
    topoStroke: '#12936f', topoStrokeDark: '#a3e635',
  },
  dispatcher: {
    id: 'dispatcher',
    title: 'Dispatcher',
    subtitle: 'AI Slot Scheduling & Freight E-Pass Corridor',
    tag: 'LOGISTICS CLEARANCE • TRUCK & DRIVER',
    icon: Layers,
    defaultEmail: '',
    iconBox: 'bg-fuchsia-100 border-fuchsia-300 dark:bg-fuchsia-500/20 dark:border-fuchsia-400/30',
    iconColor: 'text-fuchsia-700 dark:text-fuchsia-300',
    badge: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:border-fuchsia-400/30',
    tabActive: 'bg-gradient-to-r from-[#2b1055] via-[#7597de] to-[#ff2fb3] text-white border-fuchsia-400/50 shadow-lg shadow-purple-900/30',
    tabIdle: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10',
    btnGradient: 'from-[#2b1055] via-[#6d28d9] to-[#ff2fb3] hover:from-[#3b1470] hover:via-[#7c3aed] hover:to-[#ff5cc4] shadow-[0_10px_30px_rgba(43,16,85,0.5)]',
    inputFocus: 'focus:border-fuchsia-500 focus:ring-fuchsia-200 dark:focus:border-fuchsia-400 dark:focus:ring-fuchsia-500/30',
    orb1: 'none', orb2: 'none', orb3: 'none',
    pageBg: 'linear-gradient(135deg,#1a0b2e 0%,#2b1055 40%,#7597de 75%,#ffd6ec 135%)',
    pageBgDark: 'radial-gradient(1100px 600px at 20% 10%,#ff2fb355,transparent),radial-gradient(950px 650px at 85% 90%,#7597de66,transparent),linear-gradient(160deg,#0d0618,#1a0b2e 60%,#2b1055)',
    topoStroke: '#7c3aed', topoStrokeDark: '#ff5cc4',
  },
};

export default function LoginPage() {
  const { role: urlRole = 'port_admin' } = useParams();
  const activeRoleKey = urlRole in ROLES ? urlRole : 'port_admin';
  const [currentRole, setCurrentRole] = useState(activeRoleKey);

  const { login, isLoading, error } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = (location.state as any)?.justRegistered === true;

  const currentTheme = ROLES[currentRole] || ROLES.port_admin;

  const [identifier, setIdentifier] = useState(currentTheme.defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [roleMismatch, setRoleMismatch] = useState<string | null>(null);

  // Sync role when URL param changes
  useEffect(() => {
    if (urlRole && urlRole in ROLES && urlRole !== currentRole) {
      handleTabSwitch(urlRole);
    }
  }, [urlRole]);

  function handleTabSwitch(roleId: string) {
    setCurrentRole(roleId);
    setRoleMismatch(null);
    navigate(`/login/${roleId}`, { replace: true });
    const targetTheme = ROLES[roleId];
    if (targetTheme) {
      setIdentifier(targetTheme.defaultEmail);
      setPassword('');
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setRoleMismatch(null);
    try {
      const r = await login(identifier, password);
      // Enforce role-tab match: warn and stay instead of silently
      // dropping a dispatcher into the fleet-manager console (or vice versa).
      if (r !== currentRole) {
        const expected = ROLES[r]?.title || r.replace('_', ' ');
        const current = ROLES[currentRole]?.title || currentRole.replace('_', ' ');
        setRoleMismatch(
          `This account belongs to ${expected}, not ${current}. Please switch to the ${expected} tab to continue.`
        );
        return;
      }
      if (r === 'dispatcher') navigate('/home');
      else if (r === 'fleet_manager') navigate('/fleet-manage');
      else navigate('/dashboard');
    } catch {
      // error handled in AuthContext
    }
  }

  const RoleIcon = currentTheme.icon;

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden select-none bg-[var(--bg-canvas)] text-slate-900 dark:text-white">

      {/* ─── SLIM GLASS HEADER BAR ──────────────────────────────────────── */}
      <header className="relative z-10 w-full flex justify-center bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-sky-100 dark:border-white/15">
        <div className="w-full max-w-[880px] px-4 sm:px-6 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 p-[2px] shadow-lg shadow-sky-300/50 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
              <Anchor className="w-4 h-4 text-sky-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-white">LogiSync</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-white/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-white/15">
                v2.0
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/30 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>12 PORTS CONNECTED</span>
          </div>

          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl bg-white dark:bg-white/10 hover:bg-sky-50 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-amber-300 border border-slate-200 dark:border-white/15 transition-all shadow-sm"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        </div>
      </header>

      {/* ─── MAIN LOGIN WINDOW ─────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[500px]">
          {/* ─── ROLE SELECTOR TABS ─── */}
          <div className="relative mb-3.5 p-1.5 rounded-2xl liquid-glass backdrop-blur-xl border border-white/70 dark:border-white/15 neu-flat-sm flex gap-1.5">
            {Object.values(ROLES).map(role => {
              const TabIcon = role.icon;
              const isActive = role.id === currentRole;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleTabSwitch(role.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive ? `${role.tabActive} font-black` : role.tabIdle
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{role.title}</span>
                </button>
              );
            })}
          </div>

          {/* ─── LIQUID-GLASS LOGIN CARD ─── */}
          <div className="rounded-[2rem] p-7 sm:p-9 relative overflow-hidden liquid-glass-elevated backdrop-blur-2xl border border-white/70 dark:border-white/15 neu-flat-sm transition-all duration-700">
            {/* Top Color Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentTheme.btnGradient}`} />

            {/* Header: Persona Info & Clearance Tag */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${currentTheme.badge}`}>
                  <Radio className="w-3 h-3 animate-pulse" />
                  {currentTheme.tag}
                </div>
                <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>256-BIT JWT</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 mt-3">
                <div className={`rounded-2xl flex items-center justify-center p-3 border ${currentTheme.iconBox}`}>
                  <RoleIcon className={`w-6 h-6 ${currentTheme.iconColor}`} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentTheme.title} Sign In
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentTheme.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Fleet Manager Notice (Created by Admin) */}
            {currentTheme.infoNote && (
              <div className="mb-5 p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-400/30 flex items-start gap-2.5 text-xs text-teal-800 dark:text-teal-200">
                <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{currentTheme.infoNote}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={submit} className="space-y-4">
              {justRegistered && currentRole === 'dispatcher' && !roleMismatch && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-400/30 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex-1 font-medium leading-relaxed">Account created — sign in with your dispatcher credentials to open your dispatcher dashboard.</div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {currentRole === 'dispatcher' ? 'Email or Mobile Number' : 'Official Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={
                      currentRole === 'port_admin'
                        ? 'admin@logisync.ai'
                        : currentRole === 'fleet_manager'
                        ? 'e.g. manager@port.gov.in'
                        : 'e.g. TN01AB1234 or email'
                    }
                    required
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/70 dark:border-white/10 neu-inset shadow-inner text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-4 transition ${currentTheme.inputFocus}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/70 dark:border-white/10 neu-inset shadow-inner text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-4 transition ${currentTheme.inputFocus}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-200"
                  />
                  <span>Remember this terminal</span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Local JWT</span>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/30 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{error}</div>
                </div>
              )}

              {roleMismatch && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{roleMismatch}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-4 rounded-2xl text-white text-sm font-black tracking-wide flex items-center justify-center gap-2 bg-gradient-to-r ${currentTheme.btnGradient} transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Authenticating Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              {currentRole === 'dispatcher' ? (
                <p>
                  New driver/dispatcher?{' '}
                  <Link to="/signup" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold underline underline-offset-2">
                    Create account with OTP
                  </Link>
                </p>
              ) : (
                <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  Role: <span className="text-slate-700 dark:text-slate-200 font-semibold">{currentTheme.title}</span>
                </div>
              )}
              <Link to="/" className="hover:text-slate-800 dark:hover:text-white font-medium transition-colors flex items-center gap-1">
                <span>Browse all roles</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ─── SLIM GLASS FOOTER ───────────────────────────────────────────── */}
      <footer className="relative z-10 w-full flex justify-center bg-white/70 dark:bg-black/40 backdrop-blur-xl border-t border-sky-100 dark:border-white/15 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <div className="w-full max-w-[880px] px-4 sm:px-6 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <span>PORT CLEARANCE AUTHORITY</span>
          <span>•</span>
          <span className="text-slate-700 dark:text-slate-200">VOC THOOTHUKUDI (MAIN HUB)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>AES-256 JWT ENCRYPTION</span>
          <span>•</span>
          <span className="text-sky-600 dark:text-sky-400 font-semibold">LOGISYNC v2.0</span>
        </div>
        </div>
      </footer>
    </div>
  );
}

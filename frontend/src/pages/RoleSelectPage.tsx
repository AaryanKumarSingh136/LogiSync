import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Layers,
  ArrowRight,
  Anchor,
  Sun,
  Moon,
  Radio,
  Star,
  Zap,
  Globe,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─── ROLE CARDS DATA ─────────────────────────────────────────────────── */
const ROLES = [
  {
    id: 'port_admin',
    title: 'Port Admin',
    desc: 'Full control over 12 ports, user management, master analytics & clearance workflows.',
    tag: 'Full Port Authority',
    icon: ShieldCheck,
    // Light mode palette
    lightGradient: 'from-blue-500/10 via-indigo-500/5 to-purple-500/10',
    lightBorder: 'border-blue-200/60',
    lightHover: 'hover:border-blue-400 hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)]',
    lightAccent: 'text-blue-600',
    lightIconBg: 'bg-blue-100 text-blue-600',
    lightTagBg: 'bg-blue-50 text-blue-700 border-blue-200',
    // Dark mode palette
    darkGradient: 'dark:from-cyan-500/15 dark:via-blue-500/8 dark:to-indigo-500/12',
    darkBorder: 'dark:border-cyan-400/25',
    darkHover: 'dark:hover:border-cyan-300 dark:hover:shadow-[0_8px_50px_rgba(6,182,212,0.35)]',
    darkAccent: 'dark:text-cyan-300',
    darkIconBg: 'dark:bg-cyan-500/20 dark:text-cyan-300',
    darkTagBg: 'dark:bg-cyan-500/15 dark:text-cyan-200 dark:border-cyan-400/30',
    subtext: 'admin@logisync.ai',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'fleet_manager',
    title: 'Fleet Manager',
    desc: 'Live GIS telemetry, gate slot control, real-time alerts & operational oversight.',
    tag: 'Operational Control',
    icon: Truck,
    lightGradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
    lightBorder: 'border-emerald-200/60',
    lightHover: 'hover:border-emerald-400 hover:shadow-[0_8px_40px_rgba(16,185,129,0.25)]',
    lightAccent: 'text-emerald-600',
    lightIconBg: 'bg-emerald-100 text-emerald-600',
    lightTagBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    darkGradient: 'dark:from-teal-500/15 dark:via-emerald-500/8 dark:to-green-500/12',
    darkBorder: 'dark:border-teal-400/25',
    darkHover: 'dark:hover:border-teal-300 dark:hover:shadow-[0_8px_50px_rgba(20,184,166,0.35)]',
    darkAccent: 'dark:text-teal-300',
    darkIconBg: 'dark:bg-teal-500/20 dark:text-teal-300',
    darkTagBg: 'dark:bg-teal-500/15 dark:text-teal-200 dark:border-teal-400/30',
    subtext: 'Provisioned by Port Admin',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'dispatcher',
    title: 'Dispatcher',
    desc: 'Book slots, AI-powered routing suggestions, truck driver e-Pass generation.',
    tag: 'Freight Ingress',
    icon: Layers,
    lightGradient: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10',
    lightBorder: 'border-violet-200/60',
    lightHover: 'hover:border-violet-400 hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)]',
    lightAccent: 'text-violet-600',
    lightIconBg: 'bg-violet-100 text-violet-600',
    lightTagBg: 'bg-violet-50 text-violet-700 border-violet-200',
    darkGradient: 'dark:from-sky-500/15 dark:via-blue-500/8 dark:to-violet-500/12',
    darkBorder: 'dark:border-sky-400/25',
    darkHover: 'dark:hover:border-sky-300 dark:hover:shadow-[0_8px_50px_rgba(14,165,233,0.35)]',
    darkAccent: 'dark:text-sky-300',
    darkIconBg: 'dark:bg-sky-500/20 dark:text-sky-300',
    darkTagBg: 'dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30',
    subtext: 'Self-signup with OTP',
    gradient: 'from-violet-500 to-purple-600',
  },
];

/* ─── TRUST SIGNALS ───────────────────────────────────────────────────── */
const STATS = [
  { icon: Globe, value: '12', label: 'Ports Connected', color: 'text-blue-500 dark:text-cyan-400' },
  { icon: Zap, value: '99.9%', label: 'Uptime SLA', color: 'text-emerald-500 dark:text-teal-400' },
  { icon: BarChart3, value: '2.4M', label: 'Slots Managed', color: 'text-violet-500 dark:text-sky-400' },
  { icon: Shield, value: 'SOC-2', label: 'Compliant', color: 'text-amber-500 dark:text-amber-400' },
];

const REVIEWS = [
  {
    quote: 'LogiSync cut our gate wait-times by 40%. The AI slot engine is a game-changer.',
    author: 'Cpt. Raghav Menon',
    role: 'Port Director, VOC Thoothukudi',
    stars: 5,
  },
  {
    quote: 'Real-time fleet visibility across all berths — we\'ve never had this level of clarity.',
    author: 'Priya Sharma',
    role: 'Ops Lead, IndiaPort Logistics',
    stars: 5,
  },
  {
    quote: 'From onboarding to dispatch, LogiSync makes everything feel effortless.',
    author: 'Arjun Patel',
    role: 'Senior Dispatcher',
    stars: 5,
  },
];

/* ─── COMPONENT ───────────────────────────────────────────────────────── */
export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`role-select-page relative min-h-screen flex flex-col overflow-hidden select-none ${isDark ? 'rs-dark' : 'rs-light'}`}>
      {/* ─── BACKGROUND CANVAS ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Light mode: soft luminous mesh gradients */}
        {!isDark && (
          <>
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-40 bg-gradient-to-br from-blue-400 via-indigo-300 to-violet-200" />
            <div className="absolute -bottom-32 -right-40 w-[700px] h-[700px] rounded-full blur-[140px] opacity-35 bg-gradient-to-tl from-emerald-300 via-teal-200 to-cyan-100" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-25 bg-gradient-to-r from-violet-300 to-fuchsia-200" />
            {/* Subtle dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.08)_1px,transparent_0)] bg-[length:2.5rem_2.5rem]" />
          </>
        )}
        {/* Dark mode: deep space aurora */}
        {isDark && (
          <>
            <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[130px] opacity-50 bg-gradient-to-br from-cyan-500/40 via-blue-600/30 to-indigo-700/20 animate-pulse-slow" />
            <div className="absolute -bottom-48 -right-40 w-[750px] h-[750px] rounded-full blur-[150px] opacity-45 bg-gradient-to-tl from-indigo-500/30 via-violet-600/25 to-purple-700/15" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[110px] opacity-30 bg-gradient-to-r from-teal-400/30 to-sky-500/20" />
            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(56,189,248,0.06)_1px,transparent_0)] bg-[length:3rem_3rem]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,7,18,0.7)_100%)]" />
          </>
        )}
      </div>

      {/* ─── TOP HEADER ───────────────────────────────────────────────── */}
      <header className={`rs-header relative z-20 w-full px-5 sm:px-8 py-3.5 flex items-center justify-between
        ${isDark
          ? 'bg-slate-900/60 border-b border-white/10 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-white/60 border-b border-gray-200/60 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl p-[2px] shadow-lg
            ${isDark
              ? 'bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 shadow-cyan-500/25'
              : 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 shadow-blue-500/20'
            }`}>
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center
              ${isDark ? 'bg-slate-900/90 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md'}`}>
              <Anchor className={`w-5 h-5 ${isDark ? 'text-cyan-300' : 'text-blue-600'}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-black tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>
                LogiSync
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border
                ${isDark
                  ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30'
                  : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                v2.0
              </span>
            </div>
            <div className={`text-[10px] font-medium ${isDark ? 'text-cyan-200/60' : 'text-gray-500'}`}>
              AI-Powered Maritime Command Center
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border
            ${isDark
              ? 'bg-white/[0.06] border-white/15 text-cyan-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
                ${isDark ? 'bg-cyan-400' : 'bg-emerald-500'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2
                ${isDark ? 'bg-cyan-400' : 'bg-emerald-500'}`} />
            </span>
            <span>All Systems Online</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`p-2.5 rounded-xl border transition-all duration-300
              ${isDark
                ? 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border-white/15 hover:border-amber-400/40 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                : 'bg-white/70 hover:bg-white text-indigo-500 border-gray-200 hover:border-indigo-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]'
              }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-12">
        <div className="w-full max-w-5xl">

          {/* ─── HERO SECTION ─────────────────────────────────────────── */}
          <div className="text-center mb-10 sm:mb-14">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5 border backdrop-blur-xl
              ${isDark
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                : 'bg-blue-50/80 text-blue-600 border-blue-200/60 shadow-[0_2px_12px_rgba(59,130,246,0.08)]'
              }`}>
              <Radio className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} />
              Authentication Gateway
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-[3.25rem] font-black tracking-tight leading-[1.1] mb-4
              ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Command Your{' '}
              <span className={`bg-clip-text text-transparent bg-gradient-to-r
                ${isDark ? 'from-cyan-300 via-sky-400 to-blue-400' : 'from-blue-600 via-indigo-600 to-violet-600'}`}>
                Maritime Network
              </span>
              <br />
              <span className={isDark ? 'text-white/90' : 'text-gray-800'}>with AI Precision</span>
            </h1>

            <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed
              ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Choose your role to access real-time fleet telemetry, AI-powered slot scheduling,
              and predictive analytics across 12 connected ports.
            </p>
          </div>

          {/* ─── TRUST STATS BAR ──────────────────────────────────────── */}
          <div className={`rs-stats-bar grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14 mx-auto max-w-3xl`}>
            {STATS.map(s => (
              <div
                key={s.label}
                className={`rs-stat-card flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border text-center backdrop-blur-xl transition-all duration-300
                  ${isDark
                    ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                    : 'bg-white/60 border-gray-200/50 hover:bg-white/90 hover:border-gray-300/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
                  }`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className={`text-lg font-black tabular ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* ─── ROLE CARDS ───────────────────────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => navigate(`/login/${r.id}`)}
                className={`rs-role-card group relative rounded-[1.75rem] p-6 sm:p-7 text-left transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between border backdrop-blur-xl overflow-hidden
                  bg-gradient-to-br ${r.lightGradient} ${r.darkGradient}
                  ${r.lightBorder} ${r.darkBorder}
                  ${r.lightHover} ${r.darkHover}
                  ${isDark
                    ? 'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                    : 'bg-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
                  }
                `}
              >
                {/* Glassmorphism sheen overlay */}
                <div className={`absolute inset-0 rounded-[1.75rem] pointer-events-none
                  ${isDark
                    ? 'bg-gradient-to-br from-white/[0.06] via-transparent to-transparent'
                    : 'bg-gradient-to-br from-white/70 via-white/30 to-transparent'
                  }`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110
                      ${r.lightIconBg} ${r.darkIconBg}`}>
                      <r.icon className="w-5.5 h-5.5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border tracking-wide
                      ${r.lightTagBg} ${r.darkTagBg}`}>
                      {r.tag}
                    </span>
                  </div>

                  <h2 className={`text-xl font-black mb-2 tracking-tight
                    ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {r.title}
                  </h2>
                  <p className={`text-xs leading-relaxed mb-5
                    ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {r.desc}
                  </p>
                </div>

                <div className={`relative z-10 pt-4 border-t flex items-center justify-between text-xs
                  ${isDark ? 'border-white/10' : 'border-gray-200/60'}`}>
                  <span className={`font-medium text-[11px] truncate max-w-[160px]
                    ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {r.subtext}
                  </span>
                  <div className={`flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform duration-300
                    ${r.lightAccent} ${r.darkAccent}`}>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ─── TABBED LOGIN LINK ────────────────────────────────────── */}
          <div className="mt-8 text-center">
            <Link
              to="/login/port_admin"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold border transition-all duration-300 backdrop-blur-xl
                ${isDark
                  ? 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/15 hover:border-white/30'
                  : 'bg-white/60 hover:bg-white text-gray-500 hover:text-gray-800 border-gray-200/60 hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                }`}
            >
              <span>Or open the Unified Tabbed Login Window</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} />
            </Link>
          </div>

          {/* ─── TESTIMONIALS / TRUST SECTION ─────────────────────────── */}
          <div className="mt-14 sm:mt-16">
            <div className="text-center mb-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest
                ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Trusted by Port Operators Worldwide
              </h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {REVIEWS.map((r, i) => (
                <div
                  key={i}
                  className={`rs-review-card rounded-2xl p-5 border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1
                    ${isDark
                      ? 'bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/15'
                      : 'bg-white/50 border-gray-200/40 hover:bg-white/80 hover:border-gray-200/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
                    }`}
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 fill-current ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                    ))}
                  </div>
                  <p className={`text-xs leading-relaxed mb-4 italic
                    ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    "{r.quote}"
                  </p>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
                      {r.author}
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      {r.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className={`relative z-10 w-full px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-medium border-t backdrop-blur-2xl
        ${isDark
          ? 'bg-slate-900/50 border-white/8 text-slate-500'
          : 'bg-white/50 border-gray-200/50 text-gray-400'
        }`}>
        <div>V.O. CHIDAMBARANAR PORT AUTHORITY • DIGITAL TWIN & REAL-TIME AIS</div>
        <div className="flex items-center gap-3">
          <span>AWS COGNITO & LOCAL RBAC READY</span>
          <span>•</span>
          <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>LOGISYNC v2.0</span>
        </div>
      </footer>
    </div>
  );
}

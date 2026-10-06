import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerDispatcher } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Anchor, Truck, Phone, Mail, Lock, User } from 'lucide-react';

function Checklist({ pw }: { pw: string }) {
  const items = [
    ['Minimum 8 characters', pw.length >= 8],
    ['At least one uppercase letter', /[A-Z]/.test(pw)],
    ['At least one number', /\d/.test(pw)],
    ['At least one special character', /[^A-Za-z0-9]/.test(pw)],
  ] as const;
  return <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400">{items.map(([t, ok]) => <li key={t} className={ok ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>{ok ? '✓' : '○'} {t}</li>)}</ul>;
}

const VEHICLE_TYPES = [
  { id: 'trailer', label: 'Trailer', icon: '🚛' },
  { id: 'container_truck', label: 'Container', icon: '📦' },
  { id: 'reefer_truck', label: 'Reefer', icon: '❄️' },
  { id: 'flatbed', label: 'Flatbed', icon: '🏗️' },
  { id: 'tanker', label: 'Tanker', icon: '⛽' },
];

const inputCls = 'w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-4 focus:border-fuchsia-500 focus:ring-fuchsia-200 dark:focus:border-fuchsia-400 dark:focus:ring-fuchsia-500/30 transition [&>option]:text-slate-900';

export default function SignupPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [mobileLocal, setMobileLocal] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicleType, setVehicleType] = useState('container_truck');
  const [photo, setPhoto] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function normalizedMobile() {
    const digits = mobileLocal.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    return `+91${digits}`;
  }

  async function doRegister() {
    setMsg('');
    if (!fullName || !mobileLocal || !email || !vehicle || !pw) { setMsg('Fill all required fields'); return; }
    if (mobileLocal.replace(/\D/g, '').replace(/^91/, '').length !== 10) { setMsg('Enter a valid 10-digit mobile number'); return; }
    if (pw !== pw2) { setMsg('Passwords do not match'); return; }
    setLoading(true);
    try {
      await registerDispatcher({
        full_name: fullName,
        vehicle_number: vehicle,
        vehicle_type: vehicleType,
        photo_url: photo || null,
        mobile: normalizedMobile(),
        email,
        password: pw,
      });
      // Send the new dispatcher to their own login tab — do not auto-login,
      // so the account always starts on the dispatcher dashboard after sign-in.
      navigate('/login/dispatcher', { state: { justRegistered: true } });
    } catch (e: any) { setMsg(JSON.stringify(e?.response?.data?.detail || 'Registration failed')); }
    finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden select-none text-slate-900 dark:text-white" style={{ background: isDark ? 'radial-gradient(1100px 600px at 20% 10%,#ff2fb355,transparent),radial-gradient(950px 650px at 85% 90%,#7597de66,transparent),linear-gradient(160deg,#0d0618,#1a0b2e 60%,#2b1055)' : 'linear-gradient(135deg,#f8fafc 0%,#e0f2fe 35%,#ede9fe 65%,#fdf2f8 100%)' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {!isDark && (
          <>
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-50 bg-gradient-to-br from-blue-300 via-indigo-200 to-violet-200" />
            <div className="absolute -bottom-32 -right-40 w-[700px] h-[700px] rounded-full blur-[140px] opacity-40 bg-gradient-to-tl from-fuchsia-200 via-purple-100 to-cyan-100" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.12)_1px,transparent_0)] bg-[length:2.5rem_2.5rem]" />
          </>
        )}
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-40" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <path key={i} d={`M-50 ${120 + i * 110} C 200 ${80 + i * 110}, 350 ${180 + i * 110}, 600 ${130 + i * 110} S 1000 ${90 + i * 110}, 1300 ${150 + i * 110}`} fill="none" stroke={isDark ? '#ff5cc4' : '#a78bfa'} strokeOpacity={0.55 - i * 0.06} strokeWidth={1.6} strokeDasharray={i % 2 ? '10 8' : undefined} />
          ))}
          <path d="M-50 580 L 350 400 L 750 480 L 1300 240" fill="none" stroke={isDark ? '#fff' : '#7c3aed'} strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="2 10" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0" style={{ backgroundImage: isDark ? 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)' : 'radial-gradient(rgba(100,116,139,0.14) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.5 }} />
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2b1055] via-[#6d28d9] to-[#ff2fb3] p-[2px]">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-950 flex items-center justify-center"><Anchor className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-300" /></div>
          </div>
          <span className="font-black tracking-wider text-slate-900 dark:text-white">LogiSync · Dispatcher Signup</span>
        </Link>
        <button onClick={toggleTheme} className="px-3 py-1.5 rounded-xl bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-600 dark:text-white text-xs font-bold backdrop-blur-xl shadow-sm">{isDark ? '☀ Light' : '☾ Dark'}</button>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-[640px] rounded-[2rem] bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/60 dark:border-white/15 shadow-[0_24px_70px_rgba(109,40,217,0.18)] dark:shadow-2xl p-7 sm:p-9 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 dark:border-fuchsia-400/30">Freight ingress · Driver onboarding</div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create dispatcher account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">OTP verification removed for now — account is created instantly.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" /><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Driver full name *" className={inputCls} /></div>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-sm font-bold">+91</span>
              <div className="relative flex-1"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" /><input value={mobileLocal} onChange={e => setMobileLocal(e.target.value.replace(/[^\d]/g, '').slice(0, 10))} placeholder="10-digit mobile *" inputMode="numeric" className={`${inputCls} rounded-l-none pr-14`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 dark:text-slate-400">{normalizedMobile()}</span></div>
            </div>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" /><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" className={inputCls} /></div>
            <div className="relative"><Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" /><input value={vehicle} onChange={e => setVehicle(e.target.value.toUpperCase())} placeholder="Vehicle number (TN01AB1234) *" className={inputCls} /></div>
            <div className="relative sm:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vehicle type *</div>
              <div className="flex gap-1.5">
                {VEHICLE_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setVehicleType(t.id)}
                    className={`flex-1 py-2 rounded-xl border text-center transition-all duration-150 ${
                      vehicleType === t.id
                        ? 'bg-gradient-to-b from-fuchsia-500/20 to-purple-500/10 border-fuchsia-400/60 shadow-[0_0_10px_rgba(217,70,239,0.25)]'
                        : 'bg-white/50 dark:bg-slate-800/40 border-white/60 dark:border-white/10 hover:border-fuchsia-400/30'
                    }`}
                  >
                    <div className="text-base leading-none">{t.icon}</div>
                    <div className="text-[8px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" /><input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password *" className={inputCls} /></div>
            <div className="relative sm:col-span-2"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" /><input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Confirm password *" className={inputCls} /></div>
            <input value={photo} onChange={e => setPhoto(e.target.value)} placeholder="Photo URL (optional)" className="sm:col-span-2 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm" />
          </div>
          <Checklist pw={pw} />
          <div className={`text-xs font-semibold ${!pw2 ? 'text-slate-500 dark:text-slate-400' : pw === pw2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{pw2 ? (pw === pw2 ? '✓ passwords match' : '✗ passwords do not match') : 'Confirm your password above'}</div>
          <button disabled={loading} onClick={doRegister} className="w-full py-4 rounded-2xl text-white text-sm font-black bg-gradient-to-r from-[#2b1055] via-[#6d28d9] to-[#ff2fb3] disabled:opacity-60">{loading ? 'Creating…' : 'Create Account →'}</button>
          {msg && <div className="text-xs font-medium text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 rounded-2xl p-3">{msg}</div>}
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 pb-1"><Link to="/" className="hover:text-slate-800 dark:hover:text-white">← Back to roles</Link> · <Link to="/login/dispatcher" className="font-bold underline underline-offset-2 text-fuchsia-700 dark:text-fuchsia-300">Sign in</Link></p>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Eye, Route as RouteIcon, XCircle, X } from 'lucide-react';
import { fetchMyBookings, rescheduleBooking, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EPassModal } from '../components/slot-booking/EPassModal';
import { RoutePanel } from '../components/slot-booking/RoutePanel';
import { getPort } from '../data/ports';
import type { BookingRecord, BookingStatus, PriorityTier, ServiceType, VehicleType } from '../data/portServiceData';

const TIER_FEES: Record<string, number> = { standard: 0, express: 500, urgent: 1000 };

function toBookingRecord(b: any, driverName: string, driverPhone: string): BookingRecord {
  const tier = (b.priority_tier || 'standard') as PriorityTier;
  const status: BookingStatus =
    b.status === 'queued' ? 'upcoming'
    : b.status === 'completed' || b.status === 'cancelled' ? 'completed'
    : 'in_progress';
  return {
    id: b.id,
    tokenNumber: b.token_number,
    portId: b.port_id,
    service: (b.service_type || 'general') as ServiceType,
    serviceLabel: b.service_type || 'General',
    gate: b.gate_id,
    date: b.reserved_date,
    timeWindow: `${b.reserved_time_start || ''} – ${b.reserved_time_end || ''}`,
    vehicleNumber: b.vehicle_number,
    vehicleType: (b.vehicle_type || 'container_truck') as VehicleType,
    driverName,
    driverPhone,
    driverLicenseOk: true,
    destination: b.delivery_destination,
    status,
    tier,
    tierFee: TIER_FEES[tier] ?? 0,
    cargoType: b.service_type || 'Cargo',
  };
}

const STATUS_CLS: Record<string, string> = {
  queued: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
  in_transit: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  at_gate: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  loading: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  delayed: 'bg-red-500/15 text-red-700 dark:text-red-300',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-slate-500/15 text-slate-500 dark:text-slate-400',
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [detailsFor, setDetailsFor] = useState<any | null>(null);
  const [routeFor, setRouteFor] = useState<any | null>(null);
  const [reschedFor, setReschedFor] = useState<any | null>(null);
  const [form, setForm] = useState({ date: '', start: '', end: '', gate: '' });
  const [saving, setSaving] = useState(false);

  const load = () => fetchMyBookings().then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/telemetry`);
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (m.type === 'booking_status') load();
      } catch {}
    };
    return () => ws.close();
  }, []);

  const driverName = user?.name || '';
  const driverPhone = user?.mobile_number || '';

  function openReschedule(b: any) {
    setReschedFor(b);
    setForm({
      date: b.reserved_date || '',
      start: b.reserved_time_start || '',
      end: b.reserved_time_end || '',
      gate: b.gate_id || '',
    });
  }

  async function saveReschedule() {
    if (!reschedFor) return;
    if (!form.date || !form.start) {
      showToast({ type: 'warning', title: 'Missing Fields', message: 'Pick a date and start time.' });
      return;
    }
    setSaving(true);
    try {
      await rescheduleBooking(reschedFor.id, {
        reserved_date: form.date,
        reserved_time_start: form.start,
        reserved_time_end: form.end || undefined,
        gate_id: form.gate || undefined,
      });
      showToast({ type: 'success', title: 'Rescheduled', message: `Slot moved to ${form.date} ${form.start}.` });
      setReschedFor(null);
      load();
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      showToast({ type: 'error', title: 'Reschedule Failed', message: typeof detail === 'string' ? detail : 'Could not reschedule this booking.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(b: any) {
    if (!window.confirm(`Cancel slot ${b.token_number}? This action cannot be undone.`)) return;
    try {
      await cancelBooking(b.id);
      showToast({ type: 'success', title: 'Slot Cancelled', message: 'Gate capacity released.' });
      load();
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      showToast({ type: 'error', title: 'Cancel Failed', message: typeof detail === 'string' ? detail : 'Could not cancel this booking.' });
    }
  }

  const reschedGates = reschedFor ? getPort(reschedFor.port_id)?.gates ?? [] : [];
  const fieldCls = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40';

  return (
    <div className="min-h-full bg-slate-100 dark:bg-slate-950">
      <div className="max-w-[1100px] mx-auto p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-lg text-slate-900 dark:text-white">My Bookings</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{rows.length} total</span>
        </div>

        {rows.map(b => (
          <div key={b.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-sm">
              <span className="font-mono font-bold text-slate-900 dark:text-white">{b.token_number}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLS[b.status] || STATUS_CLS.queued}`}>
                {(b.status || '').replace('_', ' ')}
              </span>
              <span className="text-slate-600 dark:text-slate-300">{b.gate_id}</span>
              <span className="text-slate-600 dark:text-slate-300 font-mono">{b.reserved_date} {b.reserved_time_start}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{b.vehicle_number}</span>
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[280px]">{b.delivery_destination}</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs uppercase">{b.priority_tier}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setDetailsFor(b)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
              </button>
              <button
                onClick={() => setRouteFor(b)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
              >
                <RouteIcon className="w-3.5 h-3.5" /> View Route
              </button>
              {b.status === 'queued' && (
                <>
                  <button
                    onClick={() => openReschedule(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:border-cyan-400 transition-colors"
                  >
                    <CalendarClock className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(b)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No bookings yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create one in Slot Booking.</p>
          </div>
        )}
      </div>

      {/* ── View Details: centered e-Pass popup with QR + PDF download ── */}
      {detailsFor && (
        <EPassModal
          booking={toBookingRecord(detailsFor, driverName, driverPhone)}
          onClose={() => setDetailsFor(null)}
        />
      )}

      {/* ── View Route: in-app Geoapify routes, pick one for Home ── */}
      {routeFor && (
        <RoutePanel
          booking={toBookingRecord(routeFor, driverName, driverPhone)}
          onClose={() => setRouteFor(null)}
          onSelectRoute={() => { setRouteFor(null); navigate('/home'); }}
        />
      )}

      {/* ── Reschedule: centered popup ── */}
      {reschedFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReschedFor(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Reschedule {reschedFor.token_number}
              </h3>
              <button onClick={() => setReschedFor(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={fieldCls} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Start</label>
                <input type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className={fieldCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">End</label>
                <input type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className={fieldCls} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Gate</label>
              {reschedGates.length > 0 ? (
                <select value={form.gate} onChange={e => setForm({ ...form, gate: e.target.value })} className={fieldCls}>
                  {reschedGates.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              ) : (
                <input value={form.gate} onChange={e => setForm({ ...form, gate: e.target.value })} className={fieldCls} />
              )}
            </div>
            <button
              onClick={saveReschedule}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

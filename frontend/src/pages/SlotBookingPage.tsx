// ─── SlotBookingPage — Gate Slot Allocation & AI Dispatch (Redesign) ──────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { usePort } from '../context/PortContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { PortSelectorBar } from '../components/slot-booking/PortSelectorBar';
import { PortSelectorModal } from '../components/slot-booking/PortSelectorModal';
import { ServiceGateOverview } from '../components/slot-booking/ServiceGateOverview';
import { CongestionSection } from '../components/slot-booking/CongestionSection';
import { SlotSchedulingZone } from '../components/slot-booking/SlotSchedulingZone';
import type { BookingRecord } from '../data/portServiceData';
import { getPort } from '../data/ports';

export default function SlotBookingPage() {
  const { portId: globalPortId, setPortId } = usePort();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  // ── Page-level state ─────────────────────────────────────────────────────
  const [selectedPortId, setSelectedPortId] = useState<string | null>(
    globalPortId || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateOffset, setDateOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const port = selectedPortId ? getPort(selectedPortId) : null;

  // ── Port selection handlers ───────────────────────────────────────────────
  const handlePortSelect = (id: string) => {
    setSelectedPortId(id);
    setPortId(id); // sync global context
    setIsModalOpen(false);
    setDateOffset(0);
    showToast({
      type: 'success',
      title: 'Port Selected',
      message: `Now viewing ${getPort(id).name}`,
    });
  };

  const handlePortClear = () => {
    setSelectedPortId(null);
  };

  // ── Booking handlers ─────────────────────────────────────────────────────
  const handleBookingConfirmed = (booking: BookingRecord) => {
    showToast({
      type: 'success',
      title: 'Slot Confirmed!',
      message: `e-Pass ${booking.tokenNumber} issued. Opening My Bookings.`,
    });
    // Dispatch notification to the TopBar bell feed
    addNotification({
      type: 'slot',
      title: `Slot Booked — ${booking.tokenNumber}`,
      body: `${booking.driverName} · ${booking.vehicleNumber} · ${booking.gate} · ${booking.timeWindow} on ${booking.date}`,
      bookingDetails: booking,
    });
    // Bookings live in the separate My Bookings panel
    navigate('/my-bookings');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setIsRefreshing(false);
    showToast({ type: 'success', title: 'Refreshed', message: 'Gate data updated.' });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-canvas)] relative">

      {/* ── SECTION ZERO: Page Header (unchanged) ─────────────────────────── */}
      <div className="px-6 py-4 border-b border-white/40 dark:border-white/10 flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white chroma-text">
              Gate Slot Allocation &amp; AI Dispatch
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
              AI OPTIMIZED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time terminal gates availability · Dynamic slot booking · Driver e-Pass encryption
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          isLoading={isRefreshing}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── Scrollable content area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* ── SECTION A: Port Selector ──────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-white/40 dark:border-white/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Port Selection
          </p>
          <PortSelectorBar
            selectedPortId={selectedPortId}
            onClick={() => setIsModalOpen(true)}
            onClear={handlePortClear}
          />
          {!selectedPortId && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
              ↑ Search or select a port to unlock all features below
            </p>
          )}
        </div>

        {/* ── SECTION B: Service & Gate Overview ───────────────────────── */}
        <ServiceGateOverview port={port} onRefresh={handleRefresh} />

        {/* ── SECTION C: Date Tracker + Congestion Intelligence ─────────── */}
        <CongestionSection
          port={port}
          dateOffset={dateOffset}
          onDateChange={setDateOffset}
        />

        {/* ── SECTION D: Slot Scheduling Zone ───────────────────────────── */}
        <div id="tutorial-booking-form">
          <div className="px-6 pt-4 pb-2 border-t border-white/40 dark:border-white/10">
            <h2 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Slot Scheduling Zone
            </h2>
            {!selectedPortId && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Select a port above to begin booking
              </p>
            )}
          </div>
          <SlotSchedulingZone
            port={port}
            onBookingConfirmed={handleBookingConfirmed}
          />
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>

      {/* ── Port Selector Modal (global overlay) ─────────────────────────── */}
      <PortSelectorModal
        isOpen={isModalOpen}
        currentPortId={selectedPortId}
        onSelect={handlePortSelect}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

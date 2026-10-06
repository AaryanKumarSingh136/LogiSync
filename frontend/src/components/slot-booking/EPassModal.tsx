// ─── EPassModal — Transit e-Pass artifact with real QR + PDF download ──────────
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, QrCode, Shield, Anchor } from 'lucide-react';
import { clsx } from 'clsx';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '../ui/Button';
import type { BookingRecord } from '../../data/portServiceData';
import { getPort } from '../../data/ports';

const TIER_COLOR: Record<string, string> = {
  standard: 'text-slate-400 border-slate-400/40 bg-slate-400/10',
  express:  'text-sky-400 border-sky-400/40 bg-sky-400/10',
  urgent:   'text-amber-400 border-amber-400/40 bg-amber-400/10',
};

const VEH_LABELS: Record<string, string> = {
  trailer: 'Heavy Trailer',
  container_truck: 'Container Truck',
  reefer_truck: 'Reefer Truck',
  flatbed: 'Flatbed',
  tanker: 'Tanker',
};

interface EPassModalProps {
  booking: BookingRecord | null;
  onClose: () => void;
}

export function epassQrPayload(booking: BookingRecord): string {
  return `LOGISYNC-EPASS|${booking.tokenNumber}|${booking.portId}|${booking.date}|${booking.timeWindow}|${booking.vehicleNumber}`;
}

export async function epassQrDataUrl(booking: BookingRecord): Promise<string> {
  try {
    return await QRCode.toDataURL(epassQrPayload(booking), { width: 220, margin: 1 });
  } catch {
    return '';
  }
}

function RealQr({ booking }: { booking: BookingRecord }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let live = true;
    epassQrDataUrl(booking).then(u => { if (live) setUrl(u); });
    return () => { live = false; };
  }, [booking]);
  if (!url) {
    return (
      <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 flex items-center justify-center">
        <QrCode className="w-8 h-8 text-slate-300 animate-pulse" />
      </div>
    );
  }
  return <img src={url} alt="e-Pass QR code" className="w-20 h-20 bg-white rounded-lg p-1 flex-shrink-0" />;
}

export function EPassModal({ booking, onClose }: EPassModalProps) {
  const port = booking ? getPort(booking.portId) : null;

  const handleDownload = async () => {
    const doc = new jsPDF();
    let y = 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 40, 70);
    doc.text('LogiSync — Transit e-Pass', 10, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${port?.name || ''} (${port?.locode || ''})`, 10, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Token: ${booking.tokenNumber}`, 10, y);
    y += 10;

    const qr = await epassQrDataUrl(booking);
    const textX = qr ? 62 : 10;
    if (qr) {
      try { doc.addImage(qr, 'PNG', 10, y, 45, 45); } catch { /* skip QR */ }
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const rows: [string, string][] = [
      ['Origin', `${port?.name || ''} — ${port?.city || ''}`],
      ['Destination', booking.destination],
      ['Gate & Service', `${booking.gate} · ${booking.serviceLabel}`],
      ['Reserved Window', `${booking.date} · ${booking.timeWindow}`],
      ['Vehicle', `${booking.vehicleNumber} · ${VEH_LABELS[booking.vehicleType] ?? booking.vehicleType}`],
      ['Driver', `${booking.driverName}${booking.driverPhone ? ` · ${booking.driverPhone}` : ''}`],
      ['Priority', `${booking.tier} · ${booking.tierFee === 0 ? 'Rs 0' : `Rs ${booking.tierFee.toLocaleString('en-IN')}`}`],
      ['Status', booking.status],
    ];
    rows.forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, textX, y + 5);
      y += 7;
    });
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Valid for reserved date · Fast-pass lane eligible', 10, y + 40);
    doc.text(`Issued ${new Date().toLocaleString('en-IN')} IST`, 10, y + 46);
    doc.save(`epass-${booking.tokenNumber}.pdf`);
  };

  return (
    <AnimatePresence>
      {booking && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-md"
            >
              {/* Close + Download controls */}
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Transit e-Pass</span>
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl flex items-center justify-center
                      bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* e-Pass card */}
              <div id="epass-print-root" className="rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Main stub — dark navy */}
                <div className="bg-[#141C2B] px-6 pt-5 pb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <Anchor className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">LogiSync</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Transit e-Pass</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white">{port?.name}</p>
                      <p className="text-[9px] text-cyan-400 font-mono">{port?.locode}</p>
                    </div>
                  </div>

                  {/* Token + QR */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Token Number</p>
                      <p className="text-lg font-black font-mono text-white leading-none">
                        {booking.tokenNumber}
                      </p>
                    </div>
                    <RealQr booking={booking} />
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px]">
                    {[
                      { label: 'Origin', value: `${port?.name} — ${port?.city}` },
                      { label: 'Destination', value: booking.destination },
                      { label: 'Gate & Service', value: `${booking.gate} · ${booking.serviceLabel}` },
                      { label: 'Reserved Window', value: `${booking.date} · ${booking.timeWindow}` },
                      { label: 'Vehicle', value: `${booking.vehicleNumber} · ${VEH_LABELS[booking.vehicleType] ?? booking.vehicleType}` },
                      { label: 'Driver', value: booking.driverName },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-white font-semibold leading-tight">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Driver KYC + Priority */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={clsx(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border',
                      booking.driverLicenseOk
                        ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10'
                        : 'text-red-400 border-red-400/40 bg-red-400/10'
                    )}>
                      <Shield className="w-2.5 h-2.5" />
                      {booking.driverLicenseOk ? 'KYC VERIFIED' : 'KYC PENDING'}
                    </span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-[9px] font-black border', TIER_COLOR[booking.tier])}>
                      {booking.tier.toUpperCase()} ·{' '}
                      {booking.tierFee === 0 ? '₹0' : `₹${booking.tierFee.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                {/* Perforated divider */}
                <div className="bg-[#141C2B] px-6 py-0">
                  <div className="border-t-2 border-dashed border-slate-600/50 relative">
                    <div className="absolute -left-6 -top-2.5 w-5 h-5 rounded-full bg-black/60" />
                    <div className="absolute -right-6 -top-2.5 w-5 h-5 rounded-full bg-black/60" />
                  </div>
                </div>

                {/* Tear-off token stub */}
                <div className="bg-[#1B2438] px-6 py-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Validity</p>
                      <p className="text-[11px] text-slate-300 font-semibold">
                        Valid for reserved date · Fast-pass lane eligible
                      </p>
                    </div>
                    <QrCode className="w-5 h-5 text-cyan-400/40" />
                  </div>

                  {/* Issued timestamp */}
                  <p className="text-[9px] text-slate-600 mt-2 font-mono">
                    ISSUED · {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST
                  </p>

                  {/* Barcode strip */}
                  <div className="mt-3 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center px-2 gap-0.5 overflow-hidden">
                    {booking.tokenNumber.split('').map((ch, i) => (
                      <div
                        key={i}
                        className="bg-white/25 flex-shrink-0 rounded-[1px]"
                        style={{ width: '3px', height: `${12 + (ch.charCodeAt(0) % 12)}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

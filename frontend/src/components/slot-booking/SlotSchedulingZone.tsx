// ─── SlotSchedulingZone — booking form only ────────────────────────────────────
// The My Bookings tab was removed: bookings live in the separate /my-bookings panel.
import { HowToBookTab } from './HowToBookTab';
import type { PortInfo } from '../../data/ports';
import type { BookingRecord } from '../../data/portServiceData';

interface SlotSchedulingZoneProps {
  port: PortInfo | null;
  onBookingConfirmed: (booking: BookingRecord) => void;
}

export function SlotSchedulingZone({ port, onBookingConfirmed }: SlotSchedulingZoneProps) {
  return (
    <div className="px-6 py-4">
      <HowToBookTab port={port} onBookingConfirmed={onBookingConfirmed} />
    </div>
  );
}

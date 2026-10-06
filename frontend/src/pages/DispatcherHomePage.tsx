import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { GoogleMapCanvas, isMapAlive } from '../components/map/GoogleMapCanvas';
import { createTruckDivIcon } from '../components/map/TruckMarker';
import {
  fetchMyBookings, fetchRoute, geocodePlace,
  loadStoredRoute, clearStoredRoute, type StoredRoute,
} from '../services/api';
import { usePort } from '../context/PortContext';

const ACTIVE = new Set(['queued', 'in_transit', 'at_gate', 'loading']);
// Where each status starts along its route (deterministic, no clock math)
const START_FRAC: Record<string, number> = {
  queued: 0, in_transit: 0.4, at_gate: 0.85, loading: 0.95,
};
// Simulated glide speed (m/s) — constant, frame-rate independent
const SIM_SPEED_MPS = 300;

interface Sim {
  marker: L.Marker;
  status: string;
  latlngs: [number, number][];
  cum: number[];
  total: number;
  traveled: number;
}

function haversineM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function posAt(s: Sim): [number, number] {
  const { latlngs, cum, total, traveled } = s;
  if (traveled <= 0) return latlngs[0];
  if (traveled >= total) return latlngs[latlngs.length - 1];
  let i = 1;
  while (i < cum.length - 1 && cum[i] < traveled) i++;
  const segLen = cum[i] - cum[i - 1] || 1;
  const f = (traveled - cum[i - 1]) / segLen;
  const a = latlngs[i - 1], b = latlngs[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

export default function DispatcherHomePage() {
  const { port } = usePort();
  const [map, setMap] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [storedInfo, setStoredInfo] = useState<Record<string, StoredRoute>>({});
  const layers = useRef<L.Layer[]>([]);
  const sims = useRef(new Map<string, Sim>());
  const geoCache = useRef(new Map<string, [number, number]>());
  const raf = useRef(0);

  const load = () => fetchMyBookings().then(setBookings).catch(() => {});
  useEffect(() => { load(); }, []);

  // Live status push from fleet managers (no refresh needed)
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

  useEffect(() => {
    if (!map || !isMapAlive(map)) return;
    let cancelled = false;

    // Clear previous frame: routes, markers, loop
    cancelAnimationFrame(raf.current);
    layers.current.forEach(l => { try { (map as L.Map).removeLayer(l); } catch {} });
    layers.current = [];
    sims.current.forEach(s => { try { s.marker.remove(); } catch {} });
    sims.current.clear();
    setStoredInfo({});

    const visible = bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      if (hideCompleted && b.status === 'completed') return false;
      return true;
    });

    (async () => {
      for (const b of visible) {
        const stored = loadStoredRoute(b.id);
        let latlngs: [number, number][];
        let color = b.status === 'completed' ? '#94a3b8' : '#06b6d4';
        let weight = 4;

        if (stored) {
          latlngs = stored.latlngs;
          color = stored.color;
          weight = 5;
          setStoredInfo(prev => (prev[b.id] ? prev : { ...prev, [b.id]: stored }));
        } else {
          const fromLat = b.current_lat || port.lat + 0.05;
          const fromLng = b.current_lng || port.lng - 0.05;
          let dest: [number, number] | undefined;
          const destKey = (b.delivery_destination || '').trim();
          if (destKey) {
            dest = geoCache.current.get(destKey) || undefined;
            if (!dest) {
              const g = await geocodePlace(destKey);
              if (g) { dest = g; geoCache.current.set(destKey, g); }
            }
          }
          const toLat = dest?.[0] ?? port.lat - 1.1;
          const toLng = dest?.[1] ?? port.lng + 1.4;
          try {
            const r = await fetchRoute(fromLat, fromLng, toLat, toLng);
            latlngs = r.geometry.coordinates.map(c => [c[1], c[0]] as [number, number]);
            if (latlngs.length < 2) throw new Error('empty route');
          } catch {
            latlngs = [[fromLat, fromLng], [toLat, toLng]];
          }
        }

        if (cancelled || !isMapAlive(map)) return;
        const line = L.polyline(latlngs, {
          color, weight, opacity: b.status === 'completed' ? 0.4 : 0.9,
        }).addTo(map);
        layers.current.push(line);
        (line as any).on('click', () => setSelected(b));

        if (ACTIVE.has(b.status)) {
          const marker = L.marker(latlngs[0], {
            icon: createTruckDivIcon(
              { truckType: 'container_chassis', status: b.status },
              selected?.id === b.id
            ),
            keyboard: false,
          }).addTo(map);
          layers.current.push(marker);
          (marker as any).on('click', () => setSelected(b));
          const cum = [0];
          for (let i = 1; i < latlngs.length; i++) {
            cum.push(cum[i - 1] + haversineM(latlngs[i - 1], latlngs[i]));
          }
          const total = cum[cum.length - 1] || 1;
          const sim: Sim = {
            marker, status: b.status, latlngs, cum, total,
            traveled: (START_FRAC[b.status] ?? 0) * total,
          };
          marker.setLatLng(posAt(sim));
          sims.current.set(b.id, sim);
        }
      }

      // One frame-rate-independent loop for all markers
      let last = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        sims.current.forEach(s => {
          s.traveled = Math.min(s.total, s.traveled + SIM_SPEED_MPS * dt);
          try { s.marker.setLatLng(posAt(s)); } catch {}
        });
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    })();

    return () => { cancelled = true; cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, bookings, hideCompleted, port]);

  // Refresh selected-ring without rebuilding markers
  useEffect(() => {
    sims.current.forEach((s, id) => {
      try {
        s.marker.setIcon(
          createTruckDivIcon({ truckType: 'container_chassis', status: s.status }, id === selected?.id)
        );
      } catch {}
    });
  }, [selected?.id]);

  const stored = selected ? storedInfo[selected.id] : undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-white/40 dark:border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Dispatcher Command Center</h2>
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-400/30">
            My Routes
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{bookings.length} bookings</span>
          <label className="ml-auto text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={hideCompleted} onChange={e => setHideCompleted(e.target.checked)} /> Hide completed</label>
        </div>
      </div>
      <div className="flex-1 relative min-h-0">
        <GoogleMapCanvas center={{ lat: port.lat, lng: port.lng }} zoom={port.zoom} onMapReady={setMap} />
        {selected && (
          <div className="absolute top-3 right-3 z-20 p-4 rounded-2xl liquid-glass-elevated border text-xs space-y-1 w-64">
            <div className="font-bold">{selected.token_number}</div>
            <div>Status: <span className="font-bold">{selected.status}</span></div>
            <div>Gate: {selected.gate_id}</div>
            <div>Dest: {selected.delivery_destination}</div>
            {stored && (
              <div className="pt-1 mt-1 border-t border-slate-200/60 dark:border-white/10">
                <div className="font-bold" style={{ color: stored.color }}>{stored.label}</div>
                <div>{stored.distanceKm} km · ~{Math.floor(stored.etaMin / 60)}h {stored.etaMin % 60}m</div>
                <button
                  onClick={() => { clearStoredRoute(selected.id); setStoredInfo(prev => { const n = { ...prev }; delete n[selected.id]; return n; }); load(); }}
                  className="underline"
                >
                  Clear chosen route
                </button>
              </div>
            )}
            <button onClick={() => setSelected(null)} className="underline">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

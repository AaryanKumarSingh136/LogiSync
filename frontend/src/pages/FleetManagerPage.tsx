import { useEffect, useState } from 'react';
import { GoogleMapCanvas } from '../components/map/GoogleMapCanvas';
import { TruckMarker } from '../components/map/TruckMarker';
import { fetchFleet, createTelemetryWebSocket } from '../services/api';
import { getDemoFleet } from '../data/demoFleet';
import { getPort } from '../data/ports';
import { usePort } from '../context/PortContext';
import { useAuth } from '../context/AuthContext';
import type { Truck } from '../types';

export default function FleetManagerPage() {
  const { user } = useAuth();
  const { portId, setPortId } = usePort();
  const assignedPortId = ((user as any)?.assigned_port_id as string) || portId || 'voc';
  const port = getPort(assignedPortId);

  // Fleet managers are locked to their assigned port — ignore any other selection.
  useEffect(() => {
    const assigned = (user as any)?.assigned_port_id as string | undefined;
    if (assigned && portId !== assigned) setPortId(assigned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(user as any)?.assigned_port_id]);

  const [map, setMap] = useState<any>(null);
  const [fleet, setFleet] = useState<Truck[]>(() => getDemoFleet(assignedPortId));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setFleet(getDemoFleet(assignedPortId));
    fetchFleet(assignedPortId)
      .then(data => { if (data && data.length > 0) setFleet(data); })
      .catch(() => {});
  }, [assignedPortId]);

  // Live position updates for this port only
  useEffect(() => {
    const handle = createTelemetryWebSocket(
      assignedPortId,
      update => {
        if (!update.id) return;
        setFleet(prev => prev.map(truck => truck.id === update.id ? {
          ...truck,
          latitude: update.latitude ?? truck.latitude,
          longitude: update.longitude ?? truck.longitude,
          speedKmh: update.speedKmh ?? truck.speedKmh,
          heading: update.heading ?? truck.heading,
          fuelPct: update.fuelPct ?? truck.fuelPct,
          status: update.status ?? truck.status,
        } : truck));
      },
      undefined,
      undefined
    );
    return () => handle.close();
  }, [assignedPortId]);

  const selected = fleet.find(t => t.id === selectedId) || null;

  const handleTruckClick = (truck: Truck) => {
    setSelectedId(truck.id);
    try {
      map?.panTo({ lat: truck.latitude, lng: truck.longitude });
      map?.setZoom(14);
    } catch { /* map not ready */ }
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {/* Full-bleed assigned-port map */}
      <div className="absolute inset-0">
        <GoogleMapCanvas key={`map-${port.lat}-${port.lng}`} center={{ lat: port.lat, lng: port.lng }} zoom={port.zoom} onMapReady={setMap} />
      </div>

      {map && fleet.map(truck => (
        <TruckMarker key={truck.id} map={map} truck={truck} selected={selectedId === truck.id} onClick={handleTruckClick} />
      ))}

      {/* Assigned-port chip */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black bg-white/90 dark:bg-slate-900/90 border shadow-lg backdrop-blur-xl">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-slate-800 dark:text-slate-100">{port.short}</span>
        <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{fleet.length} trucks</span>
      </div>

      {fleet.length === 0 && (
        <div className="absolute left-3 top-14 z-10 px-3 py-2 rounded-xl text-xs bg-white/90 dark:bg-slate-900/90 border shadow-lg backdrop-blur-xl text-slate-500 dark:text-slate-400">
          No trucks assigned to this port yet.
        </div>
      )}

      {/* Compact selected-truck chip (map markers stay the focus) */}
      {selected && (
        <div className="absolute left-3 bottom-3 z-10 w-[260px] p-3 rounded-2xl bg-white/92 dark:bg-slate-900/92 border shadow-2xl backdrop-blur-2xl text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-black text-slate-900 dark:text-white">{selected.id}</span>
            <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold">✕</button>
          </div>
          <div className="text-slate-500 dark:text-slate-400">{selected.plate} · {selected.driver.name}</div>
          <div className="font-bold text-cyan-700 dark:text-cyan-300">{(selected.status || 'unknown').replace('_', ' ')}</div>
          <div className="text-slate-500 dark:text-slate-400 tabular-nums">{selected.speedKmh} km/h · Fuel {selected.fuelPct}%</div>
        </div>
      )}
    </div>
  );
}

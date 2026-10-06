from fastapi import APIRouter, Query, Depends, Request, HTTPException
from typing import Dict, Any, List, Optional
from app.services.fuel_model import fuel_model
from app.middleware.rate_limiter import limiter
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.ports import DEFAULT_PORT_ID, is_valid_port
from app.data.port_analytics_seed import get_port_analytics
import hashlib

router = APIRouter(prefix="/analytics", tags=["Analytics & Predictive BI"], dependencies=[Depends(get_current_user)])


def _require_port(port: Optional[str]) -> str:
    port_id = port or DEFAULT_PORT_ID
    if not is_valid_port(port_id):
        raise HTTPException(status_code=400, detail=f"Unknown port '{port_id}'")
    return port_id


def _port_factor(port_id: str) -> float:
    """Deterministic per-port scale for simulated BI numbers. VOC stays 1.0."""
    if port_id == DEFAULT_PORT_ID:
        return 1.0
    h = int(hashlib.md5(f"bi-{port_id}".encode()).hexdigest(), 16)
    return round(0.7 + (h % 60) / 100.0, 3)


def _period_scale(period: Optional[str], port_id: str) -> float:
    """Deterministic period multiplier so 24h/7d/30d differ but stay stable."""
    p = (period or '24h').lower()
    if p in ('monthly', '30d', 'month'):
        base = 24.0
    elif p in ('7d', '7day', 'week', 'last7d'):
        base = 6.4
    else:
        return 1.0
    h = int(hashlib.md5(f"per-{port_id}-{p}".encode()).hexdigest(), 16)
    jitter = 0.92 + (h % 16) / 100.0
    return round(base * jitter, 3)


def _resolve_port(port: Optional[str], user: Dict[str, Any]) -> str:
    """Fleet managers are locked to assigned_port_id; admins may pass any port."""
    if isinstance(user, dict) and user.get('role') == 'fleet_manager':
        assigned = user.get('assigned_port_id') or DEFAULT_PORT_ID
        if port and port != assigned:
            raise HTTPException(status_code=403, detail='Fleet managers limited to assigned port.')
        return _require_port(assigned)
    return _require_port(port)


class SimulationRequest(BaseModel):
    num_trucks: Optional[int] = 100
    arrival_distribution: Optional[str] = "poisson"
    gate_capacity_multiplier: Optional[float] = 1.0
    dynamic_rerouting_enabled: Optional[bool] = True
    time_horizon_hours: Optional[int] = 8


@router.get("/kpis")
def get_kpis(
    period: Optional[str] = Query("24h"),
    port: Optional[str] = Query(None, description="Port id (e.g. voc, vizag)"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Returns top-level port performance KPIs — distinct seed per port + period."""
    port_id = _resolve_port(port, user)
    seed = get_port_analytics(port_id)
    scale = _period_scale(period, port_id)
    h = int(hashlib.md5(f"kpi-{port_id}-{period}".encode()).hexdigest(), 16)
    wait_adj = 0.9 + (h % 20) / 100.0
    util_adj = 0.94 + (h % 12) / 100.0

    return {
        "avg_queue_wait_min": round(seed["avg_queue_wait"] * wait_adj, 1),
        "avg_queue_wait_delta": round(-18 - (h % 25) - (scale - 1.0) * 0.4, 1),
        "gate_utilization_pct": round(max(35, min(98, seed["gate_util"] * util_adj)), 1),
        "gate_utilization_delta": round(6 + (h % 12) + (scale - 1.0) * 0.15, 1),
        "reroutes_triggered_today": int(seed["reroutes"] * scale),
        "fuel_saved_litres_today": round(seed["fuel_l"] * scale, 1),
        "co2_saved_kg_today": round(seed["co2_kg"] * scale, 1),
        "slot_adherence_pct": round(max(60, min(99, seed["adherence"] + (h % 7) - 3)), 1),
        "active_trucks_in_port": int(142 * scale * (seed["gate_util"] / 78.5)),
        "turnaround_time_baseline_min": round(58 * wait_adj, 1),
        "turnaround_time_current_min": round(31 * wait_adj, 1),
        "cargo_mix": seed.get("cargo_mix"),
        "trend": seed.get("trend"),
    }


@router.get("/charts/congestion-heatmap")
def get_congestion_heatmap(
    period: Optional[str] = Query("24h"),
    port: Optional[str] = Query(None, description="Port id (e.g. voc, vizag)"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Hourly congestion scores per gate (0-100 scale). Period-aware."""
    from app.ports import PORTS
    port_id = _resolve_port(port, user)
    f = _port_factor(port_id)
    p = (period or '24h').lower()
    if p in ('7d', 'week'):
        hours = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    elif p in ('30d', 'monthly', 'month'):
        hours = [f"D{i+1}" for i in range(10)]
    else:
        hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
    gates = PORTS[port_id]["gates"] if port_id != DEFAULT_PORT_ID else ["Gate 1 (Bulk)", "Gate 2 (General)", "Gate 3 (Container)", "Gate 4 (Rail)"]

    # Generate realistic patterns
    base_scores = {
        "Gate 1 (Bulk)": [22, 45, 68, 85, 76, 52, 38, 20, 15],
        "Gate 2 (General)": [18, 38, 72, 79, 65, 48, 32, 19, 12],
        "Gate 3 (Container)": [30, 62, 94, 91, 88, 75, 54, 33, 20],
        "Gate 4 (Rail)": [15, 25, 42, 50, 48, 36, 28, 16, 10]
    }
    legacy_keys = list(base_scores.keys())

    data = []
    ph = int(hashlib.md5(f"heat-{port_id}-{period}".encode()).hexdigest(), 16)
    pf = 0.85 + (ph % 30) / 100.0
    for g_idx, gate in enumerate(gates):
        pattern = base_scores[legacy_keys[g_idx % len(legacy_keys)]]
        for h_idx, hour in enumerate(hours):
            base = pattern[h_idx % len(pattern)]
            score = max(5, min(99, int(base * f * pf)))
            data.append({
                "gate": gate,
                "gate_index": g_idx,
                "hour": hour,
                "hour_index": h_idx,
                "score": score
            })
    return {"gates": gates, "hours": hours, "data": data, "period": period}


@router.get("/charts/turnaround")
def get_turnaround_chart(
    period: Optional[str] = Query("7d"),
    port: Optional[str] = Query(None, description="Port id (e.g. voc, vizag)"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Actual vs AI-Predicted turnaround times. Period-aware labels."""
    port_id = _resolve_port(port, user)
    f = _port_factor(port_id)
    p = (period or '7d').lower()
    th = int(hashlib.md5(f"turn-{port_id}-{p}".encode()).hexdigest(), 16)
    tf = 0.88 + (th % 24) / 100.0
    if p in ('24h', 'live', 'day'):
        days = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
        base_a = [34.5, 36.2, 42.8, 48.5, 39.0, 30.2]
        base_p = [33.0, 35.0, 40.5, 45.0, 37.2, 29.0]
        base_b = [56.0, 60.2, 72.4, 78.1, 65.0, 52.3]
    elif p in ('30d', 'monthly', 'month'):
        days = [f"W{i+1}" for i in range(8)]
        base_a = [34.5, 32.0, 29.8, 31.2, 33.6, 28.4, 27.0, 26.2]
        base_p = [33.0, 31.5, 30.2, 30.8, 32.5, 28.0, 26.5, 25.8]
        base_b = [56.0, 58.2, 55.4, 59.1, 62.0, 52.3, 49.0, 48.2]
    else:
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        base_a = [34.5, 32.0, 29.8, 31.2, 33.6, 28.4, 27.0]
        base_p = [33.0, 31.5, 30.2, 30.8, 32.5, 28.0, 26.5]
        base_b = [56.0, 58.2, 55.4, 59.1, 62.0, 52.3, 49.0]
    actual = [round(v * f * tf, 1) for v in base_a]
    predicted = [round(v * f * tf, 1) for v in base_p]
    baseline_unoptimized = [round(v * f * tf, 1) for v in base_b]

    return {
        "categories": days,
        "actual": actual,
        "predicted": predicted,
        "baseline_unoptimized": baseline_unoptimized,
        "unit": "minutes",
        "period": period,
    }


@router.get("/charts/queue-depth")
def get_queue_depth_chart(
    gate: Optional[str] = Query(None),
    port: Optional[str] = Query(None, description="Port id (e.g. voc, vizag)"),
    period: Optional[str] = Query("24h"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Queue depth and throughput over time. Period-aware."""
    port_id = _resolve_port(port, user)
    f = _port_factor(port_id)
    p = (period or '24h').lower()
    qh = int(hashlib.md5(f"queue-{port_id}-{p}".encode()).hexdigest(), 16)
    qf = (0.8 + (qh % 40) / 100.0) * _period_scale('24h' if p == '24h' else '7d' if p == '7d' else '30d', port_id) / (1.0 if p == '24h' else 6.4 if p == '7d' else 24.0) * (1.0 if p == '24h' else 6.4 if p == '7d' else 24.0) ** 0.35
    if p in ('7d', 'week'):
        times = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        b1, b2, b3, b4 = [9, 14, 18, 16, 20, 12, 8], [7, 10, 12, 11, 13, 8, 5], [3, 5, 6, 5, 6, 4, 2], [10, 14, 18, 17, 19, 12, 8]
        bt = [68, 82, 95, 90, 98, 75, 60]
    elif p in ('30d', 'monthly', 'month'):
        times = [f"W{i+1}" for i in range(8)]
        b1, b2, b3, b4 = [12, 15, 18, 22, 19, 16, 14, 11], [9, 11, 14, 16, 13, 11, 9, 7], [4, 5, 7, 8, 6, 5, 4, 3], [13, 16, 20, 24, 21, 17, 14, 11]
        bt = [80, 88, 102, 110, 100, 90, 82, 70]
    else:
        times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
        b1, b2, b3, b4 = [5, 8, 12, 14, 11, 7, 6, 8, 5, 3], [4, 6, 9, 10, 8, 6, 5, 6, 4, 2], [2, 4, 3, 2, 4, 3, 2, 3, 2, 1], [6, 9, 15, 16, 12, 8, 7, 9, 6, 4]
        bt = [42, 65, 88, 92, 84, 76, 82, 85, 68, 45]
    scale = lambda xs: [max(0, int(v * f * qf)) for v in xs]
    return {
        "timestamps": times,
        "g1": scale(b1),
        "g2": scale(b2),
        "g3": scale(b3),
        "g4": scale(b4),
        "throughput_vehicles_per_hr": scale(bt),
        "period": period,
    }


@router.get("/charts/reroute-impact")
def get_reroute_impact_chart(
    port: Optional[str] = Query(None, description="Port id (e.g. voc, vizag)"),
    period: Optional[str] = Query("24h"),
    user: Dict[str, Any] = Depends(get_current_user),
):
    """Before/after reroute corridor performance metrics. Period-aware."""
    from app.ports import PORTS
    port_id = _resolve_port(port, user)
    f = _port_factor(port_id)
    rh = int(hashlib.md5(f"reroute-{port_id}-{period}".encode()).hexdigest(), 16)
    rf = 0.9 + (rh % 20) / 100.0
    if port_id == DEFAULT_PORT_ID:
        corridors = [
            "Madurai Hwy (NH 38)",
            "Harbour Expressway",
            "Tuticorin Bypass",
            "SIPCOT Link Rd",
            "Port Gate 3 Approach"
        ]
    else:
        corridor = PORTS[port_id]["corridor"]
        corridors = [
            corridor,
            f"{PORTS[port_id]['short']} Bypass",
            f"{PORTS[port_id]['city']} Link Rd",
            "Port Approach Rd",
            "Port Gate 3 Approach"
        ]
    scale = lambda xs: [round(v * f * rf, 1) for v in xs]
    return {
        "corridors": corridors,
        "without_ai_wait_min": scale([38.5, 29.0, 24.5, 31.0, 42.0]),
        "with_ai_wait_min": scale([18.2, 16.5, 14.0, 15.8, 19.5]),
        "fuel_saved_pct": [32.4, 28.5, 22.0, 27.8, 35.2],
        "co2_reduction_pct": [34.0, 29.2, 23.5, 29.0, 36.8],
        "period": period,
    }


@router.get("/telemetry-stats")
def get_telemetry_stats(port: Optional[str] = Query(None, description="Port id (e.g. voc, vizag)")):
    """Aggregate telemetry statistics for active fleet."""
    from app.db import SessionLocal
    from app.models.truck import TruckModel
    port_id = _require_port(port)
    db = SessionLocal()
    try:
        q = db.query(TruckModel)
        if port_id != DEFAULT_PORT_ID:
            # Per-port live counts; VOC keeps legacy network-wide numbers.
            total = q.filter(TruckModel.port_id == port_id).count()
            delayed = q.filter(TruckModel.port_id == port_id, TruckModel.status == "delayed").count()
            reefer = q.filter(TruckModel.port_id == port_id, TruckModel.reefer_temp.isnot(None)).count()
            return {
                "total_active_trucks": total,
                "gnss_locked_count": total,
                "avg_5g_latency_ms": 4.2,
                "fleet_avg_speed_kmh": 46.8,
                "total_distance_cleared_km": round(118.4 * total, 1),
                "total_active_missions": total,
                "delayed_trucks_count": delayed,
                "reefer_active_monitors": reefer,
                "gate_throughput_rate": 86.4
            }
    finally:
        db.close()
    return {
        "total_active_trucks": 24,
        "gnss_locked_count": 24,
        "avg_5g_latency_ms": 4.2,
        "fleet_avg_speed_kmh": 46.8,
        "total_distance_cleared_km": 2840.5,
        "total_active_missions": 22,
        "delayed_trucks_count": 3,
        "reefer_active_monitors": 6,
        "gate_throughput_rate": 86.4
    }


@router.post("/simulate")
@limiter.limit("20/minute")
def run_monte_carlo_simulation(req: SimulationRequest, request: Request):
    """
    Monte Carlo Queue Simulation:
    Evaluates truck queuing, gate utilization, and waiting times across simulated arrivals.
    """
    import random
    import math

    # Run 500 simulated scenarios
    runs = 500
    waits_no_ai = []
    waits_with_ai = []
    throughput_samples = []

    base_arrival = req.num_trucks / req.time_horizon_hours
    capacity = 16.0 * req.gate_capacity_multiplier

    for _ in range(runs):
        arrival_rate = random.gauss(base_arrival, base_arrival * 0.18)
        # Queue model: M/M/c approximation
        rho_no_ai = arrival_rate / capacity
        wait_no = max(4.0, (rho_no_ai / (1.0 - min(0.95, rho_no_ai))) * 12.0 + random.uniform(-2, 3))
        waits_no_ai.append(round(wait_no, 1))

        # With AI Slot Allocation & Dynamic Rerouting, peaks are smoothed by ~40%
        smoothed_rho = (arrival_rate * 0.72) / capacity
        wait_ai = max(2.5, (smoothed_rho / (1.0 - min(0.92, smoothed_rho))) * 7.5 + random.uniform(-1, 1.5))
        waits_with_ai.append(round(wait_ai, 1))
        throughput_samples.append(int(arrival_rate * req.time_horizon_hours * random.uniform(0.95, 1.0)))

    # Compute distribution buckets
    bucket_ranges = ["0-10m", "10-20m", "20-30m", "30-40m", "40-50m", ">50m"]
    dist_no_ai = [0] * len(bucket_ranges)
    dist_with_ai = [0] * len(bucket_ranges)

    for w in waits_no_ai:
        idx = min(5, int(w // 10))
        dist_no_ai[idx] += 1
    for w in waits_with_ai:
        idx = min(5, int(w // 10))
        dist_with_ai[idx] += 1

    mean_no = sum(waits_no_ai) / len(waits_no_ai)
    mean_ai = sum(waits_with_ai) / len(waits_with_ai)

    return {
        "status": "success",
        "simulation_parameters": {
            "num_trucks": req.num_trucks,
            "distribution": req.arrival_distribution,
            "capacity_multiplier": req.gate_capacity_multiplier,
            "dynamic_rerouting": req.dynamic_rerouting_enabled,
            "time_horizon_hours": req.time_horizon_hours,
            "iterations": runs
        },
        "results": {
            "mean_wait_without_ai_min": round(mean_no, 1),
            "mean_wait_with_ai_min": round(mean_ai, 1),
            "wait_time_reduction_pct": round(((mean_no - mean_ai) / mean_no) * 100, 1),
            "p95_wait_without_ai_min": round(sorted(waits_no_ai)[int(runs * 0.95)], 1),
            "p95_wait_with_ai_min": round(sorted(waits_with_ai)[int(runs * 0.95)], 1),
            "expected_throughput_trucks": int(sum(throughput_samples) / len(throughput_samples)),
            "bucket_ranges": bucket_ranges,
            "distribution_without_ai": dist_no_ai,
            "distribution_with_ai": dist_with_ai
        }
    }


@router.get("/fuel-savings")
def calculate_fuel_savings(distance_km: float = 24.5, idle_time_saved_min: float = 27.0):
    """Calculates fuel and carbon savings resulting from slot queuing elimination."""
    return fuel_model.calculate_trip_fuel(
        distance_km=distance_km,
        avg_speed_kmh=45.0,
        idle_time_minutes=idle_time_saved_min
    )

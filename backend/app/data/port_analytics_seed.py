"""Distinct, deterministic per-port analytics seed (consistent across reloads).
VOC keeps legacy numbers; JNPA = high throughput/long queues; Kandla = bulk skew; Mormugao = low.
"""
PORT_ANALYTICS = {
    "voc": {"avg_queue_wait": 14.2, "gate_util": 78.5, "reroutes": 23, "fuel_l": 142.5, "co2_kg": 381.9, "adherence": 91.4, "trend": "stable", "cargo_mix": "container-heavy"},
    "jnpt": {"avg_queue_wait": 28.6, "gate_util": 92.0, "reroutes": 41, "fuel_l": 210.0, "co2_kg": 560.0, "adherence": 82.0, "trend": "rising", "cargo_mix": "container-heavy"},
    "deendayal": {"avg_queue_wait": 11.0, "gate_util": 71.0, "reroutes": 12, "fuel_l": 180.0, "co2_kg": 470.0, "adherence": 93.5, "trend": "stable", "cargo_mix": "bulk-heavy"},
    "mumbai": {"avg_queue_wait": 24.0, "gate_util": 88.0, "reroutes": 35, "fuel_l": 195.0, "co2_kg": 520.0, "adherence": 84.0, "trend": "rising", "cargo_mix": "mixed"},
    "mormugao": {"avg_queue_wait": 7.5, "gate_util": 58.0, "reroutes": 6, "fuel_l": 80.0, "co2_kg": 210.0, "adherence": 95.0, "trend": "falling", "cargo_mix": "bulk-iron-ore"},
    "mangalore": {"avg_queue_wait": 12.8, "gate_util": 74.0, "reroutes": 15, "fuel_l": 130.0, "co2_kg": 340.0, "adherence": 90.0, "trend": "stable", "cargo_mix": "pol-bulk"},
    "cochin": {"avg_queue_wait": 13.5, "gate_util": 76.0, "reroutes": 17, "fuel_l": 135.0, "co2_kg": 355.0, "adherence": 89.5, "trend": "stable", "cargo_mix": "container-ictt"},
    "haldia": {"avg_queue_wait": 9.2, "gate_util": 64.0, "reroutes": 9, "fuel_l": 100.0, "co2_kg": 265.0, "adherence": 92.5, "trend": "falling", "cargo_mix": "bulk"},
    "paradip": {"avg_queue_wait": 15.0, "gate_util": 79.0, "reroutes": 20, "fuel_l": 150.0, "co2_kg": 400.0, "adherence": 88.0, "trend": "rising", "cargo_mix": "iron-ore"},
    "vizag": {"avg_queue_wait": 19.0, "gate_util": 84.0, "reroutes": 28, "fuel_l": 170.0, "co2_kg": 450.0, "adherence": 86.0, "trend": "rising", "cargo_mix": "ore-container"},
    "chennai": {"avg_queue_wait": 22.5, "gate_util": 87.0, "reroutes": 33, "fuel_l": 190.0, "co2_kg": 505.0, "adherence": 83.5, "trend": "rising", "cargo_mix": "mixed-heavy"},
    "ennore": {"avg_queue_wait": 8.8, "gate_util": 62.0, "reroutes": 8, "fuel_l": 95.0, "co2_kg": 250.0, "adherence": 94.0, "trend": "falling", "cargo_mix": "coal-lng"},
}


def get_port_analytics(port_id: str) -> dict:
    return PORT_ANALYTICS.get(port_id, PORT_ANALYTICS["voc"])

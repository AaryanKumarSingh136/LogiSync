// ─── Port Service Data — Slot Booking Tab ────────────────────────────────────
// All dummy/static data that drives the new sections B, C, D.
// Each port has distinct gate numbers, wait times, congestion arrays, and bookings.

export type ServiceType = 'bulk' | 'general' | 'container_reefer' | 'express_rail';
export type GateStatusType = 'optimal' | 'normal' | 'moderate' | 'congested';
export type BookingStatus = 'upcoming' | 'in_progress' | 'completed';
export type VehicleType = 'trailer' | 'container_truck' | 'reefer_truck' | 'flatbed' | 'tanker';
export type PriorityTier = 'standard' | 'express' | 'urgent';

export interface GateServiceInfo {
  gateNumber: number;       // e.g. 1, 3, 5
  gateName: string;         // e.g. "Gate 1 · Bulk Terminal"
  waitMin: number;
  queue: number;
  status: GateStatusType;
}

export interface ServiceCardData {
  service: ServiceType;
  label: string;            // Display label
  icon: string;             // emoji icon
  gates: GateServiceInfo[];
}

export interface PortCongestionData {
  // hourly wait-time arrays (index 0=06:00, 1=08:00 … 8=22:00) per gate label
  gateLabels: string[];     // e.g. ['Gate 1 (Bulk)', 'Gate 3 (Container)']
  series: number[][];       // parallel arrays, one per gateLabel
  // peak gate summary for today
  peakGateName: string;
  peakWaitMin: number;
  peakTimeWindow: string;   // e.g. "13:00 – 15:00"
  peakService: string;
}

export interface DateDensity {
  // 7 values 0–1 for today…+6 days congestion density (for DateScrubber bar)
  values: number[];
}

export interface BookingRecord {
  id: string;
  tokenNumber: string;
  portId: string;
  service: ServiceType;
  serviceLabel: string;
  gate: string;
  date: string;             // 'YYYY-MM-DD'
  timeWindow: string;       // e.g. '14:15 – 14:45'
  vehicleNumber: string;
  vehicleType: VehicleType;
  driverName: string;
  driverPhone?: string;
  driverLicenseOk: boolean;
  destination: string;
  status: BookingStatus;
  tier: PriorityTier;
  tierFee: number;
  cargoType: string;
}

// ─── Service Maps (per port) ──────────────────────────────────────────────────
export const PORT_SERVICE_MAP: Record<string, ServiceCardData[]> = {
  voc: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Bulk Terminal',       waitMin: 45, queue: 14, status: 'congested' }, { gateNumber: 3, gateName: 'Gate 3 · Dry Bulk Annex',    waitMin: 28, queue: 8,  status: 'moderate'  }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · General Berth',       waitMin: 18, queue: 6,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 5,  gateName: 'Gate 5 · Container Terminal',  waitMin: 11, queue: 2,  status: 'optimal'   }, { gateNumber: 7, gateName: 'Gate 7 · Reefer Berth',      waitMin: 20, queue: 5,  status: 'moderate'  }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 9,  gateName: 'Gate 9 · Rail Ramp',           waitMin: 22, queue: 9,  status: 'moderate'  }] },
  ],
  deendayal: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · Dry Bulk Quay',       waitMin: 19, queue: 5,  status: 'normal'    }, { gateNumber: 6, gateName: 'Gate 6 · Coal Handling',   waitMin: 32, queue: 10, status: 'moderate'  }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 3,  gateName: 'Gate 3 · General Berth',       waitMin: 14, queue: 4,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 5,  gateName: 'Gate 5 · Container Yard',      waitMin: 9,  queue: 2,  status: 'optimal'   }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 8,  gateName: 'Gate 8 · ICD Rail Ramp',       waitMin: 16, queue: 3,  status: 'normal'    }, { gateNumber: 10, gateName: 'Gate 10 · Liquid Express', waitMin: 25, queue: 7,  status: 'moderate'  }] },
  ],
  mumbai: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 3,  gateName: 'Gate 3 · Indira Dock Bulk',    waitMin: 55, queue: 18, status: 'congested' }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Green Gate',          waitMin: 22, queue: 7,  status: 'moderate'  }, { gateNumber: 4, gateName: 'Gate 4 · Victoria Dock',  waitMin: 17, queue: 5,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 6,  gateName: 'Gate 6 · BTPCT Container',     waitMin: 38, queue: 12, status: 'congested' }, { gateNumber: 8, gateName: 'Gate 8 · Reefer Terminal',  waitMin: 29, queue: 9,  status: 'moderate'  }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 11, gateName: 'Gate 11 · Wadi Bunder Ramp',   waitMin: 20, queue: 6,  status: 'moderate'  }] },
  ],
  jnpt: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 4,  gateName: 'Gate 4 · Nhava Bulk Quay',     waitMin: 35, queue: 11, status: 'moderate'  }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · General Cargo Berth', waitMin: 20, queue: 6,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Main Entry Container',waitMin: 48, queue: 16, status: 'congested' }, { gateNumber: 5, gateName: 'Gate 5 · GTI Terminal',   waitMin: 41, queue: 13, status: 'congested' }, { gateNumber: 7, gateName: 'Gate 7 · Reefer Yard', waitMin: 25, queue: 8, status: 'moderate' }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 9,  gateName: 'Gate 9 · Rail Freight',        waitMin: 15, queue: 4,  status: 'normal'    }] },
  ],
  mormugao: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Iron Ore Berth A',    waitMin: 12, queue: 3,  status: 'optimal'   }, { gateNumber: 2, gateName: 'Gate 2 · Iron Ore Berth B', waitMin: 16, queue: 4, status: 'normal' }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 4,  gateName: 'Gate 4 · MPT General',         waitMin: 10, queue: 2,  status: 'optimal'   }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 6,  gateName: 'Gate 6 · Container Facility',  waitMin: 14, queue: 3,  status: 'normal'    }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 8,  gateName: 'Gate 8 · Coastal Express',     waitMin: 8,  queue: 1,  status: 'optimal'   }] },
  ],
  mangalore: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · POL Jetty',           waitMin: 26, queue: 8,  status: 'moderate'  }, { gateNumber: 3, gateName: 'Gate 3 · Fertilizer Berth', waitMin: 33, queue: 10, status: 'moderate' }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · NMP General',         waitMin: 15, queue: 4,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 5,  gateName: 'Gate 5 · Container CFS',       waitMin: 19, queue: 5,  status: 'normal'    }, { gateNumber: 7, gateName: 'Gate 7 · Reefer Bay',       waitMin: 22, queue: 6,  status: 'moderate'  }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 9,  gateName: 'Gate 9 · Rail Siding',         waitMin: 13, queue: 2,  status: 'optimal'   }] },
  ],
  cochin: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · Mattancherry Bulk',   waitMin: 30, queue: 9,  status: 'moderate'  }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Main Entry',          waitMin: 18, queue: 5,  status: 'normal'    }, { gateNumber: 3, gateName: 'Gate 3 · Ernakulam Wharf',   waitMin: 21, queue: 7,  status: 'moderate'  }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 5,  gateName: 'Gate 5 · ICTT Vallarpadam',    waitMin: 15, queue: 3,  status: 'normal'    }, { gateNumber: 6, gateName: 'Gate 6 · Reefer Slot',       waitMin: 12, queue: 2,  status: 'optimal'   }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 8,  gateName: 'Gate 8 · Coastal Express',     waitMin: 11, queue: 2,  status: 'optimal'   }] },
  ],
  haldia: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · HDC Bulk Jetty',      waitMin: 22, queue: 7,  status: 'moderate'  }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · General Multipurpose', waitMin: 14, queue: 4,  status: 'normal'   }, { gateNumber: 4, gateName: 'Gate 4 · SMP Berth',          waitMin: 18, queue: 5,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 6,  gateName: 'Gate 6 · Container Terminal',  waitMin: 10, queue: 2,  status: 'optimal'   }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 7,  gateName: 'Gate 7 · Rail Freight CFS',    waitMin: 13, queue: 3,  status: 'normal'    }, { gateNumber: 9,  gateName: 'Gate 9 · Express Rail',     waitMin: 9,  queue: 1,  status: 'optimal'   }] },
  ],
  paradip: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · Iron Ore Berth',      waitMin: 40, queue: 12, status: 'congested' }, { gateNumber: 4, gateName: 'Gate 4 · Coal Terminal',     waitMin: 31, queue: 10, status: 'moderate'  }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 5,  gateName: 'Gate 5 · POT General',         waitMin: 17, queue: 5,  status: 'normal'    }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 6,  gateName: 'Gate 6 · Container CY',        waitMin: 24, queue: 7,  status: 'moderate'  }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 8,  gateName: 'Gate 8 · POL Express',         waitMin: 11, queue: 3,  status: 'optimal'   }, { gateNumber: 10, gateName: 'Gate 10 · Rail Freight',   waitMin: 14, queue: 4,  status: 'normal'    }] },
  ],
  vizag: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Ore Handling Berth',  waitMin: 50, queue: 17, status: 'congested' }, { gateNumber: 3, gateName: 'Gate 3 · Coal Terminal',     waitMin: 42, queue: 13, status: 'congested' }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · VPT General',         waitMin: 24, queue: 7,  status: 'moderate'  }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 5,  gateName: 'Gate 5 · Container Terminal',  waitMin: 36, queue: 11, status: 'moderate'  }, { gateNumber: 7, gateName: 'Gate 7 · Reefer Facility',  waitMin: 28, queue: 8,  status: 'moderate'  }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 10, gateName: 'Gate 10 · Rail Ramp',          waitMin: 18, queue: 5,  status: 'normal'    }] },
  ],
  chennai: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · CHPT Bulk Terminal',  waitMin: 47, queue: 15, status: 'congested' }, { gateNumber: 4, gateName: 'Gate 4 · Coal Berth',        waitMin: 39, queue: 12, status: 'congested' }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 4,  gateName: 'Gate 4 · General Purpose',     waitMin: 22, queue: 6,  status: 'moderate'  }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 6,  gateName: 'Gate 6 · Container Terminal',  waitMin: 44, queue: 14, status: 'congested' }, { gateNumber: 7, gateName: 'Gate 7 · Reefer Slot',       waitMin: 30, queue: 9,  status: 'moderate'  }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 7,  gateName: 'Gate 7 · Coastal Express',     waitMin: 19, queue: 5,  status: 'normal'    }, { gateNumber: 10, gateName: 'Gate 10 · Rail ICD',       waitMin: 14, queue: 3,  status: 'normal'    }] },
  ],
  ennore: [
    { service: 'bulk',            label: 'Bulk',             icon: '⛽', gates: [{ gateNumber: 1,  gateName: 'Gate 1 · Coal Handling Berth', waitMin: 16, queue: 4,  status: 'normal'    }] },
    { service: 'general',         label: 'General Cargo',    icon: '📦', gates: [{ gateNumber: 2,  gateName: 'Gate 2 · KPT General',         waitMin: 12, queue: 3,  status: 'optimal'   }] },
    { service: 'container_reefer',label: 'Container/Reefer', icon: '🚢', gates: [{ gateNumber: 3,  gateName: 'Gate 3 · Container / LNG Bay', waitMin: 10, queue: 2,  status: 'optimal'   }] },
    { service: 'express_rail',    label: 'Express Rail',     icon: '🚂', gates: [{ gateNumber: 4,  gateName: 'Gate 4 · Rail Express Siding',waitMin: 8,  queue: 1,  status: 'optimal'   }, { gateNumber: 5,  gateName: 'Gate 5 · Ennore Link Rail', waitMin: 11, queue: 2,  status: 'optimal'   }] },
  ],
};

// ─── Congestion Chart Data (per port) ─────────────────────────────────────────
// Hours: 06,08,10,12,14,16,18,20,22 — wait time in minutes
export const PORT_CONGESTION: Record<string, PortCongestionData> = {
  voc:       { gateLabels: ['Gate 1 (Bulk)', 'Gate 5 (Container)'], series: [[12,18,26,38,48,35,22,14,8], [6,8,10,14,11,9,7,5,4]],   peakGateName: 'Gate 1 · Bulk Terminal',      peakWaitMin: 48, peakTimeWindow: '13:00 – 15:00', peakService: 'Bulk'             },
  deendayal: { gateLabels: ['Gate 2 (Bulk)', 'Gate 5 (Container)'], series: [[8,12,16,22,28,24,18,10,6], [5,7,9,10,9,7,5,4,3]],      peakGateName: 'Gate 6 · Coal Handling',      peakWaitMin: 32, peakTimeWindow: '12:00 – 14:00', peakService: 'Bulk'             },
  mumbai:    { gateLabels: ['Gate 3 (Bulk)', 'Gate 6 (Container)'],  series: [[20,30,42,55,58,50,38,24,14],[18,26,34,44,48,40,30,18,10]], peakGateName: 'Gate 6 · BTPCT Container',   peakWaitMin: 48, peakTimeWindow: '14:00 – 16:00', peakService: 'Container/Reefer' },
  jnpt:      { gateLabels: ['Gate 1 (Container)', 'Gate 4 (Bulk)'],  series: [[22,32,45,52,50,44,36,22,12],[14,18,24,35,38,32,24,16,8]], peakGateName: 'Gate 1 · Main Entry Container', peakWaitMin: 52, peakTimeWindow: '12:00 – 14:00', peakService: 'Container/Reefer' },
  mormugao:  { gateLabels: ['Gate 1 (Bulk)', 'Gate 6 (Container)'],  series: [[6,8,10,13,14,12,9,6,3],   [4,6,8,10,12,10,7,5,3]],    peakGateName: 'Gate 1 · Iron Ore Berth A',  peakWaitMin: 16, peakTimeWindow: '13:00 – 15:00', peakService: 'Bulk'             },
  mangalore:  { gateLabels: ['Gate 1 (Bulk)', 'Gate 5 (Container)'], series: [[10,16,22,30,34,28,20,12,6],[7,10,13,18,22,19,14,9,5]],  peakGateName: 'Gate 3 · Fertilizer Berth',  peakWaitMin: 33, peakTimeWindow: '14:00 – 15:00', peakService: 'Bulk'             },
  cochin:    { gateLabels: ['Gate 2 (Bulk)', 'Gate 5 (Container)'],  series: [[8,12,18,24,28,26,20,14,8],[5,8,11,14,16,14,11,7,4]],  peakGateName: 'Gate 2 · Mattancherry Bulk',  peakWaitMin: 30, peakTimeWindow: '14:00 – 15:00', peakService: 'Bulk'             },
  haldia:    { gateLabels: ['Gate 1 (Bulk)', 'Gate 6 (Container)'],  series: [[8,12,17,22,24,20,15,10,5],[4,6,8,10,12,10,8,5,3]],    peakGateName: 'Gate 1 · HDC Bulk Jetty',    peakWaitMin: 24, peakTimeWindow: '13:00 – 15:00', peakService: 'Bulk'             },
  paradip:   { gateLabels: ['Gate 2 (Bulk)', 'Gate 6 (Container)'],  series: [[16,22,30,38,42,36,28,18,10],[8,10,14,20,26,22,16,10,6]],peakGateName: 'Gate 2 · Iron Ore Berth',   peakWaitMin: 42, peakTimeWindow: '14:00 – 16:00', peakService: 'Bulk'             },
  vizag:     { gateLabels: ['Gate 1 (Bulk)', 'Gate 5 (Container)'],  series: [[18,26,35,46,52,46,36,24,14],[12,18,24,32,38,34,26,18,10]], peakGateName: 'Gate 1 · Ore Handling Berth', peakWaitMin: 52, peakTimeWindow: '14:00 – 15:00', peakService: 'Bulk'             },
  chennai:   { gateLabels: ['Gate 2 (Bulk)', 'Gate 6 (Container)'],  series: [[15,22,32,44,50,46,36,24,14],[14,20,30,42,48,44,34,22,12]], peakGateName: 'Gate 6 · Container Terminal', peakWaitMin: 48, peakTimeWindow: '14:00 – 16:00', peakService: 'Container/Reefer' },
  ennore:    { gateLabels: ['Gate 1 (Coal)', 'Gate 3 (Container)'],  series: [[5,7,10,13,16,14,11,7,4],  [4,5,7,9,11,10,7,5,3]],     peakGateName: 'Gate 1 · Coal Handling Berth',peakWaitMin: 16, peakTimeWindow: '14:00 – 15:00', peakService: 'Bulk'             },
};

// ─── Date Density (0–1 per day, today → today+6) per port ────────────────────
export const PORT_DATE_DENSITY: Record<string, number[]> = {
  voc:       [0.72, 0.55, 0.80, 0.40, 0.65, 0.90, 0.30],
  deendayal: [0.35, 0.42, 0.60, 0.25, 0.50, 0.45, 0.70],
  mumbai:    [0.85, 0.78, 0.92, 0.65, 0.80, 0.75, 0.88],
  jnpt:      [0.90, 0.82, 0.95, 0.70, 0.85, 0.80, 0.92],
  mormugao:  [0.30, 0.25, 0.40, 0.20, 0.35, 0.28, 0.45],
  mangalore: [0.55, 0.60, 0.70, 0.45, 0.62, 0.58, 0.75],
  cochin:    [0.60, 0.52, 0.68, 0.40, 0.65, 0.55, 0.72],
  haldia:    [0.40, 0.38, 0.52, 0.30, 0.45, 0.42, 0.58],
  paradip:   [0.65, 0.58, 0.75, 0.50, 0.70, 0.62, 0.80],
  vizag:     [0.80, 0.72, 0.88, 0.60, 0.78, 0.70, 0.85],
  chennai:   [0.88, 0.80, 0.92, 0.68, 0.82, 0.76, 0.90],
  ennore:    [0.25, 0.20, 0.35, 0.18, 0.30, 0.22, 0.40],
};

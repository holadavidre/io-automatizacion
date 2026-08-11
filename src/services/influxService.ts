import type { SensorReading, TimeRange } from '../types/telemetry';

const INFLUX_URL = '/influx';
const INFLUX_ORG_ID = '1845379ee6c6b0e8';
const INFLUX_BUCKET = 'salmonera';
const INFLUX_TOKEN = 'mKKpR5nECDkVMCs73DeMy0NnUP2NFtGlc-P5r-RYpz0fU348dCmTf8tKBiy2TG8gNZ-w9PdE5i-zUJr4c32xfg==';

export interface InfluxConnectionStatus {
  online: boolean;
  lastChecked: string;
  bucket: string;
  measurementCount: number;
  error?: string;
}

/**
 * Map time range to Flux range strings
 */
function getFluxRange(range: TimeRange): string {
  switch (range) {
    case 'live':
      return '-2h';
    case '24h':
      return '-24h';
    case '7d':
      return '-7d';
    case '30d':
      return '-30d';
    case '1y':
      return '-1y';
    default:
      return '-24h';
  }
}

/**
 * Robust CSV parser for InfluxDB Flux CSV output with dynamic header matching
 */
function parseFluxCsv(csvText: string): Map<string, Record<string, number>> {
  const lines = csvText.trim().split('\n');
  const timestampMap = new Map<string, Record<string, number>>();

  let timeIdx = 5;
  let valIdx = 6;
  let fieldIdx = 7;

  for (const line of lines) {
    if (line.startsWith('#')) continue;

    const parts = line.split(',');
    if (parts.includes('_time') && parts.includes('_value') && parts.includes('_field')) {
      timeIdx = parts.indexOf('_time');
      valIdx = parts.indexOf('_value');
      fieldIdx = parts.indexOf('_field');
      continue;
    }

    if (line.startsWith(',result') || !line.trim()) continue;
    if (parts.length <= Math.max(timeIdx, valIdx, fieldIdx)) continue;

    const timeStr = parts[timeIdx];
    const val = parseFloat(parts[valIdx]);
    const field = parts[fieldIdx];

    if (!timeStr || isNaN(val) || !field) continue;

    if (!timestampMap.has(timeStr)) {
      timestampMap.set(timeStr, {});
    }
    timestampMap.get(timeStr)![field] = val;
  }

  return timestampMap;
}

/**
 * Fetch real historical telemetry readings from InfluxDB
 */
export async function fetchRealInfluxData(range: TimeRange = '24h'): Promise<SensorReading[]> {
  const fluxRange = getFluxRange(range);
  const fluxQuery = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${fluxRange})
      |> filter(fn: (r) => r["_measurement"] == "telemetria")
      |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  try {
    const res = await fetch(`${INFLUX_URL}/api/v2/query?orgID=${INFLUX_ORG_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${INFLUX_TOKEN}`,
        'Content-Type': 'application/vnd.flux',
        'Accept': 'application/csv',
      },
      body: fluxQuery,
    });

    if (!res.ok) {
      throw new Error(`InfluxDB returned HTTP ${res.status}`);
    }

    const csvText = await res.text();
    const timestampMap = parseFluxCsv(csvText);

    // Convert map to SensorReading array sorted by timestamp
    const readings: SensorReading[] = [];
    const sortedTimes = Array.from(timestampMap.keys()).sort();

    for (const timeStr of sortedTimes) {
      const fields = timestampMap.get(timeStr)!;
      const epoch = new Date(timeStr).getTime();

      const nivel1 = fields['nivel_estanque_1'] ?? fields['nivel1_m'] ?? 15.0;
      const nivel2 = fields['nivel_estanque_2'] ?? fields['nivel2_m'] ?? 80.0;
      const flujo = fields['flujo_generador'] ?? fields['caudal1_m3h'] ?? 35.0;
      const potencia = fields['potencia_generador_kw'] ?? fields['caudal2_m3h'] ?? 70.0;

      readings.push({
        timestamp: new Date(epoch).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        epoch,
        caudal1_m3h: Math.round(flujo * 10) / 10,
        caudal1_ls: Math.round((flujo / 3.6) * 10) / 10,
        caudal1_total_m3: Math.round(flujo * 24),
        caudal2_m3h: Math.round(potencia * 10) / 10,
        caudal2_ls: Math.round((potencia / 3.6) * 10) / 10,
        caudal2_total_m3: Math.round(potencia * 12),
        nivel1_m: Math.round(nivel1 * 10) / 10,
        nivel1_pct: Math.min(100, Math.round((nivel1 / 20.0) * 100)),
        nivel2_m: Math.round(nivel2 * 10) / 10,
        nivel2_pct: Math.min(100, Math.round((nivel2 / 100.0) * 100)),
        battery_pct: 98,
        signal_rssi: -64,
        ec2_status: 'online',
        influx_status: 'synced',
      });
    }

    return readings;
  } catch (err) {
    console.error('Error fetching from InfluxDB:', err);
    throw err;
  }
}

/**
 * Fetch absolute latest raw reading from InfluxDB without aggregateWindow
 */
export async function fetchRealLatestReading(): Promise<SensorReading | null> {
  const fluxQuery = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -24h)
      |> filter(fn: (r) => r["_measurement"] == "telemetria")
      |> last()
  `;

  try {
    const res = await fetch(`${INFLUX_URL}/api/v2/query?orgID=${INFLUX_ORG_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${INFLUX_TOKEN}`,
        'Content-Type': 'application/vnd.flux',
        'Accept': 'application/csv',
      },
      body: fluxQuery,
    });

    if (!res.ok) return null;

    const csvText = await res.text();
    const timestampMap = parseFluxCsv(csvText);
    if (timestampMap.size === 0) return null;

    // Merge all latest field keys across recent timestamps
    const mergedFields: Record<string, number> = {};
    let latestEpoch = 0;

    for (const [timeStr, fields] of timestampMap.entries()) {
      const ep = new Date(timeStr).getTime();
      if (ep > latestEpoch) latestEpoch = ep;
      Object.assign(mergedFields, fields);
    }

    const nivel1 = mergedFields['nivel_estanque_1'] ?? 15.0;
    const nivel2 = mergedFields['nivel_estanque_2'] ?? 80.0;
    const flujo = mergedFields['flujo_generador'] ?? 35.0;
    const potencia = mergedFields['potencia_generador_kw'] ?? 70.0;

    return {
      timestamp: new Date(latestEpoch || Date.now()).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      epoch: latestEpoch || Date.now(),
      caudal1_m3h: Math.round(flujo * 10) / 10,
      caudal1_ls: Math.round((flujo / 3.6) * 10) / 10,
      caudal1_total_m3: Math.round(flujo * 24),
      caudal2_m3h: Math.round(potencia * 10) / 10,
      caudal2_ls: Math.round((potencia / 3.6) * 10) / 10,
      caudal2_total_m3: Math.round(potencia * 12),
      nivel1_m: Math.round(nivel1 * 10) / 10,
      nivel1_pct: Math.min(100, Math.round((nivel1 / 20.0) * 100)),
      nivel2_m: Math.round(nivel2 * 10) / 10,
      nivel2_pct: Math.min(100, Math.round((nivel2 / 100.0) * 100)),
      battery_pct: 98,
      signal_rssi: -64,
      ec2_status: 'online',
      influx_status: 'synced',
    };
  } catch (err) {
    console.error('Error fetching latest from InfluxDB:', err);
    return null;
  }
}

/**
 * Check Connection Health & Metadata
 */
export async function checkInfluxHealth(): Promise<InfluxConnectionStatus> {
  try {
    const res = await fetch(`${INFLUX_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return {
      online: data.status === 'pass',
      lastChecked: new Date().toLocaleTimeString('es-CL'),
      bucket: INFLUX_BUCKET,
      measurementCount: 4,
    };
  } catch (err: any) {
    return {
      online: false,
      lastChecked: new Date().toLocaleTimeString('es-CL'),
      bucket: INFLUX_BUCKET,
      measurementCount: 0,
      error: err.message,
    };
  }
}

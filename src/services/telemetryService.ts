import type { SensorReading, ClientCompany, TelemetryAlert, TimeRange } from '../types/telemetry';

// Lista de empresas cliente preconfiguradas para demostración comercial
export const MOCK_COMPANIES: ClientCompany[] = [
  {
    id: 'salmonera-austral',
    name: 'Salmonera Austral S.A.',
    rut: '76.432.890-K',
    location: 'Puerto Montt, Región de Los Lagos',
    region: 'Región de X - Los Lagos',
    type: 'salmonera',
    centers: [
      {
        id: 'chiloe-centro-4',
        name: 'Centro Chiloé #4 - Reloncaví',
        location: 'Seno de Reloncaví, Chiloé',
        caudalimetros: {
          c1Name: 'Caudalímetro F1 - Entrada Principal Agua Dulce',
          c1MaxFlow: 450,
          c2Name: 'Caudalímetro F2 - Alimentación Piscifactoría',
          c2MaxFlow: 300,
        },
        sensoresNivel: {
          n1Name: 'Sensor Nivel N1 - Estanque Principal Acopio',
          n1MaxHeight: 12.0,
          n2Name: 'Sensor Nivel N2 - Estanque Recirculación RAE',
          n2MaxHeight: 8.5,
        },
      },
      {
        id: 'aysen-centro-2',
        name: 'Centro Aysén #2 - Fjord Tech',
        location: 'Puerto Aysén, Región de Aysén',
        caudalimetros: {
          c1Name: 'Caudalímetro F1 - Red Agua Filtros',
          c1MaxFlow: 500,
          c2Name: 'Caudalímetro F2 - Retorno Tratamiento',
          c2MaxFlow: 350,
        },
        sensoresNivel: {
          n1Name: 'Sensor Nivel N1 - Matriz Filtro UV',
          n1MaxHeight: 10.0,
          n2Name: 'Sensor Nivel N2 - Colector Efluentes',
          n2MaxHeight: 7.0,
        },
      },
    ],
  },
  {
    id: 'aquachile-demo',
    name: 'AquaChile S.A.',
    rut: '96.882.110-3',
    location: 'Calbuco, Región de Los Lagos',
    region: 'Región de X - Los Lagos',
    type: 'salmonera',
    centers: [
      {
        id: 'calbuco-piscicultura',
        name: 'Piscicultura Calbuco Pro',
        location: 'Calbuco Sector Industrial',
        caudalimetros: {
          c1Name: 'Caudalímetro F1 - Bombeo Capta Mar',
          c1MaxFlow: 600,
          c2Name: 'Caudalímetro F2 - Inyección Oxígeno/Agua',
          c2MaxFlow: 400,
        },
        sensoresNivel: {
          n1Name: 'Sensor Nivel N1 - Estanque Oxigenación',
          n1MaxHeight: 15.0,
          n2Name: 'Sensor Nivel N2 - Pozo Pulmón',
          n2MaxHeight: 9.0,
        },
      },
    ],
  },
  {
    id: 'blumar-seafoods',
    name: 'Blumar Seafoods',
    rut: '88.190.550-1',
    location: 'Talcahuano / Castro',
    region: 'Región de Bío Bío / Los Lagos',
    type: 'procesadora',
    centers: [
      {
        id: 'castro-planta',
        name: 'Planta de Procesamiento Castro',
        location: 'Castro, Chiloé',
        caudalimetros: {
          c1Name: 'Caudalímetro F1 - Suministro RILes',
          c1MaxFlow: 380,
          c2Name: 'Caudalímetro F2 - Lavado Industrial',
          c2MaxFlow: 220,
        },
        sensoresNivel: {
          n1Name: 'Sensor Nivel N1 - Neutralizador pH',
          n1MaxHeight: 8.0,
          n2Name: 'Sensor Nivel N2 - Estanque Decantación',
          n2MaxHeight: 6.0,
        },
      },
    ],
  },
];

// Generador de lecturas realistas de sensores
export function generateCurrentReading(baseEpoch?: number): SensorReading {
  const now = baseEpoch ? new Date(baseEpoch) : new Date();
  const hours = now.getHours();

  // Variación natural según la hora del día (más caudal en horario productivo 08:00 - 19:00)
  const timeFactor = Math.sin(((hours - 6) / 24) * Math.PI * 2);
  const baseF1 = 280 + timeFactor * 65 + (Math.random() * 20 - 10);
  const baseF2 = 180 + timeFactor * 40 + (Math.random() * 15 - 7.5);

  const f1_m3h = Math.max(80, Math.round(baseF1 * 10) / 10);
  const f2_m3h = Math.max(50, Math.round(baseF2 * 10) / 10);

  // Nivel de estanques con oscilación gradual
  const sinNivel = Math.sin((hours / 12) * Math.PI) * 1.5;
  const n1_m = Math.min(10, Math.max(2.5, Math.round((7.8 + sinNivel + (Math.random() * 0.4 - 0.2)) * 100) / 100));
  const n2_m = Math.min(8.5, Math.max(1.8, Math.round((5.6 + sinNivel * 0.7 + (Math.random() * 0.3 - 0.15)) * 100) / 100));

  return {
    timestamp: now.toISOString(),
    epoch: now.getTime(),
    caudal1_m3h: f1_m3h,
    caudal1_ls: Math.round((f1_m3h / 3.6) * 10) / 10,
    caudal1_total_m3: 142580 + Math.round((now.getTime() / 100000) % 5000),
    caudal2_m3h: f2_m3h,
    caudal2_ls: Math.round((f2_m3h / 3.6) * 10) / 10,
    caudal2_total_m3: 89410 + Math.round((now.getTime() / 120000) % 3000),

    nivel1_m: n1_m,
    nivel1_pct: Math.round((n1_m / 10.0) * 100),
    nivel2_m: n2_m,
    nivel2_pct: Math.round((n2_m / 8.5) * 100),

    battery_pct: 98,
    signal_rssi: -64,
    ec2_status: 'online',
    influx_status: 'synced',
  };
}

// Generador de series temporales históricas (hasta 1 año simulado)
export function getHistoricalData(range: TimeRange): SensorReading[] {
  const points: SensorReading[] = [];
  const now = Date.now();
  let count = 30;
  let stepMs = 30 * 1000; // 30s por punto para 'live'

  if (range === '24h') {
    count = 48; // Cada 30 mins
    stepMs = 30 * 60 * 1000;
  } else if (range === '7d') {
    count = 56; // Cada 3 horas
    stepMs = 3 * 3600 * 1000;
  } else if (range === '30d') {
    count = 60; // Cada 12 horas
    stepMs = 12 * 3600 * 1000;
  } else if (range === '1y') {
    count = 52; // 52 semanas
    stepMs = 7 * 24 * 3600 * 1000;
  }

  const startTime = now - count * stepMs;

  for (let i = 0; i <= count; i++) {
    const epoch = startTime + i * stepMs;
    points.push(generateCurrentReading(epoch));
  }

  return points;
}

// Alertas de prueba en tiempo real
export const MOCK_ALERTS: TelemetryAlert[] = [
  {
    id: 'alt-101',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    sensorId: 'N1',
    sensorName: 'Sensor Nivel N1 - Estanque Principal',
    severity: 'warning',
    message: 'Nivel alcanzó el 88% de capacidad (Umbral de advertencia: 85%)',
    value: '8.8 m (88%)',
    status: 'active',
  },
  {
    id: 'alt-102',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    sensorId: 'F1',
    sensorName: 'Caudalímetro F1 - Entrada Dulce',
    severity: 'info',
    message: 'Sincronización exitosa con InfluxDB en AWS EC2 (Latencia: 14ms)',
    value: '294 m³/h',
    status: 'resolved',
  },
  {
    id: 'alt-103',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    sensorId: 'EC2',
    sensorName: 'Servidor AWS EC2 InfluxDB Cluster',
    severity: 'info',
    message: 'Respaldo automático de base de datos de tiempo real completado',
    value: '1.2 GB comprimido',
    status: 'resolved',
  },
];

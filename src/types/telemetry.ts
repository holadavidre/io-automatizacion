export interface SensorReading {
  timestamp: string; // ISO String
  epoch: number; // Unix timestamp in ms
  // Caudalímetros (Flow meters in m³/h and L/s)
  caudal1_m3h: number; // Caudalímetro 1 (Línea Principal)
  caudal1_ls: number;
  caudal1_total_m3: number; // Acumulado
  caudal2_m3h: number; // Caudalímetro 2 (Línea Auxiliar)
  caudal2_ls: number;
  caudal2_total_m3: number;

  // Sensores de Nivel (Level sensors in meters and percentage)
  nivel1_m: number; // Sensor Nivel 1 (Estanque Principal - Capacidad máx: 10m)
  nivel1_pct: number;
  nivel2_m: number; // Sensor Nivel 2 (Estanque Reserva / Decantador - Capacidad máx: 8m)
  nivel2_pct: number;

  // Hardware Status
  battery_pct: number;
  signal_rssi: number; // dBm
  ec2_status: 'online' | 'warning' | 'offline';
  influx_status: 'synced' | 'buffering' | 'error';
}

export interface ClientCompany {
  id: string;
  name: string;
  rut: string;
  location: string;
  region: string;
  type: 'salmonera' | 'piscifactoria' | 'procesadora' | 'industrial';
  centers: CompanyCenter[];
}

export interface CompanyCenter {
  id: string;
  name: string;
  location: string;
  caudalimetros: {
    c1Name: string;
    c1MaxFlow: number; // m³/h
    c2Name: string;
    c2MaxFlow: number; // m³/h
  };
  sensoresNivel: {
    n1Name: string;
    n1MaxHeight: number; // m
    n2Name: string;
    n2MaxHeight: number; // m
  };
}

export interface TelemetryAlert {
  id: string;
  timestamp: string;
  sensorId: 'F1' | 'F2' | 'N1' | 'N2' | 'EC2';
  sensorName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: string;
  status: 'active' | 'resolved';
}

export type TimeRange = 'live' | '24h' | '7d' | '30d' | '1y';

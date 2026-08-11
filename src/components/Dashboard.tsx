import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Battery,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Droplets,
  FileSpreadsheet,
  Layers,
  Server,
  ShieldAlert,
  Signal,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type {
  SensorReading,
  ClientCompany,
  TimeRange,
} from '../types/telemetry';
import {
  MOCK_COMPANIES,
  generateCurrentReading,
  getHistoricalData,
  MOCK_ALERTS,
} from '../services/telemetryService';
import { fetchRealInfluxData, fetchRealLatestReading, checkInfluxHealth } from '../services/influxService';

interface DashboardProps {
  onBackToHome: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBackToHome }) => {
  // Tenant State
  const [selectedCompany, setSelectedCompany] = useState<ClientCompany>(MOCK_COMPANIES[0]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>(MOCK_COMPANIES[0].centers[0].id);

  // Time Range & Mode
  const [timeRange, setTimeRange] = useState<TimeRange>('live');
  const [isRealInfluxMode, setIsRealInfluxMode] = useState<boolean>(true);
  const [influxConnected, setInfluxConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(30);

  // Telemetry Readings
  const [currentReading, setCurrentReading] = useState<SensorReading>(generateCurrentReading());
  const [chartData, setChartData] = useState<SensorReading[]>([]);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const activeCenter =
    selectedCompany.centers.find((c) => c.id === selectedCenterId) || selectedCompany.centers[0];

  // Check InfluxDB Connection Health on mount
  useEffect(() => {
    checkInfluxHealth().then((res) => {
      setInfluxConnected(res.online);
    });
  }, []);

  // Fetch data (Real InfluxDB vs Simulation)
  useEffect(() => {
    if (isRealInfluxMode) {
      fetchRealInfluxData(timeRange)
        .then((data) => {
          if (data.length > 0) {
            setChartData(data);
            setCurrentReading(data[data.length - 1]);
            setInfluxConnected(true);
          } else {
            // Fallback if bucket empty
            const fallback = getHistoricalData(timeRange);
            setChartData(fallback);
            if (fallback.length > 0) setCurrentReading(fallback[fallback.length - 1]);
          }
        })
        .catch((err) => {
          console.warn('InfluxDB real fetch failed, falling back to mock:', err);
          setInfluxConnected(false);
          const fallback = getHistoricalData(timeRange);
          setChartData(fallback);
          if (fallback.length > 0) setCurrentReading(fallback[fallback.length - 1]);
        })
        .finally(() => {
          setLastUpdated(new Date());
        });
    } else {
      const data = getHistoricalData(timeRange);
      setChartData(data);
      if (data.length > 0) {
        setCurrentReading(data[data.length - 1]);
      }
    }
  }, [timeRange, selectedCenterId, isRealInfluxMode]);

  // Live polling timer (30s interval for production data)
  useEffect(() => {
    setCountdown(30);

    const timer = setInterval(async () => {
      if (isRealInfluxMode) {
        try {
          const [latest, series] = await Promise.all([
            fetchRealLatestReading(),
            fetchRealInfluxData(timeRange),
          ]);
          if (latest) {
            setCurrentReading(latest);
            setInfluxConnected(true);
          }
          if (series.length > 0) {
            setChartData(series);
          }
        } catch {
          setInfluxConnected(false);
        }
      } else {
        const newReading = generateCurrentReading();
        setCurrentReading(newReading);
        if (timeRange === 'live') {
          setChartData((prev) => {
            const updated = [...prev, newReading];
            if (updated.length > 35) updated.shift();
            return updated;
          });
        }
      }
      setLastUpdated(new Date());
      setCountdown(30);
    }, 30000);

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
    };
  }, [timeRange, isRealInfluxMode]);

  // Handler for company change
  const handleCompanyChange = (companyId: string) => {
    const comp = MOCK_COMPANIES.find((c) => c.id === companyId);
    if (comp) {
      setSelectedCompany(comp);
      setSelectedCenterId(comp.centers[0].id);
    }
  };

  // Export CSV function
  const handleExportCSV = () => {
    const headers = 'Timestamp,Caudal1_m3h,Caudal1_Ls,Caudal2_m3h,Caudal2_Ls,Nivel1_m,Nivel1_pct,Nivel2_m,Nivel2_pct\n';
    const rows = chartData
      .map(
        (r) =>
          `${r.timestamp},${r.caudal1_m3h},${r.caudal1_ls},${r.caudal2_m3h},${r.caudal2_ls},${r.nivel1_m},${r.nivel1_pct},${r.nivel2_m},${r.nivel2_pct}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `IO_Telemetry_${selectedCompany.id}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Telemetry Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors cursor-pointer"
              title="Volver a la Web Principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-extrabold text-sm">
                IO
              </div>
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-2">
                  IO-Telemetry Cloud
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-medium">
                    AWS EC2 & InfluxDB v2
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Portal de Monitoreo de Caudales & Niveles</p>
              </div>
            </div>
          </div>

          {/* Tenant Selector & Fast Demo Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Company Picker */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <select
                value={selectedCompany.id}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {MOCK_COMPANIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Center Selector */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Layers className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {selectedCompany.centers.map((cnt) => (
                  <option key={cnt.id} value={cnt.id} className="bg-slate-900 text-white">
                    {cnt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live InfluxDB Real Data Toggle */}
            <button
              onClick={() => setIsRealInfluxMode(!isRealInfluxMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isRealInfluxMode
                  ? influxConnected
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Alternar entre datos en vivo desde InfluxDB EC2 y datos simulados"
            >
              <span className={`w-2 h-2 rounded-full ${isRealInfluxMode && influxConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isRealInfluxMode ? (influxConnected ? 'InfluxDB Live (EC2)' : 'InfluxDB (Conectando...)') : 'Modo Simulación'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Status Banner */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block animate-ping absolute top-0 right-0"></span>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                <Wifi className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Estado de la Red AWS EC2:</span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  ONLINE - InfluxDB OK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span>Latencia: <strong>18ms</strong></span>
                <span>•</span>
                <span>Última lectura: <strong>{lastUpdated.toLocaleTimeString()}</strong></span>
                <span>•</span>
                <span>Próximo envío en: <strong className="text-cyan-400">{countdown}s</strong></span>
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-3 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Rango:
            </span>
            {(['live', '24h', '7d', '30d', '1y'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r === 'live' ? 'Tiempo Real' : r}
              </button>
            ))}
          </div>
        </div>

        {/* 3 KPI Telemetry Cards (Potencia Generador + 2 Level Sensors) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* Potencia Generador */}
          <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> {isRealInfluxMode ? 'Potencia Generador' : 'Potencia Generador (F2)'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                {isRealInfluxMode ? 'potencia_generador_kw' : 'Auxiliar'}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate mb-2">{isRealInfluxMode ? 'Medición InfluxDB: potencia_generador_kw' : activeCenter.caudalimetros.c2Name}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-white tracking-tight">
                {currentReading.caudal2_m3h} <span className="text-sm font-semibold text-slate-400">{isRealInfluxMode ? 'kW' : 'm³/h'}</span>
              </div>
              <div className="text-xs font-semibold text-cyan-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-4 h-4" /> {isRealInfluxMode ? `${currentReading.caudal2_m3h} kW` : `${currentReading.caudal2_ls} L/s`}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{isRealInfluxMode ? 'Potencia Activa' : 'Acumulado'}: <strong>{currentReading.caudal2_m3h} {isRealInfluxMode ? 'kW' : 'm³'}</strong></span>
              <span className="text-emerald-400">Operativo</span>
            </div>
          </div>

          {/* Sensor Nivel Estanque 1 */}
          <div className="glass-panel p-5 rounded-2xl border-emerald-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" /> {isRealInfluxMode ? 'Nivel Estanque 1' : 'Sensor Nivel N1'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-500/30">
                {isRealInfluxMode ? 'nivel_estanque_1' : 'Estanque 1'}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate mb-2">{isRealInfluxMode ? 'Medición InfluxDB: nivel_estanque_1' : activeCenter.sensoresNivel.n1Name}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-white tracking-tight">
                {currentReading.nivel1_m} <span className="text-sm font-semibold text-slate-400">{isRealInfluxMode ? 'm / %' : 'm'}</span>
              </div>
              <div className="text-xs font-bold text-amber-400">
                {currentReading.nivel1_pct}% Cap.
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentReading.nivel1_pct > 85 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, currentReading.nivel1_pct)}%` }}
              ></div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sensor ID: <strong>N1</strong></span>
              <span className={currentReading.nivel1_pct > 85 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {currentReading.nivel1_pct > 85 ? 'Advertencia Alto' : 'Óptimo'}
              </span>
            </div>
          </div>

          {/* Sensor Nivel 2 / Nivel Estanque 2 */}
          <div className="glass-panel p-5 rounded-2xl border-emerald-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" /> {isRealInfluxMode ? 'Nivel Estanque 2' : 'Sensor Nivel N2'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                {isRealInfluxMode ? 'nivel_estanque_2' : 'Estanque 2'}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate mb-2">{isRealInfluxMode ? 'Medición InfluxDB: nivel_estanque_2' : activeCenter.sensoresNivel.n2Name}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-white tracking-tight">
                {currentReading.nivel2_m} <span className="text-sm font-semibold text-slate-400">{isRealInfluxMode ? 'm / %' : 'm'}</span>
              </div>
              <div className="text-xs font-bold text-cyan-400">
                {currentReading.nivel2_pct}% Cap.
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, currentReading.nivel2_pct)}%` }}
              ></div>
            </div>

            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sensor ID: <strong>N2</strong></span>
              <span className="text-emerald-400">Estable</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flow Rate Chart (Caudal F1 vs F2) */}
          <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" /> {isRealInfluxMode ? 'Flujo & Potencia Generador (InfluxDB)' : 'Monitoreo de Caudales en Tiempo Real (m³/h)'}
                </h3>
                <p className="text-xs text-slate-400">{isRealInfluxMode ? 'Datos en vivo de flujo_generador (m³/h) y potencia_generador_kw (kW)' : 'Comparativa F1 (Entrada) vs F2 (Línea Auxiliar)'}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 font-semibold border border-cyan-500/30">
                Bucket: salmonera
              </span>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorF1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorF2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="caudal1_m3h"
                    name={isRealInfluxMode ? 'flujo_generador (m³/h)' : 'Caudal F1 (Principal)'}
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorF1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="caudal2_m3h"
                    name={isRealInfluxMode ? 'potencia_generador_kw (kW)' : 'Caudal F2 (Auxiliar)'}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorF2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Level Chart (Nivel N1 vs N2) */}
          <div className="glass-panel p-5 rounded-2xl border-emerald-500/20 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-400" /> Tendencia de Nivel de Estanques (Metros)
                </h3>
                <p className="text-xs text-slate-400">Variación continua N1 (Estanque Principal) y N2 (Reserva)</p>
              </div>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Datos
              </button>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="nivel1_m"
                    name={isRealInfluxMode ? 'nivel_estanque_1' : 'Nivel N1 (Metros)'}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="nivel2_m"
                    name={isRealInfluxMode ? 'nivel_estanque_2' : 'Nivel N2 (Metros)'}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lower Section: Active Alerts & Hardware Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Alerts */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Registro de Eventos & Alarmas de Campo
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30 font-semibold">
                3 Eventos Recientes
              </span>
            </div>

            <div className="space-y-3">
              {MOCK_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        alert.severity === 'warning'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {alert.severity === 'warning' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{alert.sensorName}</div>
                      <p className="text-slate-400 mt-0.5">{alert.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(alert.timestamp).toLocaleTimeString()} • Valor: {alert.value}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      alert.status === 'active'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Hardware Health Box */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-800">
                <Server className="w-4 h-4 text-cyan-400" /> Salud del Hardware & Gateway AWS
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400" /> Batería Respaldada Gateway:
                  </span>
                  <span className="font-bold text-emerald-400">{currentReading.battery_pct}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Signal className="w-4 h-4 text-cyan-400" /> Señal Módem 4G / LoRa:
                  </span>
                  <span className="font-bold text-cyan-400">{currentReading.signal_rssi} dBm (Excelente)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" /> Servidor AWS EC2:
                  </span>
                  <span className="font-bold text-indigo-400">us-east-1 (N. Virginia)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Retención InfluxDB:
                  </span>
                  <span className="font-bold text-amber-400">365 Días Activo</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              Desarrollado para <strong>IO Automatización</strong> por Especialistas en Control Industrial.
            </div>
          </div>
        </div>
      </main>

      {/* Export CSV / Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" /> Exportar Informe de Telemetría
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Genera un archivo compatible con Excel / CSV con todas las lecturas de los 2 Caudalímetros y 2 Sensores de Nivel de <strong>{selectedCompany.name}</strong> para el rango seleccionado (<strong>{timeRange}</strong>).
            </p>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Total Registros: <strong>{chartData.length} Muestras</strong></div>
              <div>Formato: <strong>CSV UTC / ISO Time-Series</strong></div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

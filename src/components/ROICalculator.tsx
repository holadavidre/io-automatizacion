import React, { useState } from 'react';
import { Calculator, ShieldAlert, Droplets, CheckCircle, Sparkles } from 'lucide-react';

export const ROICalculator: React.FC = () => {
  const [estanqueCapacity, setEstanqueCapacity] = useState<number>(500); // m³
  const [costoAguaM3, setCostoAguaM3] = useState<number>(1800); // CLP / m³
  const [fugaHorasEstimadas, setFugaHorasEstimadas] = useState<number>(12); // horas sin detección manual

  // Cálculos de ahorro
  const perdidaPorEventoM3 = (estanqueCapacity * 0.45 * fugaHorasEstimadas) / 12;
  const costoPerdidaSinMonitoreo = perdidaPorEventoM3 * costoAguaM3;
  
  // Con monitoreo en tiempo real IO (alerta en 30s)
  const costoPerdidaConIO = (perdidaPorEventoM3 * 0.05) * costoAguaM3;
  const ahorroPorEvento = costoPerdidaSinMonitoreo - costoPerdidaConIO;
  const ahorroAnualEstimado = ahorroPorEvento * 4; // 4 eventos de desborde/variación al año

  return (
    <div className="py-12 glass-panel rounded-3xl p-6 sm:p-10 border-cyan-500/20 my-8">
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        {/* Input Parameters */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Calculadora de Impacto Financiero
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            ¿Cuánto ahorra tu salmonera con <span className="text-gradient-cyan">monitoreo en tiempo real</span>?
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed">
            Simula las pérdidas por rebalse de estanques o anomalías de caudal no detectadas a tiempo en comparación con alertas automatizadas cada 30 segundos.
          </p>

          <div className="space-y-5 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Capacidad Total Estanques / Red:</span>
                <span className="text-cyan-400 font-bold">{estanqueCapacity} m³</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={estanqueCapacity}
                onChange={(e) => setEstanqueCapacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Costo estimado por m³ de Agua / RILes:</span>
                <span className="text-cyan-400 font-bold">${costoAguaM3.toLocaleString('es-CL')} CLP</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={costoAguaM3}
                onChange={(e) => setCostoAguaM3(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Tiempo de respuesta inspección manual (sin sensor):</span>
                <span className="text-cyan-400 font-bold">{fugaHorasEstimadas} Horas</span>
              </div>
              <input
                type="range"
                min="2"
                max="48"
                step="2"
                value={fugaHorasEstimadas}
                onChange={(e) => setFugaHorasEstimadas(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-6 sm:p-8 rounded-2xl border border-cyan-500/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" /> Estimación de Ahorro Neto
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/40 font-semibold">
                Retorno Inmediato
              </span>
            </div>

            <div className="my-6">
              <span className="text-xs text-slate-400 block mb-1">Ahorro anual estimado (base 4 eventos prevendidos):</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-gradient-cyan">
                ${Math.round(ahorroAnualEstimado).toLocaleString('es-CL')} CLP
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                (~{Math.round(ahorroAnualEstimado / 950).toLocaleString('en-US')} USD aprox.)
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Pérdida potencial sin sensores:
                </span>
                <span className="font-bold text-rose-400">${Math.round(costoPerdidaSinMonitoreo).toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Pérdida contenida con IO Automatización:
                </span>
                <span className="font-bold text-cyan-400">${Math.round(costoPerdidaConIO).toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400 pt-2 border-t border-slate-800/80 font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Reducción de riesgo operativo:
                </span>
                <span>95% Eficiencia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

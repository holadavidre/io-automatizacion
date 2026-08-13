import React, { useState } from 'react';
import { Calculator, ShieldAlert, Droplets, CheckCircle, Sparkles } from 'lucide-react';

export const ROICalculator: React.FC = () => {
  const [capacidadLitros, setCapacidadLitros] = useState<number>(35000); // Litros
  const [costoPetroleoLitro, setCostoPetroleoLitro] = useState<number>(1050); // CLP / Litro
  const [porcentajeError, setPorcentajeError] = useState<number>(5); // % de error en medición manual / mermas

  // Cálculos de ahorro
  const perdidaLitros = capacidadLitros * (porcentajeError / 100);
  const costoPerdidaSinMonitoreo = perdidaLitros * costoPetroleoLitro;
  
  // Con monitoreo en tiempo real IO (precisión > 99.5%, margen de error reducido a 0.25%)
  const costoPerdidaConIO = costoPerdidaSinMonitoreo * 0.05;
  const ahorroPorMedicion = costoPerdidaSinMonitoreo - costoPerdidaConIO;
  const ahorroAnualEstimado = ahorroPorMedicion * 12; // 12 ciclos de llenado/control al año

  return (
    <div className="py-12 glass-panel rounded-3xl p-6 sm:p-10 border-cyan-500/20 my-8">
      <div className="flex flex-col lg:flex-row gap-10 items-center">
        {/* Input Parameters */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Calculadora de Impacto Financiero
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            ¿Cuánto ahorras en <span className="text-gradient-cyan">control de Petróleo y Combustible</span>?
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed">
            Simula el ahorro financiero al eliminar mermas, descuadres o errores de medición manual en estanques de combustible mediante sensores continuos de alta precisión.
          </p>

          <div className="space-y-5 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Capacidad Total Estanque(s):</span>
                <span className="text-cyan-400 font-bold">{capacidadLitros.toLocaleString('es-CL')} Litros</span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={capacidadLitros}
                onChange={(e) => setCapacidadLitros(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Costo estimado por Litro de Petróleo / Combustible:</span>
                <span className="text-cyan-400 font-bold">${costoPetroleoLitro.toLocaleString('es-CL')} CLP</span>
              </div>
              <input
                type="range"
                min="700"
                max="2000"
                step="10"
                value={costoPetroleoLitro}
                onChange={(e) => setCostoPetroleoLitro(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Porcentaje de error / descuadre en medición manual:</span>
                <span className="text-cyan-400 font-bold">{porcentajeError}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={porcentajeError}
                onChange={(e) => setPorcentajeError(Number(e.target.value))}
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
              <span className="text-xs text-slate-400 block mb-1">Ahorro anual estimado (base 12 controles/llenados al año):</span>
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
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Descuadre potencial sin telemetría ({porcentajeError}%):
                </span>
                <span className="font-bold text-rose-400">${Math.round(costoPerdidaSinMonitoreo).toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Margen controlado con IO Automatización:
                </span>
                <span className="font-bold text-cyan-400">${Math.round(costoPerdidaConIO).toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400 pt-2 border-t border-slate-800/80 font-bold">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Precisión en medición continua:
                </span>
                <span>99.5% Precisión</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Cpu, Server, Database, Radio, Globe, ShieldCheck, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Sensores de Terreno (4 a 20 mA / Modbus)',
      icon: Radio,
      badge: 'Caudal & Nivel',
      desc: '2 Caudalímetros Electromagnéticos y 2 Sensores de Nivel Ultrasónicos/Radar instalados en tuberías y estanques.',
      details: 'Transmisión vía enlace RS-485 / Modbus RTU a módem celular / LoRaWAN industrial de grado marino IP68.',
      tech: ['Modbus RTU', 'RS-485', 'LoRaWAN / 4G LTE', 'IP68 Marine'],
    },
    {
      id: 2,
      title: 'Instancia AWS EC2 IoT Gateway',
      icon: Server,
      badge: 'Amazon AWS Cloud',
      desc: 'Servidor EC2 en la nube de Amazon parametrizado con recepción de paquetes, encriptación TLS y validación CRC.',
      details: 'Procesa hasta 100,000 muestras por minuto con tiempo de respuesta < 20ms e ingestión continua cada 30s.',
      tech: ['AWS EC2 Linux', 'Docker Container', 'MQTT / HTTPS', 'TLS 1.3 Encryption'],
    },
    {
      id: 3,
      title: 'Base de Datos InfluxDB (Time-Series)',
      icon: Database,
      badge: 'Histórico 1 Año',
      desc: 'Motor InfluxDB optimizado para series temporales de alta velocidad, garantizando retención de 1 año de datos.',
      details: 'Compresión columnar de datos de telemetría. Permite consultas analíticas de 24h, 30 días o 12 meses en milisegundos.',
      tech: ['InfluxDB v2.7', 'Flux Queries', 'Downsampling', '1 Year Retention'],
    },
    {
      id: 4,
      title: 'API REST & WebSocket Gateway',
      icon: Cpu,
      badge: 'Latencia < 50ms',
      desc: 'Capa API securizada que distribuye las lecturas en tiempo real a las empresas autorizadas.',
      details: 'Autenticación mediante JWT Tokens, aislamiento de datos por cliente (Multi-Tenant) y webhooks de alerta.',
      tech: ['Node.js API', 'WebSockets', 'JWT Auth', 'Rate Limiting'],
    },
    {
      id: 5,
      title: 'Web App Telemetry Dashboard',
      icon: Globe,
      badge: 'Antigravity / Client Portal',
      desc: 'Interfaz gráfica navegable en tiempo real con gráficos profesionales para salmoneras e industrias.',
      details: 'Visualización interactiva en PC, Tablet y Smartphones. Exportación de informes, gráficas de tendencia y alarmas.',
      tech: ['React SPA', 'Recharts SVG', 'Responsive UI', 'Export CSV/PDF'],
    },
  ];

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
          Arquitectura de Datos IO-Telemetry Cloud
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          De los sensores de campo a tus decisiones en <span className="text-gradient-cyan">tiempo real</span>
        </h2>
        <p className="mt-4 text-slate-400 text-base leading-relaxed">
          Flujo de datos robusto y redundante diseñado bajo los requerimientos de la industria acuícola y de automatización.
        </p>
      </div>

      {/* Interactive Step Timeline */}
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === step.id;
            return (
              <div
                key={step.id}
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
                className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                  isHovered
                    ? 'border-cyan-400/80 bg-slate-900/90 shadow-lg shadow-cyan-500/20 scale-[1.03]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold text-xs flex items-center justify-center">
                      0{step.id}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{step.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">{step.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-auto">
                  <div className="flex flex-wrap gap-1">
                    {step.tech.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <ArrowRight className="w-5 h-5 text-cyan-500/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Step Detail Drawer */}
        <div className="mt-8 glass-panel p-6 rounded-2xl border-cyan-500/30 bg-slate-950/80">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                Especificación Técnica de la Tubería AWS EC2 + InfluxDB
                <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Frecuencia: 30 Segundos
                </span>
              </h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {activeStep
                  ? steps.find((s) => s.id === activeStep)?.details
                  : 'Pasa el cursor sobre cualquiera de los módulos para conocer los detalles de seguridad, rendimiento e ingesta de datos en tiempo real.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Latencia de transmisión: <strong>14 ms - 32 ms</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Retención histórica: <strong>365 Días (InfluxDB Partitioning)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>Sensores activos en maqueta: <strong>2 Caudalímetros + 2 Niveles</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

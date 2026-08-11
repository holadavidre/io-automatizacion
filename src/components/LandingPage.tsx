import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle,
  Cpu,
  Droplets,
  Gauge,
  Lock,
  Mail,
  Phone,
  Radio,
  Zap,
  Building,
  Award,
  LogIn,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ROICalculator } from './ROICalculator';
import emailjs from '@emailjs/browser';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    mensaje: '',
  });

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLoginModal && loginInputRef.current) {
      loginInputRef.current.focus();
    }
  }, [showLoginModal]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLoginModal(false);
    };
    if (showLoginModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [showLoginModal]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginData.usuario.trim() || !loginData.password.trim()) {
      setLoginError('Por favor complete todos los campos.');
      return;
    }
    setIsLoggingIn(true);
    // Simulate authentication
    setTimeout(() => {
      setIsLoggingIn(false);
      // For now, accept any credentials and open dashboard
      setShowLoginModal(false);
      setLoginData({ usuario: '', password: '' });
      onOpenDashboard();
    }, 1500);
  };

  const openLoginModal = () => {
    setLoginError('');
    setLoginData({ usuario: '', password: '' });
    setShowPassword(false);
    setShowLoginModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendError('');

    try {
      // ─── EmailJS Configuration ───
      // Replace these with your actual EmailJS credentials:
      // 1. Go to https://www.emailjs.com/ and create a free account
      // 2. Add an Email Service (Gmail, Outlook, etc.) → get your SERVICE_ID
      // 3. Create an Email Template with variables: {{nombre}}, {{empresa}}, {{email}}, {{telefono}}, {{mensaje}}
      // 4. Get your PUBLIC_KEY from Account → API Keys
      const SERVICE_ID = 'service_4w84pdh';
      const TEMPLATE_ID = 'template_z2o3ein';
      const PUBLIC_KEY = 'nNX3cmn0MXp-Lcd6m';

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          nombre: formData.nombre,
          name: formData.nombre,
          empresa: formData.empresa,
          company: formData.empresa,
          email: formData.email,
          telefono: formData.telefono || 'No proporcionado',
          phone: formData.telefono || 'No proporcionado',
          mensaje: formData.mensaje,
          message: formData.mensaje,
        },
        PUBLIC_KEY
      );

      setFormSubmitted(true);
      setFormData({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '' });
      setTimeout(() => setFormSubmitted(false), 8000);
    } catch (error: any) {
      console.error('EmailJS Error:', error);
      const errMsg = error?.text || error?.message || 'Error al enviar el mensaje.';
      setSendError(`Error (${errMsg}). Por favor verifique o escriba a contacto@ioautomatizacion.cl`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/20">
              IO
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                IO AUTOMATIZACIÓN
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                Servicios Eléctricos & Control Industrial
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#servicios" className="hover:text-cyan-400 transition-colors">
              Servicios
            </a>
            <a href="#arquitectura" className="hover:text-cyan-400 transition-colors">
              Arquitectura IoT
            </a>
            <a href="#roi" className="hover:text-cyan-400 transition-colors">
              Calculador ROI
            </a>
            <a href="#contacto" className="hover:text-cyan-400 transition-colors">
              Contacto
            </a>
          </nav>

          {/* CTA Access Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={openLoginModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingreso Empresas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Background Underwater Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90 contrast-110 pointer-events-none"
        >
          <source src="/videos/salmon_spawning.webm" type="video/webm" />
          <source src="/videos/salmon_underwater.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/90 via-[#080c14]/75 to-[#080c14] pointer-events-none" />

        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Servicio de Monitoreo IoT en Tiempo Real para Salmoneras
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Automatización Industrial<span className="text-gradient-cyan"> y Telemetría de Alta Precisión</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Soluciones integrales de control industrial, montaje eléctrico y monitoreo continuo de 
                <strong className="text-white font-semibold"> Caudales y Niveles de Estanques </strong> 
                transmitidos cada 30 segundos desde campo a la nube <strong>AWS EC2 & InfluxDB</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={openLoginModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Ingreso Empresas</span>
                </button>

                <a
                  href="#contacto"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
                >
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>Contactar Especialista</span>
                </a>
              </div>

              {/* Key Proof Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
                <div>
                  <div className="text-2xl font-black text-white">30 seg</div>
                  <div className="text-xs text-slate-400">Refresco de Datos AWS</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400">365 Días</div>
                  <div className="text-xs text-slate-400">Histórico en InfluxDB</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400">24/7</div>
                  <div className="text-xs text-slate-400">Alertas de Caudal/Nivel</div>
                </div>
              </div>
            </div>

            {/* Right Live Teaser Widget */}
            <div className="lg:col-span-5">
              <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Nodo Telemetría Vivo - Salmonera Austral
                    </span>
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono">
                    EC2 STREAM
                  </span>
                </div>

                <div className="space-y-4 my-5">
                  {/* Live Meter 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Caudalímetro F1 (Línea Entrada)</div>
                        <div className="text-[10px] text-slate-400">Sensor Electromagnético RS-485</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-cyan-400">294.5 m³/h</div>
                      <div className="text-[10px] text-emerald-400">81.8 L/s</div>
                    </div>
                  </div>

                  {/* Live Meter 2 */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Sensor Nivel N1 (Estanque Acopio)</div>
                        <div className="text-[10px] text-slate-400">Radar de Onda Continua 80GHz</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400">7.82 m</div>
                      <div className="text-[10px] text-amber-400 font-bold">78% Capacidad</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenDashboard}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Gauge className="w-4 h-4" />
                  <span>Ingresar al Dashboard Interactivo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-bold uppercase mb-3">
              <Zap className="w-3.5 h-3.5" /> Nuestras Soluciones Técnicas
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Servicios Industriales de <span className="text-gradient-cyan">Ingeniería & Control</span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Respondiendo a las exigencias operativas del sector salmonero, acuícola e industrial con los más altos estándares.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <div className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Montajes Eléctricos</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Instalaciones eléctricas industriales, comerciales y tableros de fuerza bajo normativas vigentes SEC, garantizando seguridad y continuidad operativa.
                </p>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Tableros de Potencia & Control</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Redes Eléctricas Industriales</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automatización de Sistemas</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Diseño y programación de sistemas automatizados para plantas de proceso, optimizando la producción mediante I+D.
                </p>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Lógica SCADA y Plantas de Proceso</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Eficiencia Operativa Continua</li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Programación PLC & HMI</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Configuración avanzada de autómatas programables marcas Schneider, Siemens y Mitsubishi, asegurando compatibilidad y desempeño.
                </p>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Siemens S7-1200 / S7-1500</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Schneider Modicon & Mitsubishi PLC</li>
              </ul>
            </div>

            {/* Service 4 - Telemetry Highlight */}
            <div className="glass-panel p-6 rounded-2xl border-cyan-500/50 bg-gradient-to-b from-cyan-950/40 to-slate-950 hover:border-cyan-400 transition-all flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500 text-slate-950">
                NUEVO SAAS
              </span>
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center mb-5 font-black shadow-lg shadow-cyan-500/30">
                  <Radio className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">IO-Telemetry Cloud</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Plataforma de visualización en tiempo real para 2 caudalímetros y 2 sensores de nivel con ingesta cada 30 segundos y 1 año de histórico en AWS.
                </p>
              </div>
              <ul className="text-[11px] text-cyan-200 space-y-1.5 pt-4 border-t border-cyan-500/20">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> 2 Caudalímetros + 2 Niveles</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> AWS EC2 + InfluxDB + Gráficos Live</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry Architecture Section */}
      <section id="arquitectura" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArchitectureDiagram />
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section id="roi" className="py-12 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ROICalculator />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Direct Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase">
                <Building className="w-3.5 h-3.5" /> Contáctanos Directamente
              </div>

              <h2 className="text-3xl font-extrabold text-white">
                Impulsa la automatización de tus plantas con <span className="text-gradient-cyan">IO Automatización</span>
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                Ponte en contacto con nuestro equipo especializado para cotizaciones de montajes eléctricos, programación de PLC o implementación del sistema IO-Telemetry Cloud.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel border-slate-800">
                  <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Teléfono / WhatsApp Directo</div>
                    <a href="tel:+56936303696" className="text-sm font-bold text-white hover:text-cyan-400">
                      +56 9 3630 3696
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel border-slate-800">
                  <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Correo Electrónico Corporativo</div>
                    <a href="mailto:contacto@ioautomatizacion.cl" className="text-sm font-bold text-white hover:text-cyan-400">
                      contacto@ioautomatizacion.cl
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl glass-panel border-slate-800">
                  <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Líder de Proyecto & Especialista</div>
                    <div className="text-sm font-bold text-white">Hugo Castro Villalón</div>
                    <div className="text-[11px] text-slate-400">Especialista en Automatización y Control Industrial</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-8 rounded-3xl border-cyan-500/30 bg-slate-950/80">
                <h3 className="text-xl font-bold text-white mb-2">Solicita una Cotización o Demostración</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Completa los campos a continuación y un ingeniero se pondrá en contacto en menos de 24 horas.
                </p>

                {formSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="font-bold text-base">¡Mensaje Enviado con Éxito!</div>
                    <p className="text-xs text-emerald-200">
                      Gracias por contactar a IO Automatización. Nos comunicaremos a la brevedad.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="ej. Carlos Mendoza"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Empresa / Salmonera</label>
                        <input
                          type="text"
                          required
                          placeholder="ej. Salmonera Austral S.A."
                          value={formData.empresa}
                          onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Correo Electrónico</label>
                        <input
                          type="email"
                          required
                          placeholder="carlos@salmonera.cl"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Teléfono</label>
                        <input
                          type="tel"
                          placeholder="+56 9 1234 5678"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Detalle del Requerimiento</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describa sus necesidades de monitoreo de caudal/nivel o servicios eléctricos..."
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                      ></textarea>
                    </div>

                    {sendError && (
                      <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                        {sendError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                          </svg>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <span>Enviar Mensaje a IO Automatización</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-xs">
              IO
            </div>
            <div>
              <span className="font-bold text-white">IO Automatización</span> © 2026 - Servicios Eléctricos y Automatización Industrial
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://www.ioautomatizacion.cl/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
              ioautomatizacion.cl
            </a>
            <a href="mailto:contacto@ioautomatizacion.cl" className="hover:text-cyan-400">
              contacto@ioautomatizacion.cl
            </a>
          </div>
        </div>
      </footer>

      {/* ─── Login Modal ─── */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowLoginModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'loginModalIn 0.3s ease-out' }}
          >
            {/* Glow accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative px-8 py-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/30">
                  IO
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Ingreso Empresas
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Acceda a su portal de telemetría en tiempo real
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Usuario */}
                <div>
                  <label htmlFor="login-usuario" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Usuario o Email
                  </label>
                  <div className="relative">
                    <input
                      ref={loginInputRef}
                      id="login-usuario"
                      type="text"
                      value={loginData.usuario}
                      onChange={(e) => setLoginData({ ...loginData, usuario: e.target.value })}
                      placeholder="usuario@empresa.cl"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-500 text-sm outline-none transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-500 text-sm outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {loginError && (
                  <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                    {loginError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer links */}
              <div className="mt-6 text-center space-y-2">
                <a href="#" className="block text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  ¿Olvidó su contraseña?
                </a>
                <p className="text-[11px] text-slate-500">
                  Acceso exclusivo para clientes con contrato activo.
                  <br />
                  <a href="#contacto" onClick={() => setShowLoginModal(false)} className="text-cyan-500 hover:text-cyan-400 transition-colors">
                    Solicitar acceso →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Animation Keyframes */}
      <style>{`
        @keyframes loginModalIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

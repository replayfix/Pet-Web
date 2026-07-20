import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Truck, HeartPulse, ChevronRight, Award, Zap } from 'lucide-react';

export default function HeroBanner({ setActiveCategory }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Configuración de las 3 Diapositivas (Slides) del Carrusel
  const SLIDES = [
    {
      id: 1,
      bgGradient: 'from-[#004e66] via-[#0077a3] to-[#0097cc]',
      badgeText: 'Todo para tu mascota, con stock real y entrega inmediata.',
      badgeIcon: <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />,
      badgeColor: 'text-amber-300 border-white/20 bg-white/15',
      titlePrefix: 'Cuidado, nutrición y amor para tu ',
      titleHighlight: 'engreído',
      titleSuffix: ' 🐶🐱',
      description: 'Encuentra marcas super premium, medicinas especializadas y juguetes interactivos, reunido en un solo lugar con la comodidad y seguridad que tú y tu mascota merecen.',
      btn1Text: 'Ver Alimentos',
      btn1Action: 'comida',
      btn1Class: 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-500/30',
      btn2Text: 'Medicinas & Farmacia',
      btn2Action: 'medicinas',
      cardBadge: 'En Almacén 📦',
      cardBadgeClass: 'bg-red-500',
      cardImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80',
      cardTitle: 'Stock 100% Sincronizado',
      cardSubtitle: 'Al comprar, el sistema reduce las existencias del inventario general al instante.'
    },
    {
      id: 2,
      bgGradient: 'from-[#7c2d12] via-[#c2410c] to-[#ea580c]',
      badgeText: '¡Nueva Colección de Juguetes & Accesorios Ergonómicos!',
      badgeIcon: <Zap size={14} className="animate-bounce" />,
      badgeColor: 'text-yellow-200 border-white/20 bg-black/20',
      titlePrefix: 'Horas de diversión y estilo para tu ',
      titleHighlight: 'fiel amigo',
      titleSuffix: ' 🦴✨',
      description: 'Correas resistentes, camas ortopédicas y juguetes diseñados por veterinarios para estimular la inteligencia y vitalidad de tu perro o gato cada día.',
      btn1Text: 'Ver Accesorios',
      btn1Action: 'accesorios',
      btn1Class: 'bg-yellow-300 hover:bg-yellow-200 text-slate-900 shadow-yellow-500/30',
      btn2Text: 'Explorar Todo',
      btn2Action: 'all',
      cardBadge: 'Garantía Total 🛡️',
      cardBadgeClass: 'bg-emerald-600',
      cardImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80',
      cardTitle: 'Materiales No Tóxicos',
      cardSubtitle: 'Inspeccionados y certificados en almacén para cuidar los dientes y encías de tu mascota.'
    },
    {
      id: 3,
      bgGradient: 'from-[#064e3b] via-[#047857] to-[#10b981]',
      badgeText: 'Cuidado Clínico & Suplementos Esenciales',
      badgeIcon: <Award size={14} className="animate-pulse" />,
      badgeColor: 'text-emerald-200 border-white/20 bg-white/15',
      titlePrefix: 'Salud preventiva y máxima vitalidad en cada ',
      titleHighlight: 'etapa de vida',
      titleSuffix: ' ❤️🌿',
      description: 'Antiparasitarios, vitaminas, condroprotectores y cuidados dermatológicos recomendados por especialistas con control riguroso de caducidad.',
      btn1Text: 'Ver Farmacia',
      btn1Action: 'medicinas',
      btn1Class: 'bg-emerald-300 hover:bg-emerald-200 text-slate-900 shadow-emerald-500/30',
      btn2Text: 'Catálogo General',
      btn2Action: 'all',
      cardBadge: 'Despacho Rápido 🚚',
      cardBadgeClass: 'bg-blue-600',
      cardImage: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&auto=format&fit=crop&q=80',
      cardTitle: 'Asesoría Veterinaria',
      cardSubtitle: 'Fórmulas certificadas con fechas de vencimiento garantizadas y control de calidad en almacén.'
    }
  ];

  // Transición automática cada 4.5 segundos (se pausa al pasar el mouse por encima)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, SLIDES.length]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="py-6 animate-fade-in">
      {/* Banner Principal dinámico (Carrusel) */}
      <div 
        className={`relative rounded-[28px] overflow-hidden bg-gradient-to-r ${slide.bgGradient} text-white shadow-xl transition-all duration-700`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none transition-all duration-700" />
        
        {/* Contenido del Slide actual */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 pb-14 md:pb-16 hero-banner-flex min-h-[420px] transition-opacity duration-500">
          
          {/* Columna Izquierda: Textos y Botones */}
          <div className="max-w-xl space-y-4 text-center md:text-left px-4 md:px-6">
            <div className={`inline-flex items-center gap-2 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${slide.badgeColor}`}>
              {slide.badgeIcon}
              <span>{slide.badgeText}</span>
            </div>
            
            <h1 className="font-extrabold text-3xl md:text-5xl leading-tight">
              {slide.titlePrefix}
              <span className="text-amber-300 underline decoration-wavy decoration-2">
                {slide.titleHighlight}
              </span>
              {slide.titleSuffix}
            </h1>
            
            <p className="text-sm md:text-base text-white/90 font-normal leading-relaxed">
              {slide.description}
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <button 
                onClick={() => setActiveCategory(slide.btn1Action)}
                className={`btn font-extrabold px-6 py-3 shadow-lg text-sm flex items-center gap-1.5 ${slide.btn1Class}`}
              >
                {slide.btn1Text} <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setActiveCategory(slide.btn2Action)}
                className="btn bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-bold px-6 py-3 text-sm"
              >
                {slide.btn2Text}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Ilustración / Tarjeta Destacada */}
          <div className="hidden lg:flex flex-col items-center justify-center w-80 shrink-0 pr-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center shadow-2xl relative transform rotate-1 hover:rotate-0 transition-all duration-300">
              <div className={`absolute -top-3 -right-3 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow ${slide.cardBadgeClass}`}>
                {slide.cardBadge}
              </div>
              <img 
                src={slide.cardImage} 
                alt={slide.cardTitle} 
                className="w-36 h-36 object-cover rounded-full mx-auto border-4 border-amber-300 shadow-md mb-3 transition-transform duration-500 hover:scale-105"
              />
              <h4 className="font-bold text-lg text-white">{slide.cardTitle}</h4>
              <p className="text-xs text-white/80 mt-1 leading-normal">
                {slide.cardSubtitle}
              </p>
            </div>
          </div>

        </div>

        {/* Indicadores / Burbujas de Paginación circulares (position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%)) */}
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 20
          }}
        >
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir a la diapositiva ${idx + 1}`}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              className={`border border-white/30 shadow-sm ${
                currentSlide === idx 
                  ? 'bg-amber-300 scale-125 ring-2 ring-white/60' 
                  : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>

      {/* Tiras de Promesa / Ventajas estilo GoPet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 benefits-grid">
        <div className="card p-4 flex items-center gap-3.5 bg-white shadow-sm border border-slate-100 benefit-card">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900">Envíos Rápidos</h5>
            <p className="text-xs text-slate-500">Despacho en 24h con control de stock exacto.</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 bg-white shadow-sm border border-slate-100 benefit-card">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900">Garantía Veterinaria</h5>
            <p className="text-xs text-slate-500">Productos originales e inspeccionados en almacén.</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3.5 bg-white shadow-sm border border-slate-100 benefit-card">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <HeartPulse size={24} />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-900">Atención Especializada</h5>
            <p className="text-xs text-slate-500">Asesoría para la alimentación y salud de tu mascota.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Sparkles, ShieldCheck, Truck, HeartPulse, ChevronRight } from 'lucide-react';

export default function HeroBanner({ setActiveCategory }) {
  return (
    <div className="py-6 animate-fade-in">
      {/* Banner Principal */}
      <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-r from-[#004e66] via-[#0077a3] to-[#0097cc] text-white shadow-xl p-8 md:p-12">
        
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 hero-banner-flex">
          
          {/* Textos */}
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/20">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>Todo para tu mascota, con stock real y entrega inmediata.</span>
            </div>
            
            <h1 className="font-extrabold text-3xl md:text-5xl leading-tight">
              Cuidado, nutrición y amor para tu <span className="text-amber-300 underline decoration-wavy decoration-2">engreído</span> 🐶🐱
            </h1>
            
            <p className="text-sm md:text-base text-blue-100 font-normal leading-relaxed">
              Encuentra marcas super premium, medicinas especializadas y juguetes interactivos, reunido en un solo lugar con la comodidad y seguridad que tú y tu mascota merecen.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <button 
                onClick={() => setActiveCategory('comida')}
                className="btn bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-6 py-3 shadow-lg shadow-amber-500/30 text-sm flex items-center gap-1.5"
              >
                Ver Alimentos <ChevronRight size={16} />
              </button>
              <button 
                onClick={() => setActiveCategory('medicinas')}
                className="btn bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-bold px-6 py-3 text-sm"
              >
                Medicinas & Farmacia
              </button>
            </div>
          </div>

          {/* Ilustración / Tarjeta Destacada */}
          <div className="hidden lg:flex flex-col items-center justify-center w-80 shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-center shadow-2xl relative transform rotate-1 hover:rotate-0 transition-transform">
              <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                En Almacén 📦
              </div>
              <img 
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80" 
                alt="Perro feliz" 
                className="w-36 h-36 object-cover rounded-full mx-auto border-4 border-amber-300 shadow-md mb-3"
              />
              <h4 className="font-bold text-lg text-white">Stock 100% Sincronizado</h4>
              <p className="text-xs text-blue-100 mt-1">
                Al comprar, el sistema reduce las existencias del inventario general al instante.
              </p>
            </div>
          </div>

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

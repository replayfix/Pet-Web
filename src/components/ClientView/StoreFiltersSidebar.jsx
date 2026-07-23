import React, { useState } from 'react';
import { Filter, Tag, DollarSign, Percent, Box, PawPrint } from 'lucide-react';

export default function StoreFiltersSidebar({
  activeCategory,
  setActiveCategory,
  activePetType,
  setActivePetType,
  availableBrands,
  selectedBrands,
  setSelectedBrands,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onlyOffers,
  setOnlyOffers,
  isMobileOpen,
  setIsMobileOpen
}) {

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setOnlyOffers(false);
  };

  const activeFiltersCount = selectedBrands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (onlyOffers ? 1 : 0);

  const SidebarContent = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-[15px]">
          <Filter size={15} className="text-primary" />
          Filtros
        </h4>
        {activeFiltersCount > 0 && (
          <button 
            onClick={handleClearFilters}
            className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Categoría */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Box size={13} className="text-slate-400" />
          Categoría
        </h5>
        <div className="space-y-1.5">
          {['all', 'comida', 'accesorios', 'medicinas'].map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                className="w-3.5 h-3.5 border-slate-300 text-primary focus:ring-primary"
                checked={activeCategory === cat}
                onChange={() => setActiveCategory(cat)}
              />
              <span className={`text-xs transition-colors ${activeCategory === cat ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                {cat === 'all' ? 'Todo' : cat === 'medicinas' ? 'Medicinas & Cuidado' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Mascota */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <PawPrint size={13} className="text-slate-400" />
          Mascota
        </h5>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'perro', label: '🐶 Perros' },
            { id: 'gato', label: '🐱 Gatos' },
            { id: 'aves', label: '🦜 Aves y Otros' }
          ].map(pet => (
            <label key={pet.id} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="petType"
                className="w-3.5 h-3.5 border-slate-300 text-primary focus:ring-primary"
                checked={activePetType === pet.id}
                onChange={() => setActivePetType(pet.id)}
              />
              <span className={`text-xs transition-colors ${activePetType === pet.id ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                {pet.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Solo Ofertas */}
      <div className="border-t border-slate-100 pt-3">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative flex items-center justify-center scale-75 transform origin-left">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={onlyOffers}
              onChange={(e) => setOnlyOffers(e.target.checked)}
            />
            <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-rose-500 transition-colors shadow-inner"></div>
            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-1.5 -ml-1">
            <Percent size={12} className={onlyOffers ? 'text-rose-500' : 'text-slate-400'} />
            Solo Ofertas
          </span>
        </label>
      </div>

      {/* Rango de Precio */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <DollarSign size={13} className="text-slate-400" />
          Rango de Precio
        </h5>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-[6px] items-center">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[13px] rounded px-2 py-1 h-8 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-slate-400 font-bold text-xs">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[13px] rounded px-2 py-1 h-8 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Marcas Populares */}
      {availableBrands && availableBrands.length > 0 && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Tag size={13} className="text-slate-400" />
            Marcas Populares
          </h5>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                <span className={`text-xs transition-colors ${selectedBrands.includes(brand) ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* VERSIÓN DESKTOP (Siempre visible) */}
      <aside className="hidden lg:block filter-sidebar-desktop shrink-0 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm sticky top-24 h-max">
        <SidebarContent />
      </aside>

      {/* VERSIÓN MÓVIL (Offcanvas / Modal) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <aside className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="p-6 overflow-y-auto flex-1">
              <SidebarContent />
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="w-full btn btn-primary py-3"
              >
                Ver Resultados
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

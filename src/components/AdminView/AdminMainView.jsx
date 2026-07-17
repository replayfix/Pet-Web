import React, { useState, useEffect } from 'react';
import InventoryDashboard from './InventoryDashboard';
import OrdersDashboard from './OrdersDashboard';
import { subscribeOrders } from '../../firebase/dbService';
import { Boxes, FileText, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function AdminMainView({ products, searchQuery, setSearchQuery }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeOrders((data) => {
      setOrdersCount(data.length);
    });
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* NAVEGADOR DE PESTAÑAS DEL ADMINISTRADOR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Boxes size={18} className={activeTab === 'inventory' ? 'text-amber-400' : ''} />
            <span>Almacén & Inventario</span>
            <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded-md font-mono">
              {products.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText size={18} className={activeTab === 'orders' ? 'text-emerald-400' : ''} />
            <span>Órdenes de Compra & Boletas</span>
            {ordersCount > 0 && (
              <span className="bg-emerald-500 text-white text-[11px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {ordersCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 px-3">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Modo de Administración Activo</span>
        </div>

      </div>

      {/* CONTENIDO DE LA PESTAÑA SELECCIONADA */}
      {activeTab === 'inventory' ? (
        <InventoryDashboard products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      ) : (
        <OrdersDashboard searchQuery={searchQuery} />
      )}

    </div>
  );
}

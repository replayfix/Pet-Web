import React from 'react';
import { X, ShoppingBag, User, Phone, MapPin, Calendar, Tag, ShieldCheck } from 'lucide-react';

export default function OrderDetailsModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderNum = order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514';

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 sm:py-8">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] text-left animate-zoom-in">
          
          {/* Cabecera fija sin encoger */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base leading-tight truncate">Previsualización del Pedido</h3>
                  <span className="bg-amber-400 text-slate-900 font-mono font-black text-[11px] px-2 py-0.5 rounded-md shrink-0">
                    {orderNum}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <Calendar size={13} className="shrink-0" />
                  <span className="truncate">Emitido: {formatDate(order.timestamp)}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
              title="Cerrar modal de detalle"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido Principal scrolleable */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Tarjeta de Datos de Registro y Cliente */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                  Información del Cliente
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  order.customer?.isRegistered || order.customer?.userType === 'Usuario Registrado'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {order.customer?.userType || (order.customer?.isRegistered ? 'Usuario Registrado' : 'No Registrado')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Cliente</span>
                    <span className="font-bold text-slate-900">{order.customer?.name || 'No especificado'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">DNI o Teléfono</span>
                    <span className="font-bold text-slate-900">{order.customer?.phone || '-'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-start gap-2">
                  <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Dirección de Entrega</span>
                    <span className="font-bold text-slate-900">{order.customer?.address || 'Retiro en Tienda / Sin Especificar'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Ítems Comprados */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Ítems del Pedido</span>
                <span className="text-slate-900 font-black">{order.items?.length || 0} productos</span>
              </h4>

              <div className="space-y-2">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-light text-primary font-black text-xs flex items-center justify-center shrink-0">
                        {item.quantity || 1}x
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate uppercase">
                          {item.name}
                        </h5>
                        <span className="text-[11px] text-slate-500 font-medium">
                          S/ {Number(item.price || 0).toFixed(2)} c/u
                        </span>
                      </div>
                    </div>
                    <div className="font-black text-sm text-slate-900 shrink-0 ml-3">
                      S/ {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen Monetario */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Monto Total de Compra</span>
                <span className="text-2xl font-black text-amber-400">
                  S/ {Number(order.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="text-right text-xs text-slate-300 space-y-0.5">
                <p>Neto: S/ {(Number(order.total || 0) / 1.18).toFixed(2)}</p>
                <p>IGV (18%): S/ {(Number(order.total || 0) - Number(order.total || 0)/1.18).toFixed(2)}</p>
              </div>
            </div>

          </div>

          {/* Pie del Modal fijo al fondo */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="btn bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Cerrar Previsualización
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

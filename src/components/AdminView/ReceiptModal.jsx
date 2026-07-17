import React from 'react';
import { X, Printer, PawPrint, MessageCircle } from 'lucide-react';

export const sendOrderReceiptViaWhatsApp = (order) => {
  if (!order) return;
  const orderNumber = order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514';
  const dateStr = order.timestamp 
    ? new Date(order.timestamp).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) 
    : 'Reciente';
  const subtotalNeto = order.total ? (order.total / 1.18).toFixed(2) : '0.00';
  const igv = order.total ? (order.total - order.total / 1.18).toFixed(2) : '0.00';
  
  const itemsText = (order.items || [])
    .map(item => `▪️ ${item.quantity || 1}x *${item.name}* : S/. ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}`)
    .join('\n');

  const message = `🐾 *PET-WEB - BOLETA ELECTRÓNICA Nº ${orderNumber}* 🐾\n` +
    `RUC: 20608971821 | Fono: (01) 435-8890\n\n` +
    `👤 *Cliente:* ${order.customer?.name || 'Cliente General'}\n` +
    `📅 *Fecha:* ${dateStr}\n` +
    `📍 *Dirección:* ${order.customer?.address || 'Retiro en Tienda'}\n\n` +
    `🛒 *DETALLE DEL PEDIDO:*\n${itemsText || 'Sin ítems'}\n\n` +
    `💰 *Subtotal Neto:* S/. ${subtotalNeto}\n` +
    `⚖️ *IGV (18%):* S/. ${igv}\n` +
    `💵 *TOTAL A PAGAR: S/. ${Number(order.total || 0).toFixed(2)}*\n\n` +
    `¡Gracias por engreír a tu mascota con nosotros! 🐶🐱\n` +
    `Conserve este comprobante electrónico.`;

  const phoneRaw = order.customer?.phone || '';
  let cleanPhone = phoneRaw.replace(/\D/g, '');
  if (cleanPhone.length === 9 && cleanPhone.startsWith('9')) {
    cleanPhone = '51' + cleanPhone;
  }
  
  const encoded = encodeURIComponent(message);
  const url = cleanPhone 
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
  
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return '17/07/2026 17:40';
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formattedDate = formatDate(order.timestamp);
  const orderNumber = order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514';
  
  const subtotalNeto = order.total ? (order.total / 1.18) : 0;
  const igv = order.total ? (order.total - subtotalNeto) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    sendOrderReceiptViaWhatsApp(order);
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      
      {/* Contenedor Compacto de la Boleta */}
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] my-auto print:shadow-none print:border-none print:max-w-full print:rounded-none">
        
        {/* Barra superior compacta (No visible al imprimir) */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-black text-xs tracking-wider uppercase">Boleta Oficial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleWhatsApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-1 rounded-md font-black text-[11px] flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
              title="Enviar boleta electrónica por WhatsApp al cliente"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </button>
            <button 
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-2.5 py-1 rounded-md font-black text-[11px] flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
              title="Imprimir boleta en impresora térmica o PDF"
            >
              <Printer size={13} />
              <span>Imprimir</span>
            </button>
            <button 
              onClick={onClose}
              className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* CUERPO TICKET VETERINARIA COMPACTO (id="printable-receipt-area" PARA AISLAMIENTO DE IMPRESIÓN) */}
        <div id="printable-receipt-area" className="p-4 md:p-5 text-slate-900 font-mono text-xs leading-tight overflow-y-auto flex-1 print:p-3 print:text-black print:overflow-visible print:max-h-none">
          
          {/* Encabezado Logo y Dirección ultra compacto */}
          <div className="text-center pb-2.5 border-b border-dashed border-slate-300 space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 text-slate-900">
              <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <PawPrint size={12} />
              </div>
              <h2 className="font-black text-xs sm:text-sm tracking-tight uppercase">
                PET-WEB TIENDA & VETERINARIA
              </h2>
            </div>
            <p className="text-[10px] text-slate-600 font-semibold">
              RUC: 20608971821 | FONO: (01) 435-8890
            </p>
            <p className="text-[10px] text-slate-500">
              Av. Javier Prado Este 4580 - Surco, Lima
            </p>
          </div>

          {/* Banner Oscuro de Boleta */}
          <div className="my-2.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg flex justify-between items-center font-black text-xs">
            <span className="uppercase text-[10px] tracking-wider text-slate-300">BOLETA ELECTRÓNICA</span>
            <span className="text-amber-400 font-mono">{orderNumber}</span>
          </div>

          {/* Datos Generales en Grid de 2 Columnas Compacto con holgura horizontal */}
          <div className="py-2.5 px-1 border-b border-dashed border-slate-300 grid grid-cols-2 gap-y-1 text-[11px] font-medium">
            <div className="flex gap-1 col-span-2 justify-between">
              <span className="text-slate-500">CLIENTE:</span>
              <span className="font-extrabold text-slate-900 uppercase truncate max-w-[190px]">
                {order.customer?.name || 'CLIENTE GENERAL'}
              </span>
            </div>
            <div className="flex gap-1 justify-between pr-2 border-r border-slate-200">
              <span className="text-slate-500">DNI/TEL:</span>
              <span className="font-bold text-slate-800">{order.customer?.phone || '-'}</span>
            </div>
            <div className="flex gap-1 justify-between pl-2">
              <span className="text-slate-500">FECHA:</span>
              <span className="font-bold text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex gap-1 col-span-2 justify-between pt-0.5">
              <span className="text-slate-500">DIRECCIÓN:</span>
              <span className="font-bold text-slate-800 uppercase truncate max-w-[190px]">
                {order.customer?.address || 'RETIRO EN LOCAL'}
              </span>
            </div>
          </div>

          {/* Cabecera de Ítems */}
          <div className="py-1.5 px-1 border-b border-slate-900 font-black text-[10px] flex justify-between tracking-wider">
            <span>DESCRIPCIÓN / PRODUCTO</span>
            <span className="text-right">CANT x P.U. = TOTAL</span>
          </div>

          {/* Lista Compacta de Productos */}
          <div className="py-2 px-1 border-b border-dashed border-slate-300 space-y-1.5 max-h-[160px] overflow-y-auto">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => {
                const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2);
                return (
                  <div key={idx} className="flex justify-between items-start text-[11px] gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-slate-900 leading-none uppercase line-clamp-1">
                        {item.name}
                      </span>
                    </div>
                    <div className="shrink-0 font-bold text-slate-700 text-right">
                      <span className="text-slate-500 font-medium">{item.quantity||1}x S/{Number(item.price||0).toFixed(0)}</span>
                      <span className="font-black text-slate-900 ml-1.5">S/ {itemTotal}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-1 text-slate-400 text-[10px]">Sin ítems</div>
            )}
          </div>

          {/* Totales y Desglose en 2 líneas */}
          <div className="py-2 px-1 border-b border-dashed border-slate-300 space-y-1 text-right text-[11px] font-medium">
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>NETO: S/ {subtotalNeto.toFixed(2)}</span>
              <span>IGV (18%): S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-xs pt-0.5">
              <span className="uppercase">TOTAL A PAGAR:</span>
              <span className="text-sm">S/ {Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Pie de Boleta Compacto */}
          <div className="pt-2.5 px-1 text-center space-y-1.5">
            <p className="font-extrabold text-[10px] tracking-wide uppercase text-slate-800">
              ¡GRACIAS POR ENGREÍR A TU MASCOTA! 🐶🐱
            </p>
            
            {/* Mini Código de Barras */}
            <div className="flex items-center justify-center gap-0.5 h-6 w-3/4 mx-auto overflow-hidden opacity-80 select-none">
              <span className="w-1 h-full bg-slate-900 inline-block" />
              <span className="w-0.5 h-full bg-slate-900 inline-block" />
              <span className="w-1.5 h-full bg-slate-900 inline-block" />
              <span className="w-0.5 h-full bg-slate-900 inline-block" />
              <span className="w-2 h-full bg-slate-900 inline-block" />
              <span className="w-1 h-full bg-slate-900 inline-block" />
              <span className="w-1.5 h-full bg-slate-900 inline-block" />
              <span className="w-0.5 h-full bg-slate-900 inline-block" />
              <span className="w-2.5 h-full bg-slate-900 inline-block" />
              <span className="w-1 h-full bg-slate-900 inline-block" />
              <span className="w-1.5 h-full bg-slate-900 inline-block" />
              <span className="w-0.5 h-full bg-slate-900 inline-block" />
              <span className="w-2 h-full bg-slate-900 inline-block" />
              <span className="w-1 h-full bg-slate-900 inline-block" />
            </div>

            <p className="text-[9px] text-slate-400 font-sans">
              Conserve su ticket. Tienda Online PET-WEB Perú.
            </p>
          </div>

        </div>

        {/* Botón inferior al cerrar (Solo pantalla) */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end shrink-0 print:hidden">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition-colors text-xs cursor-pointer"
          >
            Cerrar Boleta
          </button>
        </div>

      </div>
    </div>
  );
}

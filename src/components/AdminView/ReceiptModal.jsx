import React from 'react';
import { X, Printer, PawPrint } from 'lucide-react';

export const sendOrderReceiptViaWhatsApp = (order) => {
  const formatDateHelper = (timestamp) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const customerPhone = order.customer?.phone || '';
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const phoneToUse = cleanPhone.length >= 9 ? (cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`) : '';

  const orderNum = order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514';
  const dateStr = formatDateHelper(order.timestamp);
  const customerName = order.customer?.name || 'Cliente General';
  const subtotal = (Number(order.total || 0) / 1.18).toFixed(2);
  const igv = (Number(order.total || 0) - Number(subtotal)).toFixed(2);
  const total = Number(order.total || 0).toFixed(2);

  let itemsText = '';
  if (order.items && order.items.length > 0) {
    order.items.forEach((item, idx) => {
      const qty = item.quantity || 1;
      const price = Number(item.price || 0);
      const itemTotal = (qty * price).toFixed(2);
      itemsText += `${idx + 1}. *${item.name}* (x${qty}) - S/ ${itemTotal}\n`;
    });
  } else {
    itemsText = 'Sin ítems especificados\n';
  }

  const message = `*🐾 PET-WEB - BOLETA DE VENTA ELECTRÓNICA 📄*\n` +
    `-----------------------------------------\n` +
    `*Boleta N°:* ${orderNum}\n` +
    `*Fecha:* ${dateStr}\n` +
    `*Cliente:* ${customerName}\n` +
    `-----------------------------------------\n` +
    `*DETALLE DEL PEDIDO:*\n${itemsText}` +
    `-----------------------------------------\n` +
    `Op. Gravada (Neto): S/ ${subtotal}\n` +
    `IGV (18%): S/ ${igv}\n` +
    `*TOTAL PAGADO: S/ ${total}*\n` +
    `-----------------------------------------\n` +
    `🐶 ¡Muchas gracias por engreír a tu mascota con nosotros! Cualquier consulta estamos a tu disposición. ✨`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = phoneToUse
    ? `https://api.whatsapp.com/send?phone=${phoneToUse}&text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};

export default function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderNumber = order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514';
  const subtotalNeto = order.total ? (order.total / 1.18) : 0;
  const igv = order.total ? (order.total - subtotalNeto) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 sm:py-8 print:p-0 print:block">
        
        {/* Contenedor Compacto de la Boleta */}
        <div className="bg-white max-w-[430px] sm:max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] text-left print:max-h-none print:shadow-none print:border-none print:max-w-full print:rounded-none animate-zoom-in">
          
          {/* Barra superior compacta (No visible al imprimir) */}
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-xs tracking-wider uppercase">Boleta Oficial</span>
            </div>
            <div className="flex items-center gap-1.5">
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
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="Cerrar boleta"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* CUERPO TICKET VETERINARIA COMPACTO (id="printable-receipt-area" PARA AISLAMIENTO DE IMPRESIÓN) */}
          <div id="printable-receipt-area" className="p-4 md:p-5 text-slate-900 font-mono text-xs leading-tight overflow-y-auto flex-1 print:p-3 print:text-black print:overflow-visible print:max-h-none">
            
            {/* Encabezado Logo y Dirección ultra compacto */}
            <div className="text-center pb-2.5 border-b border-dashed border-slate-300 space-y-0.5">
              <div className="flex items-center justify-center gap-1">
                <div className="w-5 h-5 rounded-md bg-slate-900 text-amber-400 flex items-center justify-center font-black text-[10px]">
                  <PawPrint size={12} />
                </div>
                <h2 className="font-black text-base text-slate-900 uppercase tracking-tight">PET-WEB</h2>
              </div>
              <p className="text-[10px] text-slate-600 font-bold">RUC: 20601234567 • VETERINARIA & TIENDA</p>
              <p className="text-[10px] text-slate-500">Av. Las Mascotas 123 - Lima, Perú • Tel: (01) 555-0199</p>
            </div>

            {/* Datos del Ticket */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">BOLETA:</span>
                <span className="text-slate-900 font-black">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FECHA:</span>
                <span className="text-slate-900">{formatDate(order.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CAJERO:</span>
                <span className="text-slate-900 font-bold">ADMIN / SISTEMA</span>
              </div>
            </div>

            {/* Datos del Cliente y Registro */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">TIPO USER:</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                  order.customer?.isRegistered || order.customer?.userType === 'Usuario Registrado'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.customer?.userType || (order.customer?.isRegistered ? 'Usuario Registrado' : 'No Registrado')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CLIENTE:</span>
                <span className="text-slate-900 font-bold text-right truncate max-w-[240px] uppercase">
                  {order.customer?.name || 'CLIENTE GENERAL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI/TEL:</span>
                <span className="text-slate-900 font-bold">{order.customer?.phone || '00000000'}</span>
              </div>
              {order.customer?.address && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 shrink-0 mr-1">DIRECCIÓN:</span>
                  <span className="text-slate-800 text-right truncate max-w-[230px]">{order.customer.address}</span>
                </div>
              )}
            </div>

            {/* Tabla de Productos Compacta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] text-slate-400 pb-1 border-b border-slate-100">
                <span>DESCRIPCIÓN</span>
                <span>TOTAL</span>
              </div>
              
              <div className="space-y-1.5">
                {order.items && order.items.map((item, idx) => {
                  const qty = item.quantity || 1;
                  const price = Number(item.price || 0);
                  const itemTotal = qty * price;
                  return (
                    <div key={idx} className="flex justify-between items-start gap-3 text-[10.5px] leading-snug py-0.5">
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="font-bold text-slate-900 block break-words whitespace-normal uppercase">
                          {qty}x {item.name}
                        </span>
                        <span className="text-[9.5px] text-slate-500 block">
                          P.Unit: S/ {price.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 shrink-0 text-right whitespace-nowrap">
                        S/ {itemTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totales y Desglose Financiero */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>OP. GRAVADA (NETO):</span>
                <span>S/ {subtotalNeto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>IGV (18%):</span>
                <span>S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Pie del Ticket / Código de Barras */}
            <div className="pt-3 text-center space-y-1.5">
              <p className="font-bold text-[10px] text-slate-600 uppercase">¡Gracias por cuidar de tu mascota con nosotros!</p>
              
              {/* Mini Código de Barras visual */}
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

              <div className="bg-slate-900 text-white py-1 px-3 rounded text-[9px] font-mono tracking-widest inline-block uppercase">
                * * {orderNumber} * *
              </div>
              <p className="text-[9px] text-slate-400 font-sans">Representación impresa de la Boleta de Venta Electrónica</p>
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
    </div>
  );
}

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

  const orderNum = order.boletaNumber || (order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514');
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

  const orderNumber = order.boletaNumber || (order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514');
  const subtotalNeto = order.total ? (order.total / 1.18) : 0;
  const igv = order.total ? (order.total - subtotalNeto) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 sm:py-8 print:p-0 print:block">
        
        {/* Contenedor Compacto de la Boleta */}
        <div className="bg-white max-w-[480px] w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] text-left print:max-h-none print:shadow-none print:border-none print:max-w-full print:rounded-none animate-zoom-in">
          
          {/* Barra superior estilo oficial (BOLETA OFICIAL + Botón WhatsApp + Botón Imprimir + X) */}
          <div className="bg-slate-950 text-white px-4 py-3 flex items-center justify-between shrink-0 print:hidden gap-2">
            <span className="font-black text-sm tracking-wider uppercase text-white">BOLETA OFICIAL</span>
            
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handlePrint}
                className="bg-[#FFC107] hover:bg-[#ffb300] text-slate-950 px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title="Imprimir boleta en impresora térmica o PDF"
              >
                <Printer size={14} />
                <span>Imprimir</span>
              </button>

              <button 
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="Cerrar boleta"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* CUERPO TICKET VETERINARIA COMPACTO CON RECUADROS PUNTEADOS */}
          <div id="printable-receipt-area" className="p-3 sm:p-4.5 text-slate-900 font-mono text-xs leading-tight overflow-y-auto flex-1 print:p-2 print:text-black print:overflow-visible print:max-h-none space-y-2.5 bg-slate-50/40">
            
            {/* Recuadro 1: Encabezado Logo y Dirección */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-3 text-center bg-white shadow-2xs space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-slate-900 text-amber-400 flex items-center justify-center font-black text-[10px]">
                  <PawPrint size={12} />
                </div>
                <h2 className="font-black text-base text-slate-900 uppercase tracking-tight">PET-WEB</h2>
              </div>
              <p className="text-[10.5px] text-slate-700 font-bold">RUC: 20601234567 • VETERINARIA & TIENDA</p>
              <p className="text-[10px] text-slate-500">Av. Las Mascotas 123 - Lima, Perú • Tel: (01) 555-0199</p>
            </div>

            {/* Recuadro 2: Datos del Ticket */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-3 bg-white shadow-2xs space-y-1.5 text-[11px]">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">BOLETA:</span>
                <span className="text-slate-900 font-black">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FECHA:</span>
                <span className="text-slate-900 font-semibold">{formatDate(order.timestamp || order.createdAt || order.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CAJERO:</span>
                <span className="text-slate-900 font-bold">ADMIN / SISTEMA</span>
              </div>
            </div>

            {/* Recuadro 3: Datos del Cliente y Registro */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-3 bg-white shadow-2xs space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">TIPO USER:</span>
                <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase ${
                  order.customer?.isRegistered || order.customer?.userType === 'Usuario Registrado' || order.customer?.userType === 'Registrado'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {(order.customer?.isRegistered || order.customer?.userType === 'Usuario Registrado' || order.customer?.userType === 'Registrado') ? 'REGISTRADO' : 'NO REGISTRADO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CLIENTE:</span>
                <span className="text-slate-900 font-bold text-right truncate max-w-[230px] uppercase">
                  {order.customer?.name || 'CLIENTE GENERAL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI/TEL:</span>
                <span className="text-slate-900 font-bold">{order.customer?.phone || '00000000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ENTREGA:</span>
                <span className="text-slate-900 font-bold uppercase">
                  {order.customer?.deliveryMethod === 'recojo' || order.customer?.deliveryType === 'Recojo en tienda'
                    ? 'Recojo en tienda'
                    : 'Delivery a domicilio'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ESTADO PAGO:</span>
                <span className={`font-black uppercase ${
                  order.paymentStatus === 'Pago' ? 'text-emerald-700' : order.paymentStatus === 'No pago' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {order.paymentStatus || 'Pendiente de pago'}
                </span>
              </div>
              {order.customer?.address && (
                <div className="flex justify-between text-[10.5px]">
                  <span className="text-slate-500 shrink-0 mr-1">DIRECCIÓN:</span>
                  <span className="text-slate-800 font-semibold text-right truncate max-w-[220px] uppercase">{order.customer.address}</span>
                </div>
              )}
            </div>

            {/* Recuadro 4: Tabla de Productos */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-3 bg-white shadow-2xs space-y-2">
              <div className="flex justify-between font-bold text-[10.5px] text-slate-400 pb-1.5 border-b border-slate-200">
                <span>DESCRIPCIÓN</span>
                <span>TOTAL</span>
              </div>
              
              <div className="space-y-2">
                {order.items && order.items.map((item, idx) => {
                  const qty = item.quantity || 1;
                  const price = Number(item.price || 0);
                  const itemTotal = qty * price;
                  return (
                    <div key={idx} className="flex justify-between items-start gap-3 text-[11px] leading-snug py-0.5">
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="font-black text-slate-900 block break-words whitespace-normal uppercase">
                          {qty}X {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
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

            {/* Recuadro 5: Totales y Desglose Financiero */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-3 bg-white shadow-2xs space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 text-[11px] font-semibold">
                <span>OP. GRAVADA (NETO):</span>
                <span className="text-slate-800">S/ {subtotalNeto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] font-semibold">
                <span>IGV (18%):</span>
                <span className="text-slate-800">S/ {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm sm:text-base text-slate-950 pt-1.5 border-t border-slate-200">
                <span>TOTAL A PAGAR:</span>
                <span>S/ {Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Pie del Ticket / Código de Barras */}
            <div className="pt-2 text-center space-y-2">
              <p className="font-bold text-[10.5px] text-slate-600 uppercase">¡GRACIAS POR CUIDAR DE TU MASCOTA CON NOSOTROS!</p>
              
              {/* Representación de Código de Barras Visual */}
              <div className="bg-slate-900 text-white py-2 px-6 rounded-xl font-mono font-black tracking-widest text-xs inline-block uppercase shadow-md">
                * * {orderNumber} * *
              </div>
              <p className="text-[9.5px] text-slate-400 font-sans block">Representación impresa de la Boleta de Venta</p>
            </div>

          </div>

          {/* Botón inferior al cerrar (Solo pantalla) */}
          <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end shrink-0 print:hidden">
            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors text-xs cursor-pointer shadow-sm"
            >
              Cerrar Boleta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

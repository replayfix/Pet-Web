import React, { useState, useEffect } from 'react';
import { subscribeOrders, deleteOrderAndRestoreStock, updateOrderPaymentStatus } from '../../firebase/dbService';
import ReceiptModal, { sendOrderReceiptViaWhatsApp } from './ReceiptModal';
import OrderDetailsModal from './OrderDetailsModal';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import { 
  FileText, 
  Printer, 
  Trash2, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Eye,
  RotateCcw,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';

export default function OrdersDashboard({ searchQuery }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [selectedOrderForPreview, setSelectedOrderForPreview] = useState(null); // Botón 1
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null); // Botón 2
  const [orderToDelete, setOrderToDelete] = useState(null); // Botón 3

  const [localSearch, setLocalSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const unsubscribe = subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleDeleteAndRestoreConfirmed = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrderAndRestoreStock(orderToDelete);
      setOrderToDelete(null);
    } catch (error) {
      alert('Hubo un error al eliminar y restaurar el stock.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus, orderObject) => {
    try {
      await updateOrderPaymentStatus(orderId, newStatus, orderObject);
    } catch (error) {
      if (error.message && error.message.startsWith("INSUFFICIENT_STOCK:")) {
        const parts = error.message.split(":");
        const details = parts[1] || "";
        const [prodName, available, required] = details.split("|");
        alert(`❌ ALERTA DE STOCK INSUFICIENTE\n\nNo se puede confirmar el pedido como "${newStatus}" porque no hay suficiente inventario en almacén:\n\n▪️ Producto: ${prodName}\n▪️ ${available}\n▪️ ${required}\n\nPor favor, ajusta el stock en el almacén o contacta al cliente antes de confirmar.`);
      } else {
        alert(error.message || 'Error al actualizar el estado de pago en la base de datos.');
      }
    }
  };

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

  const activeSearch = (searchQuery || localSearch || '').toLowerCase();
  const filteredOrders = orders.filter(o => {
    if (!activeSearch) return true;
    const customerName = (o.customer?.name || '').toLowerCase();
    const customerPhone = (o.customer?.phone || '').toLowerCase();
    const customerAddress = (o.customer?.address || '').toLowerCase();
    const orderId = (o.id || '').toLowerCase();
    const userType = (o.customer?.userType || '').toLowerCase();
    const itemsNames = (o.items || []).map(i => i.name.toLowerCase()).join(' ');
    
    return customerName.includes(activeSearch) ||
           customerPhone.includes(activeSearch) ||
           customerAddress.includes(activeSearch) ||
           orderId.includes(activeSearch) ||
           userType.includes(activeSearch) ||
           itemsNames.includes(activeSearch);
  });

  useEffect(() => {
    setVisibleCount(5);
  }, [activeSearch]);

  const displayedOrders = filteredOrders.slice(0, visibleCount);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + (o.items || []).reduce((s, i) => s + Number(i.quantity || 1), 0), 0);

  return (
    <div className="py-6 space-y-6 animate-fade-in">
      
      {/* Banner de Cabecera y Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Órdenes Totales</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Ingresos Generados</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">S/ {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Productos Vendidos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalItemsSold} unds</h3>
          </div>
        </div>

      </div>

      {/* Barra de búsqueda interna y Filtro */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex items-center flex-1 w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Buscar por cliente, DNI, teléfono, tipo de usuario o boleta..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Mostrando</span>
          <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md font-mono font-black">{displayedOrders.length}</span>
          <span>de {filteredOrders.length} pedidos</span>
        </div>
      </div>

      {/* TABLA ORDENADA POR COLUMNAS CON LOS DATOS Y LOS 3 BOTONES */}
      {/* TABLA ORDENADA POR COLUMNAS CON LOS DATOS Y LOS 3 BOTONES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm orders-table-container">
        <table className="orders-table-fixed w-full">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider orders-table-row">
              <th className="py-3 px-3.5 text-left align-middle w-[12%] truncate" title="ID / Boleta">ID / Boleta</th>
              <th className="py-3 px-3.5 text-left align-middle w-[14%] truncate" title="Cliente / Registro">Cliente / Reg.</th>
              <th className="py-3 px-3.5 text-left align-middle w-[11%] truncate" title="DNI o Teléfono">Teléfono</th>
              <th className="py-3 px-3.5 text-left align-middle w-[14%] truncate" title="Entrega / Dirección">Entrega / Dir.</th>
              <th className="py-3 px-3 text-center align-middle w-[7%] truncate" title="Ítems">Ítems</th>
              <th className="py-3 px-3.5 text-right align-middle w-[10%] truncate" title="Total Pago">Total Pago</th>
              <th className="py-3 px-3 text-center align-middle w-[11%] truncate" title="Estado de Pago">Estado</th>
              <th className="py-3 px-3 text-center align-middle w-[21%] truncate" title="Acciones Rápidas (4 Botones)">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {loading ? (
              <tr className="orders-table-row">
                <td colSpan="8" className="orders-table-cell text-center py-16 align-middle">
                  <Clock size={32} className="mx-auto text-primary animate-spin mb-2" />
                  <p className="font-bold text-slate-500">Cargando tabla de órdenes...</p>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr className="orders-table-row">
                <td colSpan="8" className="orders-table-cell text-center py-16 space-y-2 align-middle">
                  <ShoppingBag size={36} className="mx-auto text-slate-300" />
                  <p className="font-extrabold text-slate-700 text-sm">No hay órdenes registradas en este momento</p>
                  <p className="text-slate-400 text-xs">Las compras realizadas en el carrito aparecerán aquí listadas en orden real.</p>
                </td>
              </tr>
            ) : (
              displayedOrders.map((order) => {
                const orderNum = order.boletaNumber || (order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514');
                const isRegistered = order.customer?.isRegistered || order.customer?.userType === 'Usuario Registrado' || order.customer?.userType === 'Registrado';
                const customerName = order.customer?.name || 'No Registrado';
                const totalItemsCount = (order.items || []).reduce((acc, i) => acc + Number(i.quantity || 1), 0);

                return (
                  <tr key={order.id} className="orders-table-row hover:bg-slate-50/80 transition-colors">
                    
                    {/* Columna 1: ID y Fecha */}
                    <td className="orders-table-cell text-left px-3.5 align-middle whitespace-nowrap">
                      <div className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg inline-block text-xs border border-slate-200">
                        {orderNum}
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                        <Calendar size={12} className="shrink-0" />
                        <span className="truncate">{formatDate(order.timestamp)}</span>
                      </div>
                    </td>

                    {/* Columna 2: Cliente y Badge de Registro */}
                    <td className="orders-table-cell text-left px-3.5 align-middle">
                      <div className="font-black text-slate-900 text-sm uppercase truncate" title={customerName}>
                        {customerName}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase truncate ${
                          isRegistered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <User size={10} className="shrink-0" />
                          <span className="truncate">{isRegistered ? 'Registrado' : 'No Registrado'}</span>
                        </span>
                      </div>
                    </td>

                    {/* Columna 3: DNI / Teléfono */}
                    <td className="orders-table-cell text-left px-3.5 align-middle font-mono font-bold text-slate-800 truncate" title={order.customer?.phone || '-'}>
                      {order.customer?.phone || '-'}
                    </td>

                    {/* Columna 4: Entrega / Dirección */}
                    <td className="orders-table-cell text-left px-3.5 align-middle">
                      <div className="flex items-center gap-1 mb-1">
                        {order.customer?.deliveryMethod === 'recojo' || order.customer?.deliveryType === 'Recojo en tienda' ? (
                          <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider truncate">
                            🏬 Recojo en tienda
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider truncate">
                            🛵 Delivery
                          </span>
                        )}
                      </div>
                      <span className="truncate block font-semibold text-slate-600 text-xs" title={order.customer?.address || 'Retiro en Tienda'}>
                        {order.customer?.address || 'Sin dirección registrada (Retiro)'}
                      </span>
                    </td>

                    {/* Columna 5: Resumen de Ítems */}
                    <td className="orders-table-cell text-center align-middle whitespace-nowrap px-2">
                      <span className="bg-primary/10 text-primary font-black px-2 py-1 rounded-xl text-xs border border-primary/20">
                        {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
                      </span>
                    </td>

                    {/* Columna 6: Total Pagado */}
                    <td className="orders-table-cell text-right align-middle whitespace-nowrap px-3.5">
                      <span className="font-black text-slate-900 text-sm font-mono">
                        S/ {Number(order.total || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Columna 7: Estado de Pago */}
                    <td className="orders-table-cell text-center align-middle px-2">
                      <select
                        value={order.paymentStatus || 'Pendiente de pago'}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value, order)}
                        className={`w-full px-2 py-1.5 rounded-full text-xs font-black cursor-pointer border outline-none transition-all shadow-xs truncate ${
                          order.paymentStatus === 'Pago' || order.paymentStatus === 'Pagado'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : order.paymentStatus === 'No pago' || order.paymentStatus === 'No pagado'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        <option value="Pendiente de pago" className="bg-white text-amber-800 font-bold">⏳ Pendiente</option>
                        <option value="Pago" className="bg-white text-emerald-800 font-bold">✅ Pago</option>
                        <option value="No pago" className="bg-white text-rose-800 font-bold">❌ No pago</option>
                      </select>
                    </td>

                    {/* Columna 8: LOS 4 BOTONES DE ACCIÓN RÁPIDA */}
                    <td className="orders-table-cell text-center align-middle px-2">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        
                        {/* BOTÓN 1: Previsualización */}
                        <button
                          onClick={() => setSelectedOrderForPreview(order)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all border border-slate-200 cursor-pointer shadow-2xs hover:scale-105"
                          title="Previsualizar detalles de los productos comprados"
                        >
                          <Eye size={13} className="text-primary shrink-0" />
                          <span>Detalle</span>
                        </button>

                        {/* BOTÓN 2: Ver Boleta */}
                        <button
                          onClick={() => setSelectedOrderForReceipt(order)}
                          className="bg-primary hover:bg-primary-dark text-white font-black text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:scale-105"
                          title="Ver boleta electrónica oficial emitida"
                        >
                          <Printer size={13} className="shrink-0" />
                          <span>Boleta</span>
                        </button>

                        {/* BOTÓN 3: WhatsApp */}
                        <button
                          onClick={() => sendOrderReceiptViaWhatsApp(order)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:scale-105"
                          title="Enviar resumen y boleta electrónica directamente por WhatsApp al cliente"
                        >
                          <MessageCircle size={13} className="shrink-0" />
                          <span>WhatsApp</span>
                        </button>

                        {/* BOTÓN 4: Restaurar Stock */}
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold text-[11px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all border border-red-200 cursor-pointer shadow-2xs hover:scale-105"
                          title="Eliminar orden y devolver cantidades al stock del inventario"
                        >
                          <RotateCcw size={13} className="shrink-0" />
                          <span>Restaurar</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* BOTÓN CARGAR MÁS (Paginación progresiva de 5 en 5) */}
        {filteredOrders.length > visibleCount && (
          <div className="py-6 px-4 text-center bg-slate-50/70 border-t border-slate-200 flex flex-col items-center justify-center space-y-2.5">
            <button
              type="button"
              onClick={() => setVisibleCount(prev => prev + 5)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Cargar más</span>
              <span className="bg-primary px-2 py-0.5 rounded-md text-[10px] font-black">+{Math.min(5, filteredOrders.length - visibleCount)} siguientes</span>
            </button>
            <span className="text-[11px] font-bold text-slate-400">
              Mostrando los primeros {displayedOrders.length} de {filteredOrders.length} pedidos
            </span>
          </div>
        )}
      </div>

      {/* MODAL BOTÓN 1: PREVISUALIZACIÓN DE DETALLES Y PRODUCTOS COMPRADOS */}
      <OrderDetailsModal 
        isOpen={Boolean(selectedOrderForPreview)}
        onClose={() => setSelectedOrderForPreview(null)}
        order={selectedOrderForPreview}
      />

      {/* MODAL BOTÓN 2: BOLETA ELECTRÓNICA OFICIAL CON MODO IMPRESIÓN */}
      <ReceiptModal 
        isOpen={Boolean(selectedOrderForReceipt)}
        onClose={() => setSelectedOrderForReceipt(null)}
        order={selectedOrderForReceipt}
      />

      {/* MODAL BOTÓN 3: CONFIRMACIÓN PARA ELIMINAR Y DEVOLVER STOCK AL INVENTARIO */}
      <ConfirmDeleteModal 
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDeleteAndRestoreConfirmed}
        title="¿Eliminar Orden y Devolver Stock al Almacén?"
        message={orderToDelete ? `Estás a punto de eliminar la boleta ${orderToDelete.id ? 'B001-' + orderToDelete.id.slice(-6).toUpperCase() : ''} del cliente "${orderToDelete.customer?.name || 'No Registrado'}".\n\n🟢 PROTECCIÓN DE STOCK: Al confirmar, se devolverán automáticamente al inventario los ${orderToDelete.items?.reduce((a,b)=>a+Number(b.quantity||1),0) || 0} ítems de esta orden para que no sigan descontando ni causen problemas de stock.` : ''}
        isDeleting={isDeleting}
      />

    </div>
  );
}

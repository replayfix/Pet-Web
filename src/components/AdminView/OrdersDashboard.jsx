import React, { useState, useEffect } from 'react';
import { subscribeOrders, deleteOrderAndRestoreStock } from '../../firebase/dbService';
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
          <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md font-mono font-black">{filteredOrders.length}</span>
          <span>de {orders.length} pedidos</span>
        </div>
      </div>

      {/* TABLA ORDENADA POR COLUMNAS CON LOS DATOS Y LOS 3 BOTONES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-5">ID / Boleta</th>
                <th className="py-4 px-5">Cliente / Registro</th>
                <th className="py-4 px-5">DNI o Teléfono</th>
                <th className="py-4 px-5">Dirección</th>
                <th className="py-4 px-5">Ítems</th>
                <th className="py-4 px-5 text-right">Total Pago</th>
                <th className="py-4 px-5 text-center min-w-[340px]">Acciones Rápidas (4 Botones)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <Clock size={32} className="mx-auto text-primary animate-spin mb-2" />
                    <p className="font-bold text-slate-500">Cargando tabla de órdenes...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 space-y-2">
                    <ShoppingBag size={36} className="mx-auto text-slate-300" />
                    <p className="font-extrabold text-slate-700 text-sm">No hay órdenes registradas en este momento</p>
                    <p className="text-slate-400 text-xs">Las compras realizadas en el carrito aparecerán aquí listadas en orden real.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const orderNum = order.id ? `B001-${order.id.slice(-6).toUpperCase()}` : 'B001-053514';
                  const isRegistered = order.customer?.isRegistered || order.customer?.userType === 'Usuario Registrado';
                  const customerName = order.customer?.name || 'No Registrado';
                  const totalItemsCount = (order.items || []).reduce((acc, i) => acc + Number(i.quantity || 1), 0);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Columna 1: ID y Fecha */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg inline-block text-xs border border-slate-200">
                          {orderNum}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatDate(order.timestamp)}</span>
                        </div>
                      </td>

                      {/* Columna 2: Cliente y Badge de Registro */}
                      <td className="py-4 px-5">
                        <div className="font-black text-slate-900 text-sm uppercase">
                          {customerName}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isRegistered
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            <User size={10} />
                            <span>{order.customer?.userType || (isRegistered ? 'Usuario Registrado' : 'No Registrado')}</span>
                          </span>
                        </div>
                      </td>

                      {/* Columna 3: DNI / Teléfono */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-800">
                        {order.customer?.phone || '-'}
                      </td>

                      {/* Columna 4: Dirección */}
                      <td className="py-4 px-5 max-w-[220px]">
                        <span className="truncate block font-semibold text-slate-600" title={order.customer?.address || 'Retiro en Tienda'}>
                          {order.customer?.address || 'Retiro en Tienda'}
                        </span>
                      </td>

                      {/* Columna 5: Resumen de Ítems */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="bg-primary/10 text-primary font-black px-2.5 py-1 rounded-xl text-xs border border-primary/20">
                          {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
                        </span>
                      </td>

                      {/* Columna 6: Total Pagado */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <span className="font-black text-slate-900 text-sm font-mono">
                          S/ {Number(order.total || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Columna 7: LOS 4 BOTONES DE ACCIÓN RÁPIDA */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          
                          {/* BOTÓN 1: Previsualización */}
                          <button
                            onClick={() => setSelectedOrderForPreview(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all border border-slate-200 cursor-pointer shadow-2xs hover:scale-105"
                            title="Previsualizar detalles de los productos comprados"
                          >
                            <Eye size={14} className="text-primary" />
                            <span>Detalle</span>
                          </button>

                          {/* BOTÓN 2: Ver Boleta */}
                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="bg-primary hover:bg-primary-dark text-white font-black text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:scale-105"
                            title="Ver boleta electrónica oficial emitida"
                          >
                            <Printer size={14} />
                            <span>Boleta</span>
                          </button>

                          {/* BOTÓN 3: WhatsApp */}
                          <button
                            onClick={() => sendOrderReceiptViaWhatsApp(order)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-sm cursor-pointer hover:scale-105"
                            title="Enviar resumen y boleta electrónica directamente por WhatsApp al cliente"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </button>

                          {/* BOTÓN 4: Restaurar Stock */}
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all border border-red-200 cursor-pointer shadow-2xs hover:scale-105"
                            title="Eliminar orden y devolver cantidades al stock del inventario"
                          >
                            <RotateCcw size={14} />
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
        </div>
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

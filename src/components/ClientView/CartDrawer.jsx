import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../firebase/dbService';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle, 
  Truck,
  Sparkles
} from 'lucide-react';

const WhatsAppIcon = ({ size = 22, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalPrice,
    totalItems
  } = useCart();
  const { currentUser, userProfile, userAddresses } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'form' | 'success'
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [useSavedProfile, setUseSavedProfile] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('recojo'); // 'recojo' | 'delivery'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);

  // Cargar y mantener sincronizados los datos del cliente logueado
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      const fullName = [userProfile?.nombre, userProfile?.apellido].filter(Boolean).join(' ').trim() || currentUser.name || '';
      const phoneOrDni = userProfile?.telefono || userProfile?.documento || '';
      
      const primaryAddrObj = userAddresses && userAddresses.length > 0
        ? (userAddresses.find(a => a.esPrincipal) || userAddresses[0])
        : null;
      
      const addrStr = primaryAddrObj
        ? `${primaryAddrObj.direccionExacta || ''}, ${primaryAddrObj.distrito || ''}, ${primaryAddrObj.provincia || ''}`
            .replace(/^[,\s]+|[,\s]+$/g, '')
            .replace(/,\s*,/g, ', ')
        : (userProfile?.direccion || '');
      
      setCustomer(prev => ({
        name: prev.name || fullName,
        phone: prev.phone || phoneOrDni,
        address: prev.address || addrStr
      }));
    }
  }, [currentUser, userProfile, userAddresses, isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) return;

    setIsSubmitting(true);
    try {
      const finalShipping = deliveryMethod === 'recojo' ? 0 : (missingForFreeShipping === 0 ? 0 : 10);
      const finalTotal = totalPrice + finalShipping;

      const customerData = {
        ...customer,
        isRegistered: Boolean(currentUser),
        userType: currentUser ? 'Registrado' : 'No Registrado',
        email: currentUser?.email || 'Sin correo registrado',
        deliveryMethod: deliveryMethod,
        deliveryType: deliveryMethod === 'recojo' ? 'Recojo en tienda' : 'Delivery a Domicilio',
        shippingCost: finalShipping,
        paymentStatus: 'Pendiente de pago'
      };
      const orderId = await createOrder(customerData, cartItems, finalTotal);
      setLastOrderId(orderId);
      clearCart();
      setCheckoutStep('success');
    } catch (error) {
      alert('Hubo un error al procesar el pedido. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setCheckoutStep('cart');
      setCustomer({ name: '', phone: '', address: '' });
      setUseSavedProfile(true);
      setDeliveryMethod('recojo');
    }, 300);
  };

  const handleWhatsAppRedirect = () => {
    if (cartItems.length === 0) return;
    const itemsList = cartItems
      .map((item) => `▪️ *${item.name}* (x${item.quantity}) : S/. ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = `🐾 *Hola Pet-Web* 🐾\nEstoy interesado en estos articulos:\n${itemsList}\n\n💰 *Subtotal cesta: S/. ${totalPrice.toFixed(2)}*\n\n¡Quisiera más información con respecto a los productos.! 🐶🐱`;
    
    const phoneNumber = "51906023358"; // Número de consulta WhatsApp del encargado (Perú)
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  const freeShippingThreshold = 99;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  return (
    <div className="drawer-overlay animate-fade-in">
      <div className="drawer-content flex flex-col justify-between p-6">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-black shrink-0">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span 
                  className="vtex-minicart-2-x-minicartQuantityBadge absolute rounded-full bg-red-600 text-white font-bold flex justify-center items-center shadow-sm select-none z-10"
                  style={{
                    width: '18px',
                    height: '18px',
                    top: '-4px',
                    right: '-4px',
                    fontSize: '11px',
                    lineHeight: '1',
                    userSelect: 'none'
                  }}
                >
                  {totalItems}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 leading-none">Mi Carrito Pet.Web</h3>
              <span className="text-xs text-slate-400 font-medium">Sincronizado con almacén</span>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {checkoutStep === 'cart' && (
            <>
              {/* Barra de envío gratis */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3 text-xs">
                <Truck size={20} className="text-primary shrink-0" />
                <div>
                  {missingForFreeShipping === 0 ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      🎉 ¡Felicidades! Tienes Envío GRATIS en todo el Perú.
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      Agrega <strong className="text-primary">S/ {missingForFreeShipping.toFixed(2)}</strong> más para obtener <strong className="text-slate-800">Envío Gratis</strong>.
                    </span>
                  )}
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag size={32} />
                  </div>
                  <h4 className="font-bold text-base text-slate-700">Tu carrito está vacío</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Explora nuestro catálogo de comida, accesorios y medicinas con stock verificado en vivo.
                  </p>
                  <button 
                    onClick={resetAndClose}
                    className="btn btn-outline text-xs mt-2"
                  >
                    Volver a la tienda
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-3.5 p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all relative group"
                    >
                      {/* Imagen del producto */}
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-16 h-16 object-contain bg-white rounded-xl p-1.5 border border-slate-100 shrink-0 shadow-xs"
                      />

                      {/* Información y Controles (Apilados verticalmente para evitar amontonamiento) */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                        
                        {/* Fila Superior: Nombre y Botón Eliminar */}
                        <div className="flex items-start justify-between gap-2 pr-1">
                          <h5 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug line-clamp-2" title={item.name}>
                            {item.name}
                          </h5>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors shrink-0 -mt-1 -mr-1 cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Fila Inferior: Precios a la izquierda y Control de Cantidad (debajo/al lado) */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70">
                          {/* Precios */}
                          <div>
                            <div className="font-black text-sm text-primary">
                              S/ {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              S/ {item.price.toFixed(2)} c/u
                            </div>
                          </div>

                          {/* Control de cantidad amplio y respirable */}
                          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-1 shadow-xs shrink-0">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors cursor-pointer"
                              title="Restar unidad"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-extrabold text-xs text-slate-900 select-none">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-primary disabled:opacity-30 transition-colors cursor-pointer"
                              title="Sumar unidad"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'form' && (() => {
            const isClientLoggedIn = Boolean(currentUser && currentUser.role !== 'admin');
            const isProfileComplete = Boolean(isClientLoggedIn && customer.name && customer.phone);

            return (
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs">
                  ⚡ <strong>Demostración en Tiempo Real:</strong> Al confirmar esta compra, Firebase rebajará automáticamente las cantidades exactas del inventario del almacén.
                </div>

                {isProfileComplete && useSavedProfile ? (
                  <div className="bg-white border-2 border-primary/40 rounded-2xl p-5 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                          ✓
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                            Información de Entrega y Contacto
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Datos de tu perfil listos para procesar
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseSavedProfile(false)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer bg-primary-light px-2.5 py-1 rounded-lg transition-colors"
                        title="Editar o cambiar datos para este pedido"
                      >
                        Cambiar datos
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Cliente:</span>
                        <span className="font-extrabold text-slate-900 text-sm">{customer.name}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500 font-medium">Teléfono / DNI:</span>
                        <span className="font-extrabold text-slate-900">{customer.phone}</span>
                      </div>
                      <div className="flex items-start justify-between border-t border-slate-100 pt-2 gap-2">
                        <span className="text-slate-500 font-medium shrink-0 mt-0.5">Dirección:</span>
                        {userAddresses && userAddresses.length > 1 ? (
                          <select
                            value={customer.address}
                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                            className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary max-w-[220px] shadow-2xs"
                          >
                            {userAddresses.map((addr, i) => {
                              const addrStr = `${addr.direccionExacta || ''}, ${addr.distrito || ''}, ${addr.provincia || ''}`.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,\s*,/g, ', ');
                              return (
                                <option key={i} value={addrStr}>
                                  {addrStr || `Dirección #${i + 1}`}
                                </option>
                              );
                            })}
                            <option value="Retiro en Tienda / Sin Especificar">Retiro en Tienda / Sin Especificar</option>
                          </select>
                        ) : (
                          <span className="font-bold text-slate-900 text-right break-words max-w-[220px]">
                            {customer.address || 'Retiro en Tienda / Sin Especificar'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500 font-medium">Correo Electrónico:</span>
                        <span className="font-medium text-slate-600 truncate max-w-[200px]">
                          {currentUser?.email || 'Sin correo registrado'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Tus datos completos se utilizarán automáticamente al presionar <strong>Confirmar y Descontar Almacén</strong>.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {isProfileComplete && !useSavedProfile && (
                      <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl">
                        <span className="text-xs font-medium text-slate-600">Editando datos para este pedido</span>
                        <button
                          type="button"
                          onClick={() => setUseSavedProfile(true)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          ← Volver a usar datos guardados
                        </button>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Nombre del Cliente *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Jonathan Pérez"
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        className="form-input text-sm"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Teléfono o DNI *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. 987654321 / 45678912"
                        value={customer.phone}
                        onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        className="form-input text-sm"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dirección de Entrega</label>
                      <input 
                        type="text" 
                        placeholder="Av. Javier Prado 1234, Lima..."
                        value={customer.address}
                        onChange={(e) => setCustomer({...customer, address: e.target.value})}
                        className="form-input text-sm"
                      />
                    </div>
                  </>
                )}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-extrabold text-xs text-slate-800 block">
                  Método de Entrega / Retiro *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('recojo')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      deliveryMethod === 'recojo'
                        ? 'border-primary bg-primary/10 text-primary font-black shadow-xs scale-[1.02]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <span className="text-lg">🏬</span>
                    <span className="text-xs">Recojo en Tienda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'border-primary bg-primary/10 text-primary font-black shadow-xs scale-[1.02]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <span className="text-lg">🛵</span>
                    <span className="text-xs">Delivery a Domicilio</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({cartItems.length} ítems):</span>
                  <span>S/ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Envío:</span>
                  <span className="font-bold text-emerald-600">
                    {deliveryMethod === 'recojo' ? 'GRATIS (Recojo)' : (missingForFreeShipping === 0 ? 'GRATIS' : 'S/ 10.00')}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total a Pagar:</span>
                  <span className="text-primary">
                    S/ {(totalPrice + (deliveryMethod === 'recojo' ? 0 : (missingForFreeShipping === 0 ? 0 : 10))).toFixed(2)}
                  </span>
                </div>
              </div>
            </form>
          );
        })()}

          {checkoutStep === 'success' && (
            <div className="text-center py-10 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle size={36} />
              </div>
              <h4 className="font-extrabold text-xl text-slate-900">¡Pedido Realizado y Almacén Actualizado!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                El pedido <strong className="text-slate-800 font-mono">#{lastOrderId ? lastOrderId.slice(0, 8) : 'ORD-101'}</strong> ha sido registrado en Firebase. El inventario se ha rebajado automáticamente en tiempo real.
              </p>
              
              <div className="bg-slate-100 p-3 rounded-xl text-[11px] text-slate-600 font-medium">
                👉 Puedes cambiar a la pestaña de <strong className="text-slate-900">Control de Almacén</strong> en la barra superior para comprobar el stock restante en la base de datos.
              </div>

              <button 
                onClick={resetAndClose}
                className="btn btn-primary w-full text-sm py-3 mt-4 font-extrabold"
              >
                Seguir Comprando
              </button>
            </div>
          )}

        </div>

        {/* PIE DE CARRITO (Botones de Acción) */}
        {cartItems.length > 0 && checkoutStep !== 'success' && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {checkoutStep === 'cart' ? (
              <>
                {/* Opción WhatsApp arriba del subtotal */}
                <div 
                  onClick={handleWhatsAppRedirect}
                  className="p-3.5 rounded-2xl flex items-center justify-between gap-3.5 cursor-pointer transition-all group shadow-sm select-none mb-2 border"
                  style={{ backgroundColor: '#ebfbf0', borderColor: '#b8f2cb' }}
                  title="Consultar por WhatsApp"
                >
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105"
                    style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                  >
                    <WhatsAppIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                      <span>¿Dudas sobre precios o stock?</span>
                      <span 
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs"
                        style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                      >
                        WhatsApp
                      </span>
                    </h5>
                    <p className="text-[11px] font-semibold leading-snug mt-1 pr-1" style={{ color: '#15803d' }}>
                      Para otra información referente al precio comunícate aquí
                    </p>
                  </div>
                  <div 
                    className="font-black text-xs shrink-0 flex items-center gap-1 transition-transform group-hover:translate-x-1"
                    style={{ color: '#16a34a' }}
                  >
                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="flex items-center justify-between font-black text-lg text-slate-900 pt-1">
                  <span>Subtotal:</span>
                  <span className="text-primary">S/ {totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setCheckoutStep('form')}
                  className="btn btn-primary w-full py-3.5 text-sm font-extrabold shadow-lg shadow-primary/25"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="btn btn-outline flex-1 py-3 text-xs"
                >
                  Volver
                </button>
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-2 py-3 text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Descontando Stock...' : 'Confirmar y Descontar Almacén'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

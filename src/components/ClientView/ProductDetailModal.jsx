import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { subscribeApprovedReviewsByProduct } from '../../firebase/reviewService';
import { 
  Star, 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  MessageSquare, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Sparkles,
  Heart
} from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { currentUser, setIsLoginModalOpen, setPendingReviewProduct, setActiveReviewModalProduct, userFavorites = [], toggleFavorite } = useAuth();
  
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const isFav = userFavorites?.includes(product?.id);

  const handleToggleFavorite = async () => {
    if (toggleFavorite && product?.id) {
      await toggleFavorite(product.id);
    }
  };

  useEffect(() => {
    if (!product || !product.id) {
      setReviews([]);
      setLoadingReviews(false);
      return;
    }
    setLoadingReviews(true);
    const unsubscribe = subscribeApprovedReviewsByProduct(product.id, (data) => {
      setReviews(data);
      setLoadingReviews(false);
    }, (err) => {
      console.error(err);
      setLoadingReviews(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.minStock || 5);

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, qty);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 600);
  };

  const handleOpenReviewModal = () => {
    const productDataForReview = {
      id: product.id,
      name: product.name,
      image: product.imageUrl || product.image || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80",
      price: product.price,
      category: product.category
    };

    if (currentUser) {
      onClose();
      setActiveReviewModalProduct(productDataForReview);
    } else {
      onClose();
      if (setPendingReviewProduct) setPendingReviewProduct(productDataForReview);
      setIsLoginModalOpen(true);
    }
  };

  const numRating = Number(product.ratingAverage || 0);
  const reviewCount = product.reviewCount || reviews.length || 0;

  return (
    <div 
      className="modal-overlay animate-fade-in z-[1200] p-3 sm:p-4 flex items-start justify-center overflow-y-auto overflow-x-hidden w-full" 
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        className="max-w-[820px] w-[92%] sm:w-full bg-white rounded-2xl shadow-2xl border border-slate-100 relative my-auto mt-12 sm:mt-14 md:mt-16 animate-scale-up max-h-[85vh] flex flex-col overflow-hidden overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de Cierre ('X') en posición absoluta alineada de forma uniforme con la curva redondeada */}
        <button 
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 50 }}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Contenido principal del modal con scroll interno que adopta el overflow-hidden simétrico del padre */}
        <div className="p-4 sm:p-6 md:p-7 overflow-y-auto flex-1 space-y-6">
          
          {/* =========================================================================
              SECCIÓN SUPERIOR: FICHA DEL PRODUCTO (2 Columnas en Desktop)
             ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-start w-full">
            
            {/* COLUMNA IZQUIERDA: Imagen del producto con tamaño contenido (max-height: 240px) */}
            <div className="md:col-span-5 w-full shrink-0">
              <div className="h-[220px] sm:h-[240px] max-h-[240px] w-full bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60 relative flex items-center justify-center overflow-hidden">
                <img 
                  src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80"} 
                  alt={product.name}
                  style={{ maxHeight: '220px' }}
                  className={`w-full h-full max-h-[220px] object-contain drop-shadow-md transition-transform duration-300 hover:scale-105 ${
                    isOutOfStock ? 'opacity-40 grayscale' : ''
                  }`}
                />
                {/* Badge de estado en la esquina de la foto si está agotado o bajo stock */}
                {(isOutOfStock || isLowStock) && (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    {isOutOfStock ? (
                      <span className="bg-rose-500 text-white font-bold px-2 py-0.5 rounded-lg text-xs shadow-sm flex items-center gap-1">
                        <XCircle size={13} /> Agotado
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded-lg text-xs shadow-sm flex items-center gap-1 animate-pulse">
                        <AlertCircle size={13} /> ¡Quedan {product.stock}!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: Detalles, Precio, Descripción y Compra */}
            <div className="md:col-span-7 flex flex-col space-y-3 w-full">
              
              {/* Categoría / Mascota */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold pr-8">
                <span className="uppercase tracking-wider">
                  {product.category || 'Accesorios'} {product.petType && product.petType !== 'general' ? `| Para ${product.petType}` : ''}
                </span>
              </div>

              {/* Título Principal */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.name}
              </h2>

              {/* Calificación en estrellas y Stock disponible */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={15}
                        className={`${
                          star <= Math.round(numRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-extrabold text-sm text-slate-800">
                    {numRating > 0 ? numRating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({reviewCount} {reviewCount === 1 ? 'opinión' : 'opiniones'})
                  </span>
                </div>

                {/* Stock disponible */}
                <div className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Stock disponible: {product.stock || 0}
                </div>
              </div>

              {/* Precio */}
              <div className="pt-1 flex items-baseline gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-rose-600">
                      S/ {Number(product.discountPrice).toFixed(2)}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-400 line-through">
                      S/ {Number(product.price || 0).toFixed(2)}
                    </span>
                    <span className="bg-rose-100 text-rose-600 text-xs font-black px-2 py-1 rounded-md uppercase ml-2">
                      Oferta
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-primary">
                    S/ {Number(product.price || 0).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Descripción corta y Garantía */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {product.description || 'Alimento o accesorio de alta calidad seleccionado por Pet.Web para garantizar el bienestar y nutrición de tu mascota.'}
              </p>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-100">
                <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
                <span>Garantía de calidad y soporte Pet.Web incluido.</span>
              </div>

              {/* Selector de cantidad + Botón Añadir al Carrito */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={isOutOfStock || qty <= 1}
                      className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-9 text-center font-black text-sm text-slate-900">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                      disabled={isOutOfStock || qty >= product.stock}
                      className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isOutOfStock || addedAnimation}
                    className={`btn flex-1 py-3 px-5 rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isOutOfStock 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : addedAnimation
                          ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                          : 'btn-primary shadow-primary/20 hover:scale-[1.01]'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <CheckCircle2 size={18} className="animate-bounce" />
                        <span className="truncate">¡Añadido al Carrito!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span className="truncate">{isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                    title={isFav ? "Quitar de Favoritos" : "Añadir a Favoritos"}
                  >
                    <Heart 
                      size={20} 
                      className={`transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} 
                    />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* =========================================================================
              SECCIÓN INFERIOR: RESEÑAS / OPINIONES DE CLIENTES (Ancho completo w-full)
             ========================================================================= */}
          <div className="border-t border-slate-200/80 pt-4 sm:pt-5 space-y-4 w-full">
            
            {/* Encabezado de la Sección Inferior con más respiro */}
            <div className="mt-4 sm:mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                  Opiniones de los Clientes ({reviews.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="btn btn-outline text-xs sm:text-sm py-2 px-3.5 font-bold flex items-center gap-1.5 border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <Sparkles size={14} />
                <span>Escribir Opinión</span>
              </button>
            </div>

            {/* Contenido de Reseñas abarcando todo el ancho (w-full) */}
            {loadingReviews ? (
              <div className="py-10 text-center text-slate-400 text-xs sm:text-sm bg-slate-50/50 rounded-2xl border border-slate-200/60">
                Cargando opiniones del producto...
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-8 text-center border border-slate-200/60 space-y-3 w-full shadow-2xs">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Star size={22} className="fill-amber-400 text-amber-400" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm sm:text-base">Aún no hay opiniones</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-normal">
                  ¡Sé el primero en calificar y compartir tu experiencia con este producto para ayudar a otros dueños de mascotas!
                </p>
                <button
                  type="button"
                  onClick={handleOpenReviewModal}
                  className="btn btn-primary text-xs sm:text-sm mt-2 py-2 px-4 shadow-md shadow-primary/20"
                >
                  Dejar mi Reseña
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {reviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="bg-slate-50/60 border border-slate-200/80 p-3.5 sm:p-4 rounded-2xl space-y-2 text-xs sm:text-sm transition-all shadow-2xs hover:bg-white hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-slate-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {(rev.userName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 truncate">
                          {rev.userName || 'Cliente verificado'}
                        </span>
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" title="Compra verificada" />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              size={13}
                              className={`${
                                st <= Number(rev.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {rev.timestamp ? new Date(rev.timestamp).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : 'Reciente'}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 font-normal leading-relaxed pl-9 text-xs sm:text-sm">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

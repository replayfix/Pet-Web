import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, AlertCircle, CheckCircle2, XCircle, Star, Heart } from 'lucide-react';
import ProductDetailModal from './ProductDetailModal';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { userFavorites = [], toggleFavorite } = useAuth();
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.minStock || 5);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, qty);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 600);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (toggleFavorite) {
      await toggleFavorite(product.id);
    }
  };

  const isFav = userFavorites.includes(product.id);

  const getCategoryEmoji = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'comida': return '🍖';
      case 'accesorios': return '🦴';
      case 'medicinas': return '💊';
      default: return '🐾';
    }
  };

  const ratingAvg = Number(product.ratingAverage || 0);
  const reviewCount = Number(product.reviewCount || 0);

  return (
    <>
      <div 
        className="card card-hover flex flex-col h-full overflow-hidden bg-white relative group"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        
        {/* Imagen y Badges superpuestos - Clic abre el modal de detalle */}
        <div 
          className="relative h-56 bg-slate-50 overflow-hidden flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsDetailOpen(true)}
        >
          <img 
            src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80"} 
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 ${
              isOutOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />

          {/* Categoría & Tipo de animal superior izquierdo */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm capitalize flex items-center gap-1">
              {getCategoryEmoji(product.category)} {product.category || 'Mascota'}
            </span>
            {product.petType && product.petType !== 'general' && (
              <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase">
                Para {product.petType}
              </span>
            )}
            {product.discountPrice && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase animate-pulse">
                🔥 OFERTA
              </span>
            )}
          </div>

          {/* Badge de Stock y Botón Favorito (Superior Derecho) */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-white hover:scale-110 transition-all z-10"
            >
              <Heart 
                size={16} 
                className={`transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} 
              />
            </button>
            
            {isOutOfStock ? (
              <span className="badge badge-danger text-[11px] shadow-sm">
                <XCircle size={13} /> Agotado
              </span>
            ) : isLowStock ? (
              <span className="badge badge-warning text-[11px] shadow-sm animate-pulse">
                <AlertCircle size={13} /> ¡Quedan {product.stock}!
              </span>
            ) : (
              <span className="badge badge-success text-[11px] shadow-sm">
                <CheckCircle2 size={13} /> Stock: {product.stock}
              </span>
            )}
          </div>

          {/* Overlay cuando está agotado */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white font-extrabold px-4 py-1.5 rounded-full text-xs shadow-lg transform -rotate-6">
                🚫 SIN STOCK EN ALMACÉN
              </span>
            </div>
          )}
        </div>

        {/* Contenido / Información con flex: 1 para ocupar todo el espacio vertical restante */}
        <div className="p-5 flex flex-col flex-1 gap-3" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
          
          {/* Título y Estrellas - Clic abre el modal de detalle */}
          <div className="cursor-pointer" onClick={() => setIsDetailOpen(true)}>
            <h3 className="font-extrabold text-base text-slate-800 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>

            {/* Valoración por Estrellas */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((st) => (
                  <Star
                    key={st}
                    size={14}
                    className={`${
                      st <= Math.round(ratingAvg)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-extrabold text-slate-800">
                {ratingAvg > 0 ? ratingAvg.toFixed(1) : ''}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                ({reviewCount})
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-normal leading-relaxed">
              {product.description || 'Producto certificado de alta calidad para tu engreído.'}
            </p>
          </div>

          {/* Bloque agrupado de compra empujado al fondo con margin-top: auto; */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3.5" style={{ marginTop: 'auto' }}>
            {/* Precio al lado de Precio Online */}
            <div className="flex flex-col items-end gap-1 w-full">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wide w-full text-left">Precio Online:</span>
              <div className="flex items-center gap-2 justify-end w-full">
                {product.discountPrice ? (
                  <>
                    <span className="text-xs font-bold text-slate-400 line-through">
                      S/ {Number(product.price || 0).toFixed(2)}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-sm text-rose-500">S/</span>
                      <span className="font-black text-2xl text-rose-600 tracking-tight">
                        {Number(product.discountPrice).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-sm text-primary">S/</span>
                    <span className="font-black text-2xl text-slate-900 tracking-tight">
                      {Number(product.price || 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de unidades y botón de agregar abajo */}
            <div className="flex items-center gap-2">
              {!isOutOfStock && (
                <select 
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Cantidad a agregar"
                  className="bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl px-2.5 py-2.5 outline-none focus:border-primary shrink-0 transition-colors cursor-pointer"
                >
                  {[...Array(Math.min(product.stock, 10)).keys()].map(i => (
                    <option key={i + 1} value={i + 1}>{i + 1} und.</option>
                  ))}
                </select>
              )}

              <button 
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`btn flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  addedAnimation 
                    ? 'bg-emerald-500 text-white scale-95 shadow-md' 
                    : isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'btn-primary'
                }`}
              >
                <ShoppingBag size={16} />
                <span>{addedAnimation ? '¡Añadido!' : 'Agregar'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Detalle de Producto */}
      {isDetailOpen && (
        <ProductDetailModal 
          product={product} 
          onClose={() => setIsDetailOpen(false)} 
        />
      )}
    </>
  );
}

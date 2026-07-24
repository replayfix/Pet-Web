import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addReview } from '../../firebase/reviewService';
import { Star, X, CheckCircle2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

export default function ReviewModal() {
  const { activeReviewModalProduct, setActiveReviewModalProduct, currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeReviewModalProduct) {
      setRating(5);
      setHoverRating(0);
      setComment('');
      setIsSuccess(false);
      setError('');
    }
  }, [activeReviewModalProduct]);

  if (!activeReviewModalProduct) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setActiveReviewModalProduct(null);
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 1: return '1 - No me gustó';
      case 2: return '2 - Regular / Podría mejorar';
      case 3: return '3 - Bueno / Aceptable';
      case 4: return '4 - Muy bueno / Me gustó mucho';
      case 5: return '5 - ¡Excelente, lo súper recomiendo! 🐶✨';
      default: return '';
    }
  };

  // Helper para obtener la imagen del producto o un fallback dinámico inteligente según la categoría
  const getProductImage = () => {
    if (!activeReviewModalProduct) return '';
    const img = activeReviewModalProduct.image || activeReviewModalProduct.imageUrl || activeReviewModalProduct.img;
    if (img && typeof img === 'string' && img.trim() !== '') {
      return img;
    }
    
    // Fallback dinámico por categoría / nombre si no hay imagen asignada
    const cat = (activeReviewModalProduct.category || '').toLowerCase();
    const name = (activeReviewModalProduct.name || '').toLowerCase();

    if (cat.includes('gato') || name.includes('gato') || name.includes('cat') || cat.includes('felin')) {
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80';
    }
    if (cat.includes('perro') || name.includes('perro') || name.includes('dog') || cat.includes('canin')) {
      return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80';
    }
    if (cat.includes('juguete') || name.includes('juguete') || name.includes('toy')) {
      return 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&auto=format&fit=crop&q=80';
    }
    // Fallback genérico para accesorios/mascotas
    return 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop&q=80';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Por favor, cuéntanos un poco sobre tu experiencia con este producto.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        productId: activeReviewModalProduct.id,
        productName: activeReviewModalProduct.name || 'Producto de Pet.Web',
        productImage: getProductImage(),
        userId: currentUser?.email || currentUser?.name || 'cliente@petweb.pe',
        userName: currentUser?.name || currentUser?.email?.split('@')[0] || 'Cliente de Pet.Web',
        rating: rating,
        comment: comment.trim()
      });

      setIsSuccess(true);
      setTimeout(() => {
        setActiveReviewModalProduct(null);
      }, 2500);
    } catch (err) {
      console.error('Error al enviar reseña:', err);
      setError('Ocurrió un error al enviar tu opinión. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStars = hoverRating || rating;
  const productImage = getProductImage();

  return (
    <div className="modal-overlay animate-fade-in z-[1200] p-3 sm:p-4 flex items-center justify-center overflow-x-hidden w-full" onClick={handleClose}>
      <div 
        className="modal-content max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-x-hidden relative animate-scale-up max-h-[90vh] flex flex-col justify-between my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Compacto */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 relative w-full overflow-x-hidden shrink-0">
          <button 
            type="button"
            onClick={handleClose}
            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 50 }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-slate-950 font-black shadow-lg shadow-primary/30 shrink-0">
              <Star size={20} className="fill-slate-950" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-base sm:text-lg truncate leading-tight">Dejar una Reseña</h3>
              <p className="text-[11px] text-slate-300 truncate">Tu opinión ayuda a miles de dueños y mascotas</p>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        {isSuccess ? (
          <div className="p-5 sm:p-6 text-center space-y-3.5 animate-fade-in w-full overflow-x-hidden">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-extrabold text-lg text-slate-900">¡Gracias por tu valoración!</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tu reseña para <strong className="text-slate-900">{activeReviewModalProduct.name}</strong> ha sido enviada con éxito y se encuentra <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">pendiente de revisión</span> por nuestro equipo.
            </p>
            <p className="text-[11px] text-slate-400 font-medium">Cerrando automáticamente en unos segundos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 w-full overflow-x-hidden flex-1 overflow-y-auto">
            {/* Tarjeta resumen del producto con vinculación de imagen inteligente */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 w-full overflow-x-hidden">
              <img 
                src={productImage} 
                alt={activeReviewModalProduct.name}
                className="w-12 h-12 object-contain rounded-lg shadow-2xs bg-white p-1 shrink-0 border border-slate-100"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-light text-primary inline-block">
                  {activeReviewModalProduct.category || 'Producto'}
                </span>
                <h4 className="font-bold text-slate-900 text-xs text-wrap break-words leading-tight truncate">
                  {activeReviewModalProduct.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  S/ {Number(activeReviewModalProduct.price || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Selector de 1 a 5 estrellas */}
            <div className="text-center space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ¿Qué calificación le das a este producto?
              </label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star 
                      size={28} 
                      className={`transition-colors ${
                        star <= activeStars 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]' 
                          : 'text-slate-200 fill-slate-100 hover:text-slate-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-extrabold text-slate-700 h-4 animate-fade-in">
                {getRatingLabel(activeStars)}
              </p>
            </div>

            {/* Comentario / Opinión con alineación exacta */}
            <div className="space-y-1.5 w-full text-left">
              <label htmlFor="comment" className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 w-full text-left m-0 p-0">
                <MessageSquare size={15} className="text-primary shrink-0" />
                <span>Escribe tu opinión o comentario</span>
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué fue lo que más le gustó a tu mascota? ¿La calidad y el empaque cumplieron tus expectativas?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 resize-none bg-slate-50/50 block"
                required
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {comment.length} caracteres
              </span>
            </div>

            {/* Errores */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Aviso sobre moderación contenido sin desbordamiento */}
            <div className="text-[11px] text-slate-600 bg-slate-100/90 p-3 rounded-xl border border-slate-200/70 flex items-start gap-2 w-full overflow-x-hidden">
              <span className="shrink-0 text-sm leading-none mt-0.5">🛡️</span>
              <div className="leading-snug">
                <strong className="text-slate-800">Nota de moderación:</strong> Las opiniones enviadas por nuestros clientes pasan por un breve proceso de revisión antes de publicarse.
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn btn-primary py-2.5 px-5 font-black text-xs sm:text-sm shadow-md shadow-primary/30 flex items-center justify-center gap-2"
              >
                <Sparkles size={15} />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Reseña'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

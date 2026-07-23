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
        productImage: activeReviewModalProduct.image || '',
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

  return (
    <div className="modal-overlay animate-fade-in z-[1200] p-4 flex items-center justify-center" onClick={handleClose}>
      <div 
        className="modal-content max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
          <button 
            type="button"
            onClick={handleClose}
            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 50 }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-slate-950 font-black shadow-lg shadow-primary/30">
              <Star size={22} className="fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">Dejar una Reseña</h3>
              <p className="text-xs text-slate-300">Tu opinión ayuda a miles de dueños y mascotas</p>
            </div>
          </div>
        </div>

        {/* Contenido del Modal */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-extrabold text-xl text-slate-900">¡Gracias por tu valoración!</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tu reseña para <strong className="text-slate-900">{activeReviewModalProduct.name}</strong> ha sido enviada con éxito y se encuentra <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">pendiente de revisión</span> por nuestro equipo.
            </p>
            <p className="text-xs text-slate-400 font-medium">Cerrando automáticamente en unos segundos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Tarjeta resumen del producto */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <img 
                src={activeReviewModalProduct.image || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80'} 
                alt={activeReviewModalProduct.name}
                className="w-16 h-16 object-cover rounded-xl shadow-sm bg-white"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary-light text-primary">
                  {activeReviewModalProduct.category || 'Producto'}
                </span>
                <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                  {activeReviewModalProduct.name}
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  S/ {Number(activeReviewModalProduct.price || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Selector de 1 a 5 estrellas */}
            <div className="text-center space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                ¿Qué calificación le das a este producto?
              </label>
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star 
                      size={32} 
                      className={`transition-colors ${
                        star <= activeStars 
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]' 
                          : 'text-slate-200 fill-slate-100 hover:text-slate-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-700 h-4 animate-fade-in">
                {getRatingLabel(activeStars)}
              </p>
            </div>

            {/* Comentario / Opinión */}
            <div className="space-y-1.5">
              <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-primary" />
                <span>Escribe tu opinión o comentario</span>
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué fue lo que más le gustó a tu mascota? ¿La calidad y el empaque cumplieron tus expectativas?"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-800 placeholder:text-slate-400 resize-none bg-slate-50/50"
                required
              />
              <span className="text-[11px] text-slate-400 block text-right">
                {comment.length} caracteres
              </span>
            </div>

            {/* Errores */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Aviso sobre moderación */}
            <p className="text-[11px] text-slate-500 bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 leading-normal">
              🛡️ <strong>Nota de moderación:</strong> Las opiniones enviadas por nuestros clientes pasan por un breve proceso de revisión antes de publicarse en el catálogo para garantizar la calidad en la comunidad.
            </p>

            {/* Botones de acción */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn btn-primary py-3 px-6 font-black text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Reseña'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

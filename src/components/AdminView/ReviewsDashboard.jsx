import React, { useState, useEffect } from 'react';
import { subscribeAllReviews, updateReviewStatus, deleteReview } from '../../firebase/reviewService';
import { 
  Star, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  MessageSquare, 
  ShieldAlert, 
  AlertCircle,
  Filter
} from 'lucide-react';

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAllReviews((data) => {
      setReviews(data);
      setLoading(false);
    }, (err) => {
      console.error('Error cargando reseñas en admin:', err);
      setLoading(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const counts = {
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    all: reviews.length
  };

  const filteredReviews = reviews.filter(r => {
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const matchesSearch = searchQuery === '' || 
      (r.productName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.userName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.comment?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleStatusChange = async (reviewId, productId, newStatus) => {
    setProcessingId(reviewId);
    try {
      await updateReviewStatus(reviewId, productId, newStatus);
    } catch (error) {
      alert('Error al actualizar el estado de la reseña.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente la reseña de "${review.userName}" para el producto "${review.productName}"?`)) {
      return;
    }
    setProcessingId(review.id);
    try {
      await deleteReview(review.id, review.productId, review.status);
    } catch (error) {
      alert('Error al eliminar la reseña.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Publicada / Aprobada</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
            <XCircle size={14} className="text-rose-600" />
            <span>Rechazada</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide animate-pulse">
            <Clock size={14} className="text-amber-600" />
            <span>Pendiente de Revisión</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Encabezado */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 font-black text-[11px] px-2.5 py-1 rounded-full uppercase">
              Moderación en Vivo
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Sincronizado con Almacén & Catálogo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ⭐ Gestión y Aprobación de Reseñas
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Aquí puedes moderar, aprobar o rechazar las opiniones enviadas por los clientes antes o después de que sean visibles en las fichas de los productos.
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por producto, cliente u opinión..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold text-slate-800 transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de Filtro por Estado */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Clock size={16} />
          <span>Pendientes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'pending' ? 'bg-white text-amber-600 font-black' : 'bg-slate-200 text-slate-700'
          }`}>
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Publicadas / Aprobadas</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'approved' ? 'bg-white text-emerald-700 font-black' : 'bg-slate-200 text-slate-700'
          }`}>
            {counts.approved}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <XCircle size={16} />
          <span>Rechazadas</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'rejected' ? 'bg-white text-rose-700 font-black' : 'bg-slate-200 text-slate-700'
          }`}>
            {counts.rejected}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ml-auto ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span>Todas las Reseñas</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'all' ? 'bg-white text-slate-900 font-black' : 'bg-slate-200 text-slate-700'
          }`}>
            {counts.all}
          </span>
        </button>
      </div>

      {/* Listado de Reseñas */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Sincronizando opiniones con la base de datos...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare size={32} />
          </div>
          <h3 className="font-extrabold text-lg text-slate-700">No hay opiniones en esta categoría</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No se encontraron resultados para "${searchQuery}". Intenta con otros términos.` 
              : 'No hay valoraciones con el estado seleccionado en este momento.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const dateStr = rev.timestamp 
              ? new Date(rev.timestamp).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
              : 'Fecha no disponible';
            const isProcessing = processingId === rev.id;

            return (
              <div 
                key={rev.id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  rev.status === 'pending' ? 'border-amber-300/80 bg-amber-50/20' : 'border-slate-200/80'
                }`}
              >
                {/* Datos del producto, cliente y comentario */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  
                  {/* Fila 1: Estado, Producto y Fecha */}
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(rev.status)}
                    
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl">
                      {rev.productImage && (
                        <img src={rev.productImage} alt={rev.productName} className="w-5 h-5 rounded object-cover" />
                      )}
                      <span className="font-bold text-xs text-slate-800 truncate max-w-[220px]">
                        {rev.productName || 'Producto ID: ' + rev.productId}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-semibold">
                      {dateStr}
                    </span>
                  </div>

                  {/* Fila 2: Usuario y Estrellas */}
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {(rev.userName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {rev.userName || 'Cliente'}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {rev.userId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50/80 px-3 py-1 rounded-xl border border-amber-200/60">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          size={16}
                          className={`${
                            st <= Number(rev.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-100 text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="font-black text-sm text-amber-900 ml-1">
                        {rev.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Fila 3: Comentario */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    "{rev.comment}"
                  </div>

                </div>

                {/* Botones de Acción Rápida de Moderación */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  
                  {rev.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(rev.id, rev.productId, 'approved')}
                      className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-44 py-2.5 text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>{isProcessing ? 'Procesando...' : 'Aprobar Reseña'}</span>
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(rev.id, rev.productId, 'rejected')}
                      className="btn bg-rose-500 hover:bg-rose-600 text-white w-full md:w-44 py-2.5 text-xs font-black shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      <span>{isProcessing ? 'Procesando...' : 'Rechazar'}</span>
                    </button>
                  )}

                  {rev.status !== 'pending' && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleStatusChange(rev.id, rev.productId, 'pending')}
                      className="btn bg-amber-500 hover:bg-amber-600 text-white w-full md:w-44 py-2.5 text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Clock size={16} />
                      <span>Poner en Pendiente</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDelete(rev)}
                    className="btn btn-outline text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 w-full md:w-44 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    <span>Eliminar</span>
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[1100] bg-slate-900/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 sm:py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 relative my-auto">
          
          {/* Ícono de advertencia / Trash2 */}
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <Trash2 size={32} className={isDeleting ? "animate-bounce" : ""} />
          </div>

          {/* Textos */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-2xl text-slate-900">
              {title || '¿Deseas eliminar este elemento?'}
            </h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed px-2 whitespace-pre-line">
              {message || 'Estás a punto de eliminar este registro de forma permanente. Esta acción no se puede deshacer.'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3.5 px-4 rounded-full font-extrabold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              CANCELAR
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3.5 px-4 rounded-full font-black text-xs text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-75"
            >
              <Trash2 size={15} />
              <span>{isDeleting ? 'RESTAURANDO...' : 'SÍ, ELIMINAR'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

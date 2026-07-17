import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, AlertCircle } from 'lucide-react';

export default function LogoutModal({ onConfirmNavigate }) {
  const { currentUser, isLogoutConfirmOpen, setIsLogoutConfirmOpen, logout } = useAuth();

  if (!isLogoutConfirmOpen || !currentUser) return null;

  const handleConfirmLogout = () => {
    logout();
    if (onConfirmNavigate) {
      onConfirmNavigate('store');
    }
    setIsLogoutConfirmOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 relative">
        
        {/* Ícono de advertencia / LogOut */}
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <LogOut size={32} />
        </div>

        {/* Textos */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-2xl text-slate-900">
            ¿Deseas cerrar sesión?
          </h3>
          <p className="text-xs font-medium text-slate-500 leading-relaxed px-2">
            Estás a punto de salir de la cuenta <strong className="text-slate-800">{currentUser.name}</strong>. Tendrás que iniciar sesión nuevamente para acceder a tu perfil y pedidos.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="flex-1 py-3.5 px-4 rounded-full font-extrabold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex-1 py-3.5 px-4 rounded-full font-black text-xs text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
          >
            <LogOut size={15} /> SÍ, SALIR
          </button>
        </div>

      </div>
    </div>
  );
}

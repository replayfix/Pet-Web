import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './ClientView/AuthModal';
import { 
  ShoppingCart, 
  Store, 
  Boxes, 
  Search, 
  User,
  LogOut, 
  PawPrint,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  activeCategory, 
  setActiveCategory,
  searchQuery,
  setSearchQuery
}) {
  const { totalItems, setIsCartOpen } = useCart();
  const { currentUser, isAdmin, setIsLoginModalOpen, setIsLogoutConfirmOpen, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleAdminToggle = () => {
    setSearchQuery('');
    if (currentView === 'store') {
      if (isAdmin) {
        setCurrentView('admin');
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      setCurrentView('store');
    }
  };

  const categories = [
    { id: 'all', label: '🐶 Todo' },
    { id: 'comida', label: '🍖 Comida' },
    { id: 'accesorios', label: '🦴 Accesorios' },
    { id: 'medicinas', label: '💊 Medicinas & Cuidado' }
  ];

  return (
    <>
      <header className="glass-header sticky top-0 z-50 transition-all">
        {/* Top bar de promociones estilo GoPet.pe */}
        <div className="bg-primary text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
          🐶Menos estrés, más colitas felices. Recibe todo lo que tu peludito necesita sin salir de casa. ❤️ ¡Haz tu pedido ahora!🐱
        </div>

        <div className="container py-3.5">
          <div className="flex items-center justify-between gap-4 navbar-main-row">
            
            {/* Logo y Marca */}
            <div 
              onClick={() => { setCurrentView('store'); setActiveCategory('all'); }}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md">
                <PawPrint size={24} className="animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                  Pet<span className="text-primary">.Web</span>
                </span>
              </div>
            </div>

            {/* Buscador central (sólo visible en tienda) */}
            {currentView === 'store' && (
              <div className="hidden md:flex flex-1 max-w-md mx-4 relative items-center group">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 pointer-events-none transition-all duration-300" />
                <input 
                  type="text" 
                  placeholder="Buscar por marca, producto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/25 focus:shadow-lg focus:shadow-primary/15 outline-none transition-all duration-300"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* Acciones del menú: Carrito, Login e Inventario (si es Admin) */}
            <div className="flex items-center gap-2 sm:gap-3 navbar-actions-group">
              
              {/* 1. Botón Carrito de Compras (Sólo se muestra si NO es administrador) */}
              {currentView === 'store' && !isAdmin && (
                <button 
                  onClick={() => setIsCartOpen(true)}
                  title="Ver Mi Carrito"
                  className="p-2 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-full transition-all cursor-pointer shrink-0"
                >
                  <div className="relative inline-block w-[26px] h-[26px]">
                    <ShoppingCart size={26} className="block" />
                    {totalItems > 0 && (
                      <span 
                        className="vtex-minicart-2-x-minicartQuantityBadge absolute rounded-full bg-red-600 text-white font-bold flex justify-center items-center shadow-sm select-none z-10 animate-bounce"
                        style={{
                          width: '18px',
                          height: '18px',
                          top: '-8px',
                          right: '-8px',
                          fontSize: '11px',
                          lineHeight: '1',
                          userSelect: 'none'
                        }}
                      >
                        {totalItems}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* 2. Botón Iniciar Sesión / Menú Desplegable de Usuario al lado del carrito */}
              {currentUser ? (
                <div className="relative">
                  {/* Backdrop para cerrar al hacer clic fuera */}
                  {userMenuOpen && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                  )}

                  {/* Recuadro / Botón con el nombre del usuario */}
                  <div 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    title="Menú de Usuario"
                    className="flex items-center gap-2.5 bg-white/90 hover:bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98 relative z-50 select-none group"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                      <User size={15} />
                    </div>
                    <div className="flex flex-col text-left leading-tight max-w-[140px] sm:max-w-[180px]">
                      <span className="truncate text-slate-900 group-hover:text-primary font-extrabold text-[13px] sm:text-sm transition-colors">
                        {currentUser.name}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          👑 Admin
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ml-0.5 ${userMenuOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>

                  {/* Menú Desplegable (MI CUENTA / SALIR) */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={() => {
                          setCurrentView('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User size={16} className="text-primary" />
                        <span>MI CUENTA</span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsLogoutConfirmOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} className="text-red-500" />
                        <span>SALIR</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  title="Iniciar Sesión o Crear Cuenta"
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 sm:px-4 py-2 rounded-full font-bold text-sm transition-all border border-slate-200 shrink-0 shadow-sm"
                >
                  <User size={18} className="text-primary" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
              )}

              {/* 3. Switcher de Almacén / Inventario (SÓLO APARECE SI ESTÁS LOGUEADO COMO ADMIN) */}
              {isAdmin && (
                <button 
                  onClick={handleAdminToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md shrink-0 ${
                    currentView === 'admin' 
                      ? 'bg-slate-900 text-white hover:bg-slate-800' 
                      : 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
                  }`}
                >
                  {currentView === 'admin' ? (
                    <>
                      <Store size={18} />
                      <span className="hidden sm:inline">Volver a Tienda</span>
                    </>
                  ) : (
                    <>
                      <Boxes size={18} />
                      <span className="hidden sm:inline">Control de Almacén</span>
                    </>
                  )}
                </button>
              )}

              {/* Botón Menú Móvil */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

            </div>
          </div>

          {/* Buscador móvil (sólo visible en tienda) */}
          {currentView === 'store' && (
            <div className="mt-3 md:hidden">
              <div className="relative flex items-center group">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 pointer-events-none transition-all duration-300" />
                <input 
                  type="text" 
                  placeholder="Buscar por marca, producto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 border border-slate-200 rounded-full focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/25 focus:shadow-lg focus:shadow-primary/15 outline-none transition-all duration-300"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navegación por categorías y filtros (Solo visible en tienda en desktop y tablets) */}
          {currentView === 'store' && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Menú Móvil Desplegable (Menú tipo hamburguesa compacto apilado en columna para pantallas pequeñas) */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-3.5 animate-fade-in bg-white/95 rounded-2xl p-4 shadow-lg">
              <div className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Menú de Usuario & Acciones
              </div>

              {/* Botón Mi Cuenta / Login en móvil */}
              {currentUser ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{currentUser.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{currentUser.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <User size={16} className="text-primary" />
                    <span>MI CUENTA / PERFIL</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-extrabold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} className="text-red-500" />
                    <span>CERRAR SESIÓN</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-extrabold text-sm shadow-md cursor-pointer"
                >
                  <User size={18} />
                  <span>Iniciar Sesión / Registrarse</span>
                </button>
              )}

              {/* Botón Carrito en menú móvil */}
              {currentView === 'store' && !isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-extrabold text-primary bg-primary/10 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} />
                    <span>VER MI CARRITO</span>
                  </div>
                  <span className="bg-primary text-white px-2 py-0.5 rounded-full text-[11px]">
                    {totalItems} ítems
                  </span>
                </button>
              )}

              {/* Toggle Admin / Almacén en móvil */}
              {isAdmin && (
                <button 
                  onClick={() => {
                    handleAdminToggle();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-extrabold text-xs shadow-md ${
                    currentView === 'admin' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {currentView === 'admin' ? (
                    <>
                      <Store size={16} />
                      <span>Volver a Tienda</span>
                    </>
                  ) : (
                    <>
                      <Boxes size={16} />
                      <span>Control de Almacén</span>
                    </>
                  )}
                </button>
              )}

              <div className="border-t border-slate-100 pt-2 text-center">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-slate-400 font-bold hover:text-slate-600 underline"
                >
                  Cerrar menú
                </button>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* MODAL DE LOGIN Y REGISTRO (AUTH MODAL) */}
      <AuthModal />
    </>
  );
}

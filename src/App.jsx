import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { useAuth, AuthProvider } from './context/AuthContext';
import { subscribeProducts, seedInitialProducts } from './firebase/dbService';
import Navbar from './components/Navbar';
import HeroBanner from './components/ClientView/HeroBanner';
import ProductCard from './components/ClientView/ProductCard';
import CartDrawer from './components/ClientView/CartDrawer';
import InventoryDashboard from './components/AdminView/InventoryDashboard';
import AdminMainView from './components/AdminView/AdminMainView';
import UserProfileView from './components/ClientView/UserProfileView';
import LogoutModal from './components/ClientView/LogoutModal';
import { 
  Sparkles, 
  Loader2, 
  PawPrint, 
  Database, 
  CheckCircle, 
  SlidersHorizontal,
  Dog,
  Cat,
  Bird,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

const WhatsAppFooterIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export function AppContent() {
  const { isAdmin, setIsLoginModalOpen } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'admin'
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'comida' | 'accesorios' | 'medicinas'
  const [activePetType, setActivePetType] = useState('all'); // 'all' | 'perro' | 'gato' | 'aves'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'stock'
  const [isSeeding, setIsSeeding] = useState(false);

  // Si no es admin y está intentando ver el admin, regresarlo o pedir login
  useEffect(() => {
    if (currentView === 'admin' && !isAdmin) {
      setCurrentView('store');
      setIsLoginModalOpen(true);
    }
  }, [currentView, isAdmin, setIsLoginModalOpen]);

  // Escuchar en tiempo real a Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeProducts((data) => {
      setProducts(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedInitialProducts();
    } catch (error) {
      alert('Hubo un error cargando datos de prueba.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtrado de productos en la tienda
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesPet = activePetType === 'all' || p.petType === activePetType || p.petType === 'general';
    const matchesSearch = searchQuery === '' || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPet && matchesSearch && p.status !== 'inactive';
  });

  // Ordenamiento
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'stock') return Number(b.stock) - Number(a.stock);
    return 0; // featured
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* BARRA DE NAVEGACIÓN */}
      <Navbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="container flex-1 pb-16">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 size={44} className="text-primary animate-spin" />
            <p className="text-sm font-bold text-slate-500">
              Conectando con base de datos Firebase (`pet-web-5ccb1`)...
            </p>
          </div>
        ) : currentView === 'admin' ? (
          /* VISTA ADMINISTRADOR (ALMACÉN Y ÓRDENES DE COMPRA) */
          <AdminMainView products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        ) : currentView === 'profile' ? (
          /* VISTA PERFIL Y CUENTA DE USUARIO */
          <UserProfileView onNavigate={(view) => setCurrentView(view)} />
        ) : (
          /* VISTA CLIENTE (TIENDA GOPET) */
          <div className="space-y-8">
            <HeroBanner setActiveCategory={setActiveCategory} />

            {/* Filtros de Tipo de Mascota y Ordenamiento */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-400 uppercase mr-1">Mascota:</span>
                
                <button 
                  onClick={() => setActivePetType('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activePetType === 'all' 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <PawPrint size={14} /> Todos
                </button>

                <button 
                  onClick={() => setActivePetType('perro')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activePetType === 'perro' 
                      ? 'bg-primary text-white shadow' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Dog size={14} /> Perros
                </button>

                <button 
                  onClick={() => setActivePetType('gato')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activePetType === 'gato' 
                      ? 'bg-amber-500 text-white shadow' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Cat size={14} /> Gatos
                </button>

                <button 
                  onClick={() => setActivePetType('aves')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activePetType === 'aves' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bird size={14} /> Aves y Otros
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <SlidersHorizontal size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Ordenar por:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-3 py-1.5 outline-none"
                >
                  <option value="featured">✨ Destacados</option>
                  <option value="price-asc">💵 Precio: Menor a Mayor</option>
                  <option value="price-desc">💰 Precio: Mayor a Menor</option>
                  <option value="stock">📦 Mayor Stock Disponible</option>
                </select>
              </div>

            </div>

            {/* SECCIÓN DE PRODUCTOS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-xl md:text-2xl text-slate-900 flex items-center gap-2">
                  <span>Catálogo de Productos</span>
                  {activeCategory !== 'all' && (
                    <span className="text-xs font-bold bg-primary-light text-primary px-3 py-1 rounded-full uppercase">
                      {activeCategory}
                    </span>
                  )}
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
                </span>
              </div>

              {products.length === 0 ? (
                /* Si no hay productos en Firestore, mostrar CTA de carga rápida (Seed) */
                <div className="card p-10 text-center space-y-4 max-w-xl mx-auto bg-gradient-to-b from-white to-slate-50 border-2 border-dashed border-primary/40">
                  <div className="w-16 h-16 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Database size={32} />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    Tu base de datos Firebase está inicializada y lista
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Aún no hay ítems en la colección <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-800">products</code>. Haz clic en el botón inferior para cargar automáticamente un catálogo de prueba con comida, accesorios y medicinas.
                  </p>
                  <button 
                    onClick={handleSeedData}
                    disabled={isSeeding}
                    className="btn btn-primary px-6 py-3.5 text-sm font-black shadow-lg shadow-primary/30"
                  >
                    <Sparkles size={18} />
                    <span>{isSeeding ? 'Generando Catálogo en Firestore...' : 'Cargar 10 Productos de Prueba (Seed)'}</span>
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="card p-12 text-center space-y-3 bg-white">
                  <HelpCircle size={40} className="mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-700">No se encontraron productos con estos filtros</h4>
                  <p className="text-xs text-slate-400">Prueba eliminando los filtros o buscando con otra palabra clave.</p>
                  <button 
                    onClick={() => { setActiveCategory('all'); setActivePetType('all'); setSearchQuery(''); }}
                    className="btn btn-outline text-xs mt-2"
                  >
                    Ver Todo el Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* CARRITO DESLIZABLE */}
      <CartDrawer />

      {/* MODAL DE CONFIRMACIÓN DE SALIDA DE CUENTA */}
      <LogoutModal onConfirmNavigate={(view) => setCurrentView(view)} />

      {/* PIE DE PÁGINA */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 mt-16">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <PawPrint size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight">Pet.Web</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Plataforma e-commerce especializada en bienestar animal integrada con módulo en vivo de control y gestión de almacén.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">Categorías</h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><button onClick={() => { setCurrentView('store'); setActiveCategory('comida'); }} className="text-slate-300 hover:text-primary transition-colors cursor-pointer text-left">🍖 Alimentos Super Premium</button></li>
              <li><button onClick={() => { setCurrentView('store'); setActiveCategory('accesorios'); }} className="text-slate-300 hover:text-primary transition-colors cursor-pointer text-left">🦴 Accesorios y Juguetes</button></li>
              <li><button onClick={() => { setCurrentView('store'); setActiveCategory('medicinas'); }} className="text-slate-300 hover:text-primary transition-colors cursor-pointer text-left">💊 Farmacia y Cuidado</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm text-white mb-3 uppercase tracking-wider">Contáctanos</h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" />
                <span>En Perú: (01) 488 7377</span>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppFooterIcon size={14} className="text-emerald-400 shrink-0" />
                <span>+51 999999999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary shrink-0" />
                <span>petweb@outlook.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>Av. Independencia N°1</span>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Lunes a Viernes 9 am - 9 pm / Sábado 9 am - 6 pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Pet.Web. Todos los derechos reservados. Desarrollado por JTECHSERV.</p>
          <div className="flex gap-4">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Soporte Almacén</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

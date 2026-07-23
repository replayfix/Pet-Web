import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import ReceiptModal from '../AdminView/ReceiptModal';
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  LogOut, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Save, 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  CreditCard,
  Star,
  Sparkles,
  Heart
} from 'lucide-react';
import ProductCard from './ProductCard';

const DATOS_UBIGEO_PERU = {
  'Lima': {
    'Lima': ['Miraflores', 'San Isidro', 'Santiago de Surco', 'La Molina', 'San Borja', 'Barranco', 'Jesús María', 'Lince', 'Pueblo Libre', 'Magdalena del Mar', 'San Miguel', 'Chorrillos', 'Ate', 'Los Olivos', 'San Martín de Porres', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'Villa El Salvador', 'Surquillo', 'Cercado de Lima', 'Puente Piedra', 'Comas', 'Independencia'],
    'Cañete': ['San Vicente de Cañete', 'Asia', 'Chilca', 'Mala', 'Lunahuaná', 'Cerro Azul'],
    'Huaral': ['Huaral', 'Chancay', 'Aucallama'],
    'Huaura': ['Huacho', 'Barranca', 'Supe', 'Sayán'],
    'Canta': ['Canta', 'Santa Rosa de Quives']
  },
  'Callao': {
    'Callao': ['Callao', 'Bellavista', 'La Perla', 'La Punta', 'Carmen de la Legua', 'Ventanilla', 'Mi Perú']
  },
  'Arequipa': {
    'Arequipa': ['Arequipa', 'Cayma', 'Yanahuara', 'José Luis Bustamante y Rivero', 'Cerro Colorado', 'Sachaca', 'Miraflores', 'Paucarpata', 'Hunter', 'Tiabaya'],
    'Caylloma': ['Chivay', 'Majes', 'Cabanaconde'],
    'Islay': ['Mollendo', 'Mejía', 'Cocachacra'],
    'Camaná': ['Camaná', 'Samuel Pastor']
  },
  'La Libertad': {
    'Trujillo': ['Trujillo', 'Víctor Larco Herrera', 'Huanchaco', 'El Porvenir', 'La Esperanza', 'Florencia de Mora', 'Laredo', 'Moche'],
    'Ascope': ['Ascope', 'Chicama', 'Chocope', 'Paiján'],
    'Chepén': ['Chepén', 'Pacanga'],
    'Pacasmayo': ['San Pedro de Lloc', 'Pacasmayo', 'Guadalupe']
  },
  'Piura': {
    'Piura': ['Piura', 'Castilla', 'Catacaos', 'Tambogrande', 'Veintiséis de Octubre'],
    'Sullana': ['Sullana', 'Bellavista', 'Marcavelica'],
    'Talara': ['Pariñas (Talara)', 'Máncora', 'Los Órganos', 'El Alto'],
    'Paita': ['Paita', 'Colán']
  },
  'Cusco': {
    'Cusco': ['Cusco', 'Wanchaq', 'Santiago', 'San Sebastián', 'San Jerónimo', 'Saylla'],
    'Urubamba': ['Urubamba', 'Ollantaytambo', 'Machupicchu', 'Maras', 'Chinchero'],
    'Calca': ['Calca', 'Pisac', 'Coya'],
    'Quispicanchi': ['Urcos', 'Andahuaylillas', 'Oropesa']
  },
  'Lambayeque': {
    'Chiclayo': ['Chiclayo', 'José Leonardo Ortiz', 'La Victoria', 'Pimentel', 'Monsefú', 'Reque', 'Santa Rosa'],
    'Lambayeque': ['Lambayeque', 'Mórrope', 'Olmos', 'Túcume'],
    'Ferreñafe': ['Ferreñafe', 'Pítipo']
  },
  'Ica': {
    'Ica': ['Ica', 'La Tinguiña', 'Parcona', 'Subtanjalla', 'Salas (Guadalupe)'],
    'Chincha': ['Chincha Alta', 'Sunampe', 'Grocio Prado', 'Pueblo Nuevo', 'Chincha Baja'],
    'Pisco': ['Pisco', 'Paracas', 'San Andrés'],
    'Nasca': ['Nasca', 'Vista Alegre']
  },
  'Junín': {
    'Huancayo': ['Huancayo', 'El Tambo', 'Chilca', 'Pilcomayo', 'Huancán'],
    'Chanchamayo': ['La Merced', 'San Ramón', 'Pichanaqui'],
    'Satipo': ['Satipo', 'Mazamari', 'Pangoa'],
    'Tarma': ['Tarma', 'Acobamba']
  },
  'Ancash': {
    'Huaraz': ['Huaraz', 'Independencia', 'Tarica'],
    'Santa': ['Chimbote', 'Nuevo Chimbote', 'Coishco', 'Nepeña', 'Casma']
  },
  'Cajamarca': {
    'Cajamarca': ['Cajamarca', 'Baños del Inca', 'Jesús'],
    'Jaén': ['Jaén', 'Bellavista'],
    'Chota': ['Chota', 'Lajas']
  },
  'Loreto': {
    'Maynas': ['Iquitos', 'Punchana', 'Belén', 'San Juan Bautista'],
    'Alto Amazonas': ['Yurimaguas']
  },
  'Puno': {
    'Puno': ['Puno', 'Chucuito', 'Acora'],
    'San Román': ['Juliaca', 'Caracoto']
  },
  'San Martín': {
    'San Martín': ['Tarapoto', 'La Banda de Shilcayo', 'Morales'],
    'Rioja': ['Rioja', 'Nueva Cajamarca'],
    'Moyobamba': ['Moyobamba', 'Jepelacio']
  },
  'Tacna': {
    'Tacna': ['Tacna', 'Coronel Gregorio Albarracín Lanchipa', 'Ciudad Nueva', 'Alto de la Alianza', 'Pocollay']
  },
  'Ucayali': {
    'Coronel Portillo': ['Pucallpa (Callería)', 'Yarinacocha', 'Manantay']
  }
};

const DEPARTAMENTOS_PERU = Object.keys(DATOS_UBIGEO_PERU);

export default function UserProfileView({ onNavigate, products = [] }) {
  const { 
    currentUser, 
    isAdmin,
    userProfile, 
    userAddresses, 
    userOrders, 
    userFavorites = [],
    saveUserProfile, 
    addAddress, 
    removeAddress, 
    setIsLogoutConfirmOpen,
    logout,
    setActiveReviewModalProduct
  } = useAuth();

  const [activeTab, setActiveTab] = useState('Perfil'); // 'Perfil' | 'Direcciones' | 'Pedidos'
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(userProfile || {
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    genero: '',
    fechaNacimiento: '',
    telefono: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Formulario de nueva dirección iniciando por defecto en Perú y con departamento, provincia y distrito VACÍOS
  const [addressForm, setAddressForm] = useState({
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    direccionExacta: '',
    referencia: ''
  });
  const [addrSuccess, setAddrSuccess] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setProfileForm(userProfile);
    }
  }, [userProfile]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    await saveUserProfile(profileForm);
    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addressForm.departamento || !addressForm.provincia || !addressForm.distrito) {
      alert('Por favor selecciona tu Departamento, Provincia y Distrito.');
      return;
    }
    if (!addressForm.direccionExacta.trim()) {
      alert('Por favor ingresa tu dirección exacta (calle, avenida y número).');
      return;
    }
    await addAddress(addressForm);
    setAddressForm({
      pais: 'Perú',
      departamento: '',
      provincia: '',
      distrito: '',
      direccionExacta: '',
      referencia: ''
    });
    setAddrSuccess(true);
    setIsAddingAddress(false);
    setTimeout(() => setAddrSuccess(false), 3500);
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <h3 className="font-extrabold text-xl text-slate-800">Debes iniciar sesión para ver este apartado</h3>
        <button onClick={() => onNavigate && onNavigate('store')} className="btn btn-primary">
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-[1280px] mx-auto px-4 sm:px-8">
      {/* ÚNICO GRAN RECUADRO BLANCO centrado con ancho máximo controlado y sin desborde (overflow-x-hidden) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden">
        
        {/* Contenedor Flexbox en fila con justify-content: flex-start y gap: 30px para que el contenido se pegue al menú sin dispersarse */}
        <div 
          className="flex flex-col sm:flex-row items-stretch justify-start"
          style={{ gap: '30px', justifyContent: 'flex-start' }}
        >
          
          {/* MENÚ LATERAL con ancho controlado (width: 250px; box-sizing: border-box;) */}
          <aside 
            className="w-full sm:w-[250px] shrink-0 flex flex-col justify-between sm:border-r sm:border-slate-100 sm:pr-6"
            style={{ width: '250px', boxSizing: 'border-box' }}
          >
            <div className="space-y-6">
              {/* Cabecera del usuario / Hola! */}
              <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                  <User size={28} />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-slate-400 block">Hola!</span>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight truncate">
                    {currentUser.name}
                  </h3>
                </div>
              </div>

              {/* Opciones de Navegación (ÚNICAS solicitadas: Perfil, Direcciones, Pedidos, Salir) */}
              <nav className="flex flex-col space-y-1.5">
                <button
                  onClick={() => { setActiveTab('Perfil'); setIsAddingAddress(false); }}
                  className={`text-left px-4 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                    activeTab === 'Perfil'
                      ? 'border-l-4 border-primary pl-3 bg-primary/10 text-primary shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <User size={18} />
                  <span>Perfil</span>
                </button>

                {!isAdmin && (
                  <>
                    <button
                      onClick={() => { setActiveTab('Direcciones'); setIsAddingAddress(false); }}
                      className={`text-left px-4 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === 'Direcciones'
                          ? 'border-l-4 border-primary pl-3 bg-primary/10 text-primary shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={18} />
                        <span>Direcciones</span>
                      </div>
                      {userAddresses.length > 0 && (
                        <span className="bg-slate-200 text-slate-700 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                          {userAddresses.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setActiveTab('Pedidos'); setIsAddingAddress(false); }}
                      className={`text-left px-4 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === 'Pedidos'
                          ? 'border-l-4 border-primary pl-3 bg-primary/10 text-primary shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag size={18} />
                        <span>Pedidos</span>
                      </div>
                      {userOrders.length > 0 && (
                        <span className="bg-slate-200 text-slate-700 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                          {userOrders.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => { setActiveTab('Favoritos'); setIsAddingAddress(false); }}
                      className={`text-left px-4 py-3 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === 'Favoritos'
                          ? 'border-l-4 border-primary pl-3 bg-primary/10 text-primary shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart size={18} />
                        <span>Mis Favoritos</span>
                      </div>
                      {userFavorites.length > 0 && (
                        <span className="bg-rose-100 text-rose-600 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                          {userFavorites.length}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* Botón Salir anclado al fondo */}
            <div className="pt-6 mt-auto border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="text-left px-4 py-3 rounded-2xl font-extrabold text-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 w-full cursor-pointer"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          </aside>

          {/* CONTENIDO PRINCIPAL a la derecha con flex: 1, max-width: 800px y box-sizing: border-box para nunca desbordarse */}
          <main 
            className="w-full min-w-0 sm:pl-2"
            style={{ flex: '1 1 0%', maxWidth: '800px', boxSizing: 'border-box' }}
          >
            
            {/* ====================================================
                APARTADO: MIS FAVORITOS
            ==================================================== */}
            {activeTab === 'Favoritos' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 flex items-center gap-3">
                    <Heart className="text-rose-500 fill-rose-100" size={32} />
                    Mis Favoritos
                  </h2>
                </div>
                {userFavorites.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Heart size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="font-extrabold text-xl text-slate-700">Aún no tienes favoritos</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                      Explora nuestro catálogo y guarda los productos que más le gusten a tu mascota dándole clic al corazón.
                    </p>
                    <button 
                      onClick={() => onNavigate && onNavigate('store')} 
                      className="btn btn-primary px-8 py-3 text-sm font-black shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                    >
                      Ir a la Tienda
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.filter(p => userFavorites.includes(p.id)).map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ====================================================
                APARTADO 1: PERFIL (Al lado derecho de las opciones DENTRO del recuadro)
            ==================================================== */}
            {activeTab === 'Perfil' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900">Perfil</h2>
                  {saveSuccess && (
                    <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-xs animate-pulse">
                      <CheckCircle size={15} /> ¡Perfil guardado en base de datos!
                    </span>
                  )}
                </div>

                {/* Formulario integrado perfectamente en el lado derecho del recuadro */}
                <form onSubmit={handleSaveProfile} className="space-y-10 pt-2">
                  
                  {/* Grid de 2 columnas amplias y alineadas fila por fila (sm:grid-cols-2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-14 lg:gap-x-20 gap-y-7 items-start">
                    
                    {/* FILA 1: Nombre */}
                    <div>
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Nombre
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.nombre}
                          onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                          placeholder="Ej. Jonathan"
                          className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                        />
                      ) : (
                        <div className="text-base font-medium text-slate-800 py-1">
                          {profileForm.nombre || <span className="text-slate-400 font-normal italic">No especificado</span>}
                        </div>
                      )}
                    </div>

                    {/* FILA 1: Apellido */}
                    <div>
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Apellido
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.apellido}
                          onChange={(e) => setProfileForm({ ...profileForm, apellido: e.target.value })}
                          placeholder="Ej. García"
                          className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                        />
                      ) : (
                        <div className="text-base font-medium text-slate-800 py-1">
                          {profileForm.apellido || <span className="text-slate-400 font-normal italic">No especificado</span>}
                        </div>
                      )}
                    </div>

                    {/* FILA 2: Email */}
                    <div className="pr-4 sm:pr-6 overflow-hidden">
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Email
                      </label>
                      <div className="text-base font-medium text-slate-500 py-1 break-all">
                        {profileForm.email || currentUser.email || 'correo@ejemplo.com'}
                      </div>
                    </div>

                    {/* FILA 2: Celda vacía en la derecha frente al Email */}
                    <div className="hidden sm:block"></div>

                    {/* FILA 3: Documento de Identidad */}
                    <div>
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Documento de Identidad
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.documento}
                          onChange={(e) => setProfileForm({ ...profileForm, documento: e.target.value })}
                          placeholder="DNI / CE"
                          className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                        />
                      ) : (
                        <div className="text-base font-medium text-slate-800 py-1">
                          {profileForm.documento || <span className="text-slate-400 font-normal italic">No registrado</span>}
                        </div>
                      )}
                    </div>

                    {/* FILA 3: Género */}
                    <div>
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Género
                      </label>
                      {isEditingProfile ? (
                        <select
                          value={profileForm.genero}
                          onChange={(e) => setProfileForm({ ...profileForm, genero: e.target.value })}
                          className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                        >
                          <option value="">Selecciona género</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                          <option value="Prefiero no decir">Prefiero no decir</option>
                        </select>
                      ) : (
                        <div className="text-base font-medium text-slate-800 py-1">
                          {profileForm.genero || <span className="text-slate-400 font-normal italic">No especificado</span>}
                        </div>
                      )}
                    </div>

                    {/* FILA 4: Fecha de nacimiento */}
                    <div>
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Fecha de nacimiento
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="date"
                          value={profileForm.fechaNacimiento}
                          onChange={(e) => setProfileForm({ ...profileForm, fechaNacimiento: e.target.value })}
                          className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                        />
                      ) : (
                        <div className="text-base font-medium text-slate-800 py-1">
                          {profileForm.fechaNacimiento || <span className="text-slate-400 font-normal italic">DD/MM/AAAA</span>}
                        </div>
                      )}
                    </div>

                    {/* FILA 4: Teléfono */}
                    <div>
                      <label className="block text-sm font-normal text-slate-700 mb-2">
                        Teléfono
                      </label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileForm.telefono}
                          onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })}
                          placeholder="Ej. 987654321"
                          className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                        />
                      ) : (
                        <div className="text-base font-medium text-slate-800 py-1">
                          {profileForm.telefono || <span className="text-slate-400 font-normal italic">No registrado</span>}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Botón EDITAR abajo a la derecha */}
                  <div className="flex justify-end pt-4">
                    {isEditingProfile ? (
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => { setIsEditingProfile(false); setProfileForm(userProfile); }}
                          className="px-6 py-3 rounded-full font-extrabold text-xs text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer uppercase tracking-wider"
                        >
                          CANCELAR
                        </button>
                        <button
                          type="submit"
                          className="bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
                        >
                          <Save size={16} /> GUARDAR EN BASE DE DATOS
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 select-none"
                      >
                        EDITAR PERFIL
                      </button>
                    )}
                  </div>

                </form>
              </div>
            )}

            {/* APARTADO 2: DIRECCIONES (Al lado derecho dentro del gran recuadro) */}
            {!isAdmin && activeTab === 'Direcciones' && (
              <div className="space-y-8">
                
                {/* Direcciones ya guardadas */}
                {userAddresses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-xl text-slate-900">Mis Direcciones Guardadas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {userAddresses.map((addr) => (
                        <div key={addr.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs group hover:border-primary/60 transition-all">
                          {/* Contenedor Flexbox horizontal (display: flex; flex-direction: row; justify-content: space-between; align-items: center;) */}
                          <div className="flex flex-row justify-between items-center gap-4">
                            
                            {/* Bloque de texto de la dirección a la izquierda */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div>
                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mb-1.5">
                                  {addr.pais} • {addr.departamento}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-base text-slate-900 truncate">
                                {addr.direccionExacta || `${addr.distrito}, ${addr.provincia}`}
                              </h4>
                              <p className="text-xs font-semibold text-slate-500">
                                {addr.distrito}, {addr.provincia} - {addr.departamento}
                              </p>
                            </div>

                            {/* Botón / Icono del tacho empujado al extremo derecho con margin-left: auto; (ml-auto) y sin position: absolute */}
                            <button 
                              onClick={() => setAddressToDelete(addr)}
                              className="ml-auto shrink-0 text-slate-400 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                              title="Eliminar dirección"
                            >
                              <Trash2 size={20} />
                            </button>

                          </div>

                          {addr.referencia && (
                            <p className="text-xs text-slate-400 mt-3 italic border-t border-slate-100 pt-2.5">
                              Ref: {addr.referencia}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Si no está añadiendo dirección ni hay direcciones: Vista de bienvenida de Direcciones */}
                {!isAddingAddress && userAddresses.length === 0 && (
                  <div className="space-y-8 pt-2">
                    {/* Cabecera idéntica a tu Imagen 2 */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => { setActiveTab('Perfil'); }}
                          className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                        >
                          ← ATRÁS
                        </button>
                        <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900">Direcciones</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(true)}
                        className="bg-[#FFD100] hover:bg-[#ffdf4d] text-[#00A8E8] font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-sm border border-[#00A8E8]/40 transition-all cursor-pointer"
                      >
                        AÑADIR DIRECCIÓN
                      </button>
                    </div>

                    <div className="py-16 text-center">
                      <p className="text-base font-medium text-slate-600">
                        No tienes ninguna dirección registrada.
                      </p>
                    </div>
                  </div>
                )}

                {/* Si ya hay direcciones pero NO estamos en modo añadir: Botón superior para añadir más */}
                {!isAddingAddress && userAddresses.length > 0 && (
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="bg-[#FFD100] hover:bg-[#ffdf4d] text-[#00A8E8] font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-sm border border-[#00A8E8]/40 transition-all cursor-pointer flex items-center gap-2"
                    >
                      + AÑADIR DIRECCIÓN
                    </button>
                  </div>
                )}

                {/* Formulario de Añadir Dirección */}
                {isAddingAddress && (
                  <div className="space-y-8 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                        >
                          ← DIRECCIONES
                        </button>
                        <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900">Añadir Dirección</h2>
                      </div>
                    </div>

                    <form onSubmit={handleAddAddressSubmit} className="space-y-6">
                      {addrSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                          <CheckCircle size={18} /> ¡Nueva dirección guardada correctamente!
                        </div>
                      )}

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-normal text-slate-700 mb-1.5">País</label>
                          <select
                            value={addressForm.pais}
                            onChange={(e) => setAddressForm({
                              ...addressForm, 
                              pais: e.target.value,
                              departamento: '',
                              provincia: '',
                              distrito: ''
                            })}
                            className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all cursor-pointer shadow-xs"
                          >
                            <option value="Perú">Perú</option>
                            <option value="Chile">Chile</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="México">México</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-normal text-slate-700 mb-1.5">Departamento</label>
                          {addressForm.pais === 'Perú' ? (
                            <select
                              required
                              value={addressForm.departamento}
                              onChange={(e) => setAddressForm({
                                ...addressForm, 
                                departamento: e.target.value,
                                provincia: '',
                                distrito: ''
                              })}
                              className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all cursor-pointer shadow-xs"
                            >
                              <option value="">Selecciona un departamento...</option>
                              {DEPARTAMENTOS_PERU.map((dep) => (
                                <option key={dep} value={dep}>{dep}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              required
                              value={addressForm.departamento}
                              onChange={(e) => setAddressForm({...addressForm, departamento: e.target.value})}
                              placeholder="Ingresa tu región o estado..."
                              className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-normal text-slate-700 mb-1.5">Provincia</label>
                          {addressForm.pais === 'Perú' ? (
                            <select
                              required
                              disabled={!addressForm.departamento}
                              value={addressForm.provincia}
                              onChange={(e) => setAddressForm({
                                ...addressForm, 
                                provincia: e.target.value,
                                distrito: ''
                              })}
                              className={`w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none transition-all cursor-pointer shadow-xs ${
                                !addressForm.departamento ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-900'
                              }`}
                            >
                              <option value="">
                                {addressForm.departamento ? 'Selecciona una provincia...' : 'Primero selecciona un departamento'}
                              </option>
                              {addressForm.departamento && DATOS_UBIGEO_PERU[addressForm.departamento] && (
                                Object.keys(DATOS_UBIGEO_PERU[addressForm.departamento]).map((prov) => (
                                  <option key={prov} value={prov}>{prov}</option>
                                ))
                              )}
                            </select>
                          ) : (
                            <input
                              type="text"
                              required
                              value={addressForm.provincia}
                              onChange={(e) => setAddressForm({...addressForm, provincia: e.target.value})}
                              placeholder="Ingresa tu provincia..."
                              className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-normal text-slate-700 mb-1.5">Distrito</label>
                          {addressForm.pais === 'Perú' ? (
                            <select
                              required
                              disabled={!addressForm.provincia}
                              value={addressForm.distrito}
                              onChange={(e) => setAddressForm({...addressForm, distrito: e.target.value})}
                              className={`w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none transition-all cursor-pointer shadow-xs ${
                                !addressForm.provincia ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'text-slate-900'
                              }`}
                            >
                              <option value="">
                                {addressForm.provincia ? 'Selecciona un distrito...' : 'Primero selecciona una provincia'}
                              </option>
                              {addressForm.departamento && addressForm.provincia && DATOS_UBIGEO_PERU[addressForm.departamento]?.[addressForm.provincia] && (
                                DATOS_UBIGEO_PERU[addressForm.departamento][addressForm.provincia].map((dist) => (
                                  <option key={dist} value={dist}>{dist}</option>
                                ))
                              )}
                            </select>
                          ) : (
                            <input
                              type="text"
                              required
                              value={addressForm.distrito}
                              onChange={(e) => setAddressForm({...addressForm, distrito: e.target.value})}
                              placeholder="Ingresa tu distrito o ciudad..."
                              className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all shadow-xs"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-normal text-slate-700 mb-1.5">Dirección exacta</label>
                          <input
                            type="text"
                            required
                            value={addressForm.direccionExacta}
                            onChange={(e) => setAddressForm({...addressForm, direccionExacta: e.target.value})}
                            placeholder="Calle, Av, Jr., Nro, Dpto/Int..."
                            className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-normal text-slate-700 mb-1.5">Referencia</label>
                          <input
                            type="text"
                            value={addressForm.referencia}
                            onChange={(e) => setAddressForm({...addressForm, referencia: e.target.value})}
                            placeholder="Frente al parque, casa color blanca..."
                            className="w-full font-semibold text-base rounded-2xl px-4 py-3 bg-white border border-slate-300 focus:border-primary outline-none text-slate-900 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button
                          type="submit"
                          className="w-full bg-[#FFD100] hover:bg-[#ffdf4d] text-[#00A8E8] font-extrabold text-base uppercase tracking-wider py-4 rounded-2xl shadow-md border border-[#00A8E8]/40 transition-all cursor-pointer"
                        >
                          AÑADIR DIRECCIÓN
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* APARTADO 3: PEDIDOS (Al lado derecho dentro del gran recuadro) */}
            {!isAdmin && activeTab === 'Pedidos' && (
              <div className="space-y-6 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900">Mis Pedidos Guardados</h2>
                    <p className="text-xs text-slate-500 mt-1">Historial en vivo y estado de pago verificado por almacén</p>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-black px-3.5 py-1.5 rounded-full self-start sm:self-center">
                    {userOrders.length} {userOrders.length === 1 ? 'pedido en base de datos' : 'pedidos en base de datos'}
                  </span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                      <ShoppingBag size={32} />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-700">Aún no tienes pedidos registrados</h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      Todos los pedidos en vivo que realices en la tienda quedarán registrados de forma segura en la base de datos para tu seguimiento.
                    </p>
                    <button
                      onClick={() => onNavigate && onNavigate('store')}
                      className="btn btn-primary px-8 py-3.5 text-xs font-black rounded-full mt-3 shadow-md shadow-primary/20 cursor-pointer"
                    >
                      Ir al Catálogo de Tienda
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {userOrders.map(order => {
                      const orderDate = new Date(order.timestamp || order.createdAt || order.date || Date.now()).toLocaleString();
                      const paymentState = order.paymentStatus || 'Pendiente de pago';
                      const isRecojo = order.customer?.deliveryMethod === 'recojo' || order.customer?.deliveryType === 'Recojo en tienda';
                      const itemsList = Array.isArray(order.items) ? order.items : [];

                      return (
                        <div key={order.id} className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-primary/40 transition-all">
                          {/* Encabezado: Nº Boleta, Fecha y Estados */}
                          <div className="flex flex-wrap items-center justify-between border-b border-slate-200/60 pb-3.5 gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 uppercase bg-white border border-slate-300 px-2.5 py-1 rounded-lg shadow-2xs">
                                  {order.boletaNumber ? `Pedido #${order.boletaNumber}` : `Pedido #${order.id.slice(-6).toUpperCase()}`}
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                                  {order.status || 'Completado'}
                                </span>
                              </div>
                              <div className="text-xs font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-400" />
                                <span>{orderDate}</span>
                              </div>
                            </div>

                            {/* Estado de Pago Marcado por Admin */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Estado de Pago:</span>
                              <span className={`text-xs font-black px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1.5 uppercase ${
                                paymentState === 'Pago' || paymentState === 'Pagado'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : paymentState === 'No pago' || paymentState === 'No pagado'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                                {(paymentState === 'Pago' || paymentState === 'Pagado') && '✅ '}
                                {(paymentState === 'No pago' || paymentState === 'No pagado') && '❌ '}
                                {paymentState !== 'Pago' && paymentState !== 'Pagado' && paymentState !== 'No pago' && paymentState !== 'No pagado' && '⏳ '}
                                {paymentState}
                              </span>
                            </div>
                          </div>

                          {/* Método y Dirección de Entrega */}
                          <div className="bg-white rounded-xl p-3.5 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{isRecojo ? '🏬' : '🛵'}</span>
                              <div>
                                <span className="font-extrabold text-slate-800 block">
                                  {isRecojo ? 'Recojo en Tienda' : 'Delivery a Domicilio'}
                                </span>
                                <span className="text-slate-500 font-medium truncate max-w-sm block">
                                  {order.customer?.address || 'Sin dirección especificada'}
                                </span>
                              </div>
                            </div>
                            {order.customer?.phone && (
                              <div className="text-slate-500 font-medium sm:text-right">
                                Tel/DNI: <strong className="text-slate-800 font-extrabold">{order.customer.phone}</strong>
                              </div>
                            )}
                          </div>

                          {/* Lista de Ítems del Pedido */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                              Productos en la compra ({itemsList.reduce((acc, it) => acc + (it.quantity || 1), 0)} ítems)
                            </h4>
                            <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                              {itemsList.map((item, idx) => {
                                const qty = item.quantity || 1;
                                const price = Number(item.price || 0);
                                return (
                                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs gap-3">
                                    <div className="flex items-center gap-2.5 pr-2 min-w-0">
                                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                        {qty}
                                      </span>
                                      {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded object-contain bg-slate-50 border border-slate-100 shrink-0" />
                                      )}
                                      <span className="font-bold text-slate-800 leading-tight truncate">
                                        {item.name || 'Producto del catálogo'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="font-black text-slate-900">
                                        S/ {(qty * price).toFixed(2)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveReviewModalProduct({
                                            id: item.id || item.productId || `prod_${idx}`,
                                            name: item.name || 'Producto del catálogo',
                                            image: item.imageUrl || item.image || '',
                                            price: item.price || 0,
                                            category: item.category || 'general'
                                          });
                                        }}
                                        className="btn btn-outline py-1 px-2.5 text-[11px] font-extrabold flex items-center gap-1 text-primary border-primary/30 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                      >
                                        <span>⭐ Opinar</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Pie: Total y Botón de Boleta */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200/60 gap-3">
                            <div>
                              <span className="text-xs text-slate-500 block font-medium">Total Pagado / a Pagar</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-black text-primary">
                                  S/ {Number(order.total || 0).toFixed(2)}
                                </span>
                                {order.customer?.shippingCost > 0 && (
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    (Incl. S/ {Number(order.customer.shippingCost).toFixed(2)} envío)
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedOrderForReceipt(order)}
                              className="btn bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-2.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                            >
                              <span>📄</span>
                              <span>Ver Boleta / Ticket</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR DIRECCIÓN */}
      <ConfirmDeleteModal 
        isOpen={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        onConfirm={async () => {
          if (addressToDelete) {
            await removeAddress(addressToDelete.id);
            setAddressToDelete(null);
          }
        }}
        title="¿Deseas eliminar esta dirección?"
        message={`Estás a punto de eliminar la dirección de "${addressToDelete?.distrito || ''}, ${addressToDelete?.provincia || ''}". Esta acción no se puede deshacer.`}
      />

      {/* MODAL DE BOLETA / TICKET DE VENTA */}
      {selectedOrderForReceipt && (
        <ReceiptModal 
          isOpen={Boolean(selectedOrderForReceipt)}
          onClose={() => setSelectedOrderForReceipt(null)}
          order={selectedOrderForReceipt}
        />
      )}
    </div>
  );
}

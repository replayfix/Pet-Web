import React, { useState } from 'react';
import { adjustStock, deleteProduct, seedInitialProducts } from '../../firebase/dbService';
import ProductModal from './ProductModal';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import { 
  Boxes, 
  Plus, 
  AlertTriangle, 
  DollarSign, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Database,
  Filter,
  PackageCheck,
  PackageX,
  Sparkles,
  Check,
  Search
} from 'lucide-react';

export default function InventoryDashboard({ products, searchQuery, setSearchQuery }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'low' | 'out' | 'healthy'
  const [filterCategory, setFilterCategory] = useState('all');
  const [notification, setNotification] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleOpenNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
  };

  const handleStockAdjustment = async (product, delta) => {
    try {
      const newStock = await adjustStock(product.id, product.stock, delta);
      showNotify(`Stock de "${product.name.slice(0, 20)}..." actualizado a ${newStock} unidades.`);
    } catch (error) {
      alert('Error al ajustar el stock.');
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const count = await seedInitialProducts();
      showNotify(`¡${count} productos cargados en Firebase con éxito!`);
    } catch (error) {
      alert('Error al inicializar productos.');
    } finally {
      setIsSeeding(false);
    }
  };

  // KPIs de inventario
  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5)).length;
  const totalValuation = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stock || 0)), 0);

  // Filtrado
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'out') matchesStatus = p.stock <= 0;
    else if (filterStatus === 'low') matchesStatus = p.stock > 0 && p.stock <= (p.minStock || 5);
    else if (filterStatus === 'healthy') matchesStatus = p.stock > (p.minStock || 5);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="py-6 space-y-6 animate-fade-in">
      
      {/* Banner Superior de Control del Administrador */}
      <div className="bg-slate-900 text-white rounded-[24px] p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Boxes size={14} />
            <span>Módulo de Gestión de Almacén en Tiempo Real</span>
          </div>
          <h1 className="font-extrabold text-2xl md:text-3xl">
            Control de Inventario Pet-Web
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
            Cualquier cambio realizado en esta tabla o ajuste de stock se refleja de forma automática en la tienda del cliente y en tu base de datos Firebase.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          {products.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="btn bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-extrabold px-4 py-2.5 shadow-md flex items-center gap-1.5"
            >
              <Sparkles size={16} />
              <span>{isSeeding ? 'Cargando Catálogo...' : 'Cargar Productos Iniciales (Seed)'}</span>
            </button>
          )}

          <button 
            onClick={handleOpenNew}
            className="btn btn-primary text-xs font-extrabold px-5 py-2.5 shadow-lg shadow-primary/30 flex items-center gap-1.5"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Notificación flotante / temporal */}
      {notification && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in">
          <Check size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card p-5 bg-white border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-bold">
            <Boxes size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catálogo</span>
            <h3 className="font-black text-2xl text-slate-900">{totalProducts} <span className="text-xs font-normal text-slate-400">ítems</span></h3>
          </div>
        </div>

        <div 
          onClick={() => setFilterStatus(filterStatus === 'low' ? 'all' : 'low')}
          className={`card p-5 bg-white border cursor-pointer transition-all flex items-center gap-4 ${
            filterStatus === 'low' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-100 hover:border-amber-300'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Stock Crítico / Bajo</span>
            <h3 className="font-black text-2xl text-slate-900">{lowStockCount} <span className="text-xs font-normal text-slate-400">productos</span></h3>
          </div>
        </div>

        <div 
          onClick={() => setFilterStatus(filterStatus === 'out' ? 'all' : 'out')}
          className={`card p-5 bg-white border cursor-pointer transition-all flex items-center gap-4 ${
            filterStatus === 'out' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-100 hover:border-red-300'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <PackageX size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Agotados (0 stock)</span>
            <h3 className="font-black text-2xl text-slate-900">{outOfStockCount} <span className="text-xs font-normal text-slate-400">productos</span></h3>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valorización Almacén</span>
            <h3 className="font-black text-2xl text-slate-900">S/ {totalValuation.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

      </div>

      {/* Controles de Filtros y Búsqueda en Tabla */}
      <div className="card p-4 sm:p-5 bg-white border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 shrink-0">
            <Filter size={14} /> Filtros:
          </span>

          {/* Barra de Búsqueda colocada al lado de Filtros */}
          <div className="relative flex items-center flex-1 min-w-[220px] max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Buscar en inventario (ID, Nombre, Categoría)..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery ? setSearchQuery(e.target.value) : null}
              className="w-full pl-9 pr-8 py-1.5 text-xs font-medium bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            {searchQuery && setSearchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="all">Todas las Categorías</option>
            <option value="comida">🍖 Comida</option>
            <option value="accesorios">🦴 Accesorios</option>
            <option value="medicinas">💊 Medicinas</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="all">Todo el Estado</option>
            <option value="healthy">📦 En Stock Seguro</option>
            <option value="low">⚠️ Stock Bajo</option>
            <option value="out">🚫 Agotado</option>
          </select>

          {(filterCategory !== 'all' || filterStatus !== 'all' || searchQuery) && (
            <button 
              onClick={() => { setFilterCategory('all'); setFilterStatus('all'); if (setSearchQuery) setSearchQuery(''); }}
              className="text-xs text-primary font-bold underline px-2 cursor-pointer hover:text-primary-dark"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong className="text-slate-800">{filteredProducts.length}</strong> de <strong className="text-slate-800">{products.length}</strong> productos
        </div>
      </div>

      {/* TABLA DE PRODUCTOS EN ALMACÉN */}
      <div className="table-container shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white">
            <PackageCheck size={40} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700">No se encontraron productos con estos criterios</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Intenta cambiar la búsqueda o haz clic en "Nuevo Producto" o "Cargar Productos Iniciales" si tu base de datos aún está vacía.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto & Imagen</th>
                <th>Categoría / Mascota</th>
                <th>Precio Venta</th>
                <th>Stock / Existencias</th>
                <th>Ajuste Rápido de Stock</th>
                <th>Estado Visual</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isOut = product.stock <= 0;
                const isLow = !isOut && product.stock <= (product.minStock || 5);

                return (
                  <tr key={product.id}>
                    
                    {/* Producto */}
                    <td>
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.imageUrl || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80"} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h5 className="font-extrabold text-xs text-slate-900 truncate" title={product.name}>
                            {product.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ID: {product.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td>
                      <div className="flex flex-col gap-1 items-start">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                          {product.category || 'general'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Para {product.petType || 'todos'}
                        </span>
                      </div>
                    </td>

                    {/* Precio */}
                    <td>
                      <span className="font-black text-sm text-slate-900">
                        S/ {Number(product.price || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Stock y Alerta Mínima */}
                    <td>
                      <div className="flex flex-col">
                        <span className={`font-black text-base ${
                          isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {product.stock} <span className="text-[11px] font-normal text-slate-400">und.</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Mín. requerido: {product.minStock || 5}
                        </span>
                      </div>
                    </td>

                    {/* Botones de ajuste de entrada/salida de almacén (+ / -) */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleStockAdjustment(product, -1)}
                          disabled={product.stock <= 0}
                          title="Restar 1 unidad"
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-extrabold flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-red-50 disabled:hover:text-red-600"
                        >
                          -1
                        </button>
                        <button 
                          onClick={() => handleStockAdjustment(product, 1)}
                          title="Ingresar 1 unidad al almacén"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-extrabold flex items-center justify-center transition-all"
                        >
                          +1
                        </button>
                        <button 
                          onClick={() => handleStockAdjustment(product, 10)}
                          title="Ingresar lote de 10 unidades"
                          className="px-2 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white font-extrabold text-[11px] flex items-center justify-center transition-all"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    {/* Estado visual */}
                    <td>
                      {isOut ? (
                        <span className="badge badge-danger text-[10px]">🚫 Agotado</span>
                      ) : isLow ? (
                        <span className="badge badge-warning text-[10px]">⚠️ Stock Bajo</span>
                      ) : (
                        <span className="badge badge-success text-[10px]">📦 Normal</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          title="Editar producto"
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product)}
                          title="Eliminar producto"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-500 flex items-center justify-center transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Crear / Editar */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSaveSuccess={(msg) => showNotify(msg)}
      />

      {/* Modal de Confirmación para Eliminar Producto */}
      <ConfirmDeleteModal 
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={async () => {
          if (productToDelete) {
            try {
              await deleteProduct(productToDelete.id);
              showNotify(`Producto "${productToDelete.name}" eliminado.`);
            } catch (error) {
              alert('Error al eliminar producto.');
            }
            setProductToDelete(null);
          }
        }}
        title="¿Deseas eliminar este producto?"
        message={`Estás a punto de eliminar "${productToDelete?.name || ''}" del catálogo general. Esta acción retirará el ítem del inventario y de la tienda en vivo.`}
      />
    </div>
  );
}

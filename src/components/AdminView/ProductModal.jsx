import React, { useState, useEffect } from 'react';
import { addProduct, updateProduct } from '../../firebase/dbService';
import { X, Save, Box, Image as ImageIcon, DollarSign, AlertTriangle } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, productToEdit, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'comida',
    petType: 'perro',
    price: '',
    stock: '',
    minStock: 5,
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        category: productToEdit.category || 'comida',
        petType: productToEdit.petType || 'perro',
        price: productToEdit.price || '',
        stock: productToEdit.stock || 0,
        minStock: productToEdit.minStock || 5,
        description: productToEdit.description || '',
        imageUrl: productToEdit.imageUrl || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'comida',
        petType: 'perro',
        price: '',
        stock: '',
        minStock: 5,
        description: '',
        imageUrl: ''
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.price || formData.stock === '') {
      setError('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    setLoading(true);
    try {
      if (productToEdit && productToEdit.id) {
        await updateProduct(productToEdit.id, formData);
      } else {
        await addProduct(formData);
      }
      onSaveSuccess(productToEdit ? 'Producto actualizado con éxito.' : 'Nuevo producto registrado en el almacén.');
      onClose();
    } catch (err) {
      setError('Ocurrió un error al guardar en Firebase Firestore.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <Box size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                {productToEdit ? 'Editar Producto de Almacén' : 'Registrar Nuevo Producto'}
              </h3>
              <p className="text-xs text-slate-400">Sincronización instantánea con tienda y Firebase</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="form-group md:col-span-2">
              <label className="form-label">Nombre del Producto *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej. Alimento Premium Perro Cachorro 10kg"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input text-sm font-semibold"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-input text-sm font-semibold"
              >
                <option value="comida">🍖 Comida</option>
                <option value="accesorios">🦴 Accesorios</option>
                <option value="medicinas">💊 Medicinas & Cuidado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mascota Destinada *</label>
              <select 
                value={formData.petType}
                onChange={(e) => setFormData({...formData, petType: e.target.value})}
                className="form-input text-sm font-semibold"
              >
                <option value="perro">🐶 Perro</option>
                <option value="gato">🐱 Gato</option>
                <option value="aves">🦜 Aves</option>
                <option value="general">🐾 Uso General / Todos</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Precio de Venta (S/) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">S/</span>
                <input 
                  type="number" 
                  step="0.10" 
                  required 
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="form-input pl-9 text-sm font-black text-slate-900"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stock Actual en Almacén *</label>
              <input 
                type="number" 
                required 
                placeholder="Cantidad disponible"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="form-input text-sm font-black text-emerald-700"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Mínimo (Alerta crítica)</label>
              <input 
                type="number" 
                placeholder="Límite inferior para aviso"
                value={formData.minStock}
                onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                className="form-input text-sm"
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL de Imagen del Producto</label>
              <div className="relative">
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="form-input text-xs pl-8 font-mono"
                />
                <ImageIcon size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Descripción Técnica / Detalle del Producto</label>
              <textarea 
                rows="3" 
                placeholder="Descripción general, ingredientes, dosis o especificaciones técnicas..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input text-xs"
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline text-xs px-5 py-2.5"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary text-xs px-6 py-2.5 font-extrabold flex items-center gap-1.5"
            >
              <Save size={16} />
              <span>{loading ? 'Guardando en Firebase...' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Modal from '../UI/Modal/Modal';
import './EmprendimientoCard.css';
import { useAuth } from '../../context/AuthContext'; // Asegurate que la ruta sea correcta

const EmprendimientoCard = ({ emprendimiento, onUpdate, onDelete }) => {
  const { token } = useAuth(); // ✅ Token desde el contexto

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [editData, setEditData] = useState({
    nombreEmprendimiento: emprendimiento.nombreEmprendimiento,
    descripcion: emprendimiento.descripcion,
    categoriaEmprendimiento: emprendimiento.categoriaEmprendimiento
  });

  const [newProduct, setNewProduct] = useState({
    nombreProducto: '',
    descripcion: '',
    tipo: 'producto'
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES');
  };

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      const response = await fetch(`http://localhost:5000/api/productos/emprendimiento/${emprendimiento._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProductos(data);
    } catch {
      setProductos([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const response = await fetch(`http://localhost:5000/api/emprendimientos/${emprendimiento._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const updated = await response.json();
      onUpdate(updated.emprendimiento || updated);
      setShowEditModal(false);
    } catch (error) {
      alert('Error al actualizar emprendimiento');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await fetch(`http://localhost:5000/api/emprendimientos/${emprendimiento._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onDelete(emprendimiento._id);
      setShowDeleteModal(false);
    } catch {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAddingProduct(true);
      const response = await fetch('http://localhost:5000/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          emprendimientoId: emprendimiento._id
        })
      });

      if (!response.ok) throw new Error('Error al crear producto');

      await fetchProductos();
      setShowAddProductModal(false);
      setNewProduct({ nombreProducto: '', descripcion: '', tipo: 'producto' });
    } catch (err) {
      alert('Error al agregar producto');
    } finally {
      setIsAddingProduct(false);
    }
  };

  return (
    <>
      <div className="emprendimiento-card">
        <div className="card-header">
          <div className="card-category">
            <span className="category-badge">{emprendimiento.categoriaEmprendimiento}</span>
          </div>
          <div className="card-actions">
            <button className="action-btn edit-btn" onClick={() => setShowEditModal(true)} title="Editar">✏️</button>
            <button className="action-btn delete-btn" onClick={() => setShowDeleteModal(true)} title="Eliminar">🗑️</button>
          </div>
        </div>

        <div className="card-content">
          <h3 className="card-title">{emprendimiento.nombreEmprendimiento}</h3>
          <p className="card-description">{emprendimiento.descripcion}</p>

          <div className="card-stats">
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <span className="stat-text">Creado: {formatDate(emprendimiento.createdAt)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-text">
                {emprendimiento.promedioValoraciones > 0
                  ? `${emprendimiento.promedioValoraciones.toFixed(1)} estrellas`
                  : 'Sin valoraciones'}
              </span>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button className="btn-products" onClick={() => { setShowProductsModal(true); fetchProductos(); }}>
            📦 Ver Productos/Servicios
          </button>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Emprendimiento"
      >
        <form onSubmit={handleEditSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="edit-nombre">Nombre del Emprendimiento *</label>
            <input
              type="text"
              id="edit-nombre"
              value={editData.nombreEmprendimiento}
              onChange={(e) => setEditData(prev => ({ ...prev, nombreEmprendimiento: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-descripcion">Descripción *</label>
            <textarea
              id="edit-descripcion"
              value={editData.descripcion}
              onChange={(e) => setEditData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-categoria">Categoría *</label>
            <select
              id="edit-categoria"
              value={editData.categoriaEmprendimiento}
              onChange={(e) => setEditData(prev => ({ ...prev, categoriaEmprendimiento: e.target.value }))}
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="Ropa y Accesorios">Ropa y Accesorios</option>
              <option value="Hogar y Decoración">Hogar y Decoración</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Comidas y Bebidas">Comidas y Bebidas</option>
              <option value="Artesanías">Artesanías</option>
              <option value="Servicios Profesionales">Servicios Profesionales</option>
              <option value="Educación y Capacitación">Educación y Capacitación</option>
              <option value="Salud y Bienestar">Salud y Bienestar</option>
              <option value="Belleza y Cuidado Personal">Belleza y Cuidado Personal</option>
              <option value="Entretenimiento y Eventos">Entretenimiento y Eventos</option>
              <option value="Agricultura">Agricultura</option>
              <option value="Mascotas y Veterinaria">Mascotas y Veterinaria</option>
              <option value="Turismo">Turismo</option>
              <option value="Transporte y Logística">Transporte y Logística</option>
              <option value="Deportes y Recreación">Deportes y Recreación</option>
              <option value="Construcción">Construcción</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={isUpdating}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div className="delete-confirmation">
          <div className="warning-icon">⚠️</div>
          <h3>¿Estás seguro?</h3>
          <p>
            Esta acción eliminará permanentemente el emprendimiento <strong>{emprendimiento.nombreEmprendimiento}</strong> y todos sus productos/servicios asociados.
          </p>
          <p className="warning-text">Esta acción no se puede deshacer.</p>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>


      {/* Modal de Productos */}
      <Modal
        isOpen={showProductsModal}
        onClose={() => setShowProductsModal(false)}
        title={`Productos/Servicios de ${emprendimiento.nombreEmprendimiento}`}
        size="large"
      >
        <div className="products-modal-content">
          {loadingProductos ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : (
            <>
              <div className="products-header">
                <button className="btn-primary add-product-btn" onClick={() => setShowAddProductModal(true)}>
                  + Agregar Producto/Servicio
                </button>
              </div>

              {productos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>Sin productos/servicios</h3>
                  <p>Agrega tu primer producto o servicio para comenzar</p>
                </div>
              ) : (
                <div className="products-grid">
                  {productos.map(producto => (
                    <div key={producto._id} className="product-card">
                      <div className="product-header">
                        <span className={`product-type ${producto.tipo}`}>
                          {producto.tipo === 'producto' ? '📦' : '🛠️'} {producto.tipo}
                        </span>
                      </div>
                      <h4 className="product-name">{producto.nombreProducto}</h4>
                      <p className="product-description">{producto.descripcion}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Modal para Agregar Producto */}
      <Modal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        title="Agregar Producto o Servicio"
      >
        <form onSubmit={handleAddProductSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="nombreProducto">Nombre *</label>
            <input
              type="text"
              id="nombreProducto"
              value={newProduct.nombreProducto}
              onChange={(e) => setNewProduct(prev => ({ ...prev, nombreProducto: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcionProducto">Descripción *</label>
            <textarea
              id="descripcionProducto"
              value={newProduct.descripcion}
              onChange={(e) => setNewProduct(prev => ({ ...prev, descripcion: e.target.value }))}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo *</label>
            <select
              id="tipo"
              value={newProduct.tipo}
              onChange={(e) => setNewProduct(prev => ({ ...prev, tipo: e.target.value }))}
              required
            >
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddProductModal(false)}
              disabled={isAddingProduct}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isAddingProduct}
            >
              {isAddingProduct ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EmprendimientoCard;

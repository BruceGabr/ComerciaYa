import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from "./UI/Modal/Modal";
import './ProductoCard.css'; // Crea este archivo CSS

const ProductoCard = ({ producto, onUpdate, onDelete }) => {
    const { token, logout } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProducto, setEditProducto] = useState({ ...producto });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditProducto(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!editProducto.nombreProducto.trim() || !editProducto.descripcion.trim() || !editProducto.tipo) {
            setError('Todos los campos son obligatorios.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/productos/${producto._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombreProducto: editProducto.nombreProducto,
                    descripcion: editProducto.descripcion,
                    tipo: editProducto.tipo
                    // No se permite cambiar el emprendimiento_id desde aquí
                })
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al actualizar producto/servicio');
            }

            const data = await response.json();
            onUpdate(data.producto); // Notificar al padre que el producto se actualizó
            setShowEditModal(false);
        } catch (err) {
            console.error('Error updating producto:', err);
            setError(err.message || 'Error al actualizar producto/servicio');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${producto.nombreProducto}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/productos/${producto._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al eliminar producto/servicio');
            }

            onDelete(producto._id); // Notificar al padre que el producto fue eliminado
        } catch (err) {
            console.error('Error deleting producto:', err);
            setError(err.message || 'Error al eliminar producto/servicio');
        }
    };

    return (
        <div className="product-card">
            <h3>{producto.nombreProducto}</h3>
            <p className="product-description">{producto.descripcion}</p>
            <p className="product-type">Tipo: {producto.tipo}</p>
            {producto.emprendimiento && (
                <p className="product-emprendimiento">De: {producto.emprendimiento.nombreEmprendimiento}</p>
            )}
            {producto.imagenUrl && (
                <div className="product-image-container">
                    <img src={producto.imagenUrl} alt={producto.nombreProducto} className="product-image" />
                </div>
            )}
            <div className="product-actions">
                <button className="btn-edit" onClick={() => setShowEditModal(true)}>Editar</button>
                <button className="btn-delete" onClick={handleDelete}>Eliminar</button>
            </div>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Editar Producto/Servicio"
            >
                <form onSubmit={handleUpdate} className="edit-form">
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="editNombreProducto">Nombre *</label>
                        <input
                            type="text"
                            id="editNombreProducto"
                            name="nombreProducto"
                            value={editProducto.nombreProducto}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editDescripcionProducto">Descripción *</label>
                        <textarea
                            id="editDescripcionProducto"
                            name="descripcion"
                            value={editProducto.descripcion}
                            onChange={handleInputChange}
                            rows="4"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="editTipoProducto">Tipo *</label>
                        <select
                            id="editTipoProducto"
                            name="tipo"
                            value={editProducto.tipo}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="producto">Producto</option>
                            <option value="servicio">Servicio</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductoCard;
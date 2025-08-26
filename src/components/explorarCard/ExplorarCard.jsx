import React, { useState } from 'react';
import Modal from '../UI/Modal/Modal';
import './ExplorarCard.css';

const ExplorarCard = ({ emprendimiento }) => {
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES');
  };

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true);
      const response = await fetch(`http://localhost:5000/api/productos/emprendimiento/${emprendimiento._id}`);
      const data = await response.json();
      setProductos(data);
    } catch {
      setProductos([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Función para verificar si es un emprendimiento nuevo (últimos 7 días)
  const isNewEmprendimiento = () => {
    const createdDate = new Date(emprendimiento.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Función para renderizar las estrellas
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i}>⭐</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half">⭐</span>);
    }
    
    // Rellenar hasta 5 estrellas con estrellas vacías
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} style={{opacity: 0.3}}>⭐</span>);
    }
    
    return stars;
  };

  // Función mejorada para obtener el nombre del propietario
  const getPropietarioNombre = () => {
    const usuario = emprendimiento.usuario || emprendimiento.propietario;
    
    if (!usuario) return 'Usuario Anónimo';
    
    // Opciones de nombre en orden de preferencia
    const nombreCompleto = usuario.nombreCompleto;
    const nombreApellido = usuario.nombre && usuario.apellido 
      ? `${usuario.nombre} ${usuario.apellido}` 
      : null;
    const soloNombre = usuario.nombre;
    
    // Si no hay nombre, usar el correo (parte antes del @)
    const correo = usuario.correo;
    const nombreDesdeCorreo = correo ? correo.split('@')[0] : null;
    
    console.log('🔍 DEBUG - Información del propietario:', {
      'usuario completo': usuario,
      'nombreCompleto': nombreCompleto,
      'nombreApellido': nombreApellido,
      'soloNombre': soloNombre,
      'correo': correo,
      'nombreDesdeCorreo': nombreDesdeCorreo
    });

    return nombreCompleto || nombreApellido || soloNombre || nombreDesdeCorreo || 'Usuario Anónimo';
  };

  return (
    <>
      <div className="explorar-card">
        {/* Badge de nuevo emprendimiento */}
        {isNewEmprendimiento() && (
          <div className="explorar-new-badge">Nuevo</div>
        )}

        <div className="explorar-card-header">
          <div className="explorar-card-category">
            <span className="explorar-category-badge">
              {emprendimiento.categoriaEmprendimiento}
            </span>
          </div>
        </div>

        <div className="explorar-card-content">
          <h3 className="explorar-card-title">{emprendimiento.nombreEmprendimiento}</h3>
          <p className="explorar-card-description">{emprendimiento.descripcion}</p>

          <div className="explorar-card-stats">
            {/* Información del propietario con estilo especial */}
            <div className="explorar-stat-item explorar-owner-stat">
              <span className="explorar-stat-icon">👤</span>
              <span className="explorar-stat-text">
                Por: {getPropietarioNombre()}
              </span>
            </div>

            <div className="explorar-stat-item">
              <span className="explorar-stat-icon">📅</span>
              <span className="explorar-stat-text">
                Creado: {formatDate(emprendimiento.createdAt)}
              </span>
            </div>

            {/* Rating con estrellas visuales */}
            {emprendimiento.promedioValoraciones > 0 ? (
              <div className="explorar-stat-item">
                <div className="explorar-rating">
                  <div className="explorar-stars">
                    {renderStars(emprendimiento.promedioValoraciones)}
                  </div>
                  <span className="explorar-rating-text">
                    {emprendimiento.promedioValoraciones.toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="explorar-stat-item">
                <span className="explorar-stat-icon">⭐</span>
                <span className="explorar-stat-text">Sin valoraciones</span>
              </div>
            )}

            {/* Número de valoraciones */}
            {emprendimiento.totalValoraciones > 0 && (
              <div className="explorar-stat-item">
                <span className="explorar-stat-icon">📊</span>
                <span className="explorar-stat-text">
                  {emprendimiento.totalValoraciones} valoración{emprendimiento.totalValoraciones !== 1 ? 'es' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="explorar-card-footer">
          <button 
            className="explorar-btn-products" 
            onClick={() => { 
              setShowProductsModal(true); 
              fetchProductos(); 
            }}
          >
            📦 Ver Productos/Servicios
          </button>
          
          {/* Botón adicional para contactar o valorar */}
          <button className="explorar-btn-contact">
            💬 Contactar Emprendedor
          </button>
        </div>
      </div>

      {/* Modal de Productos - Solo lectura */}
      <Modal
        isOpen={showProductsModal}
        onClose={() => setShowProductsModal(false)}
        title={`Productos/Servicios de ${emprendimiento.nombreEmprendimiento}`}
        size="large"
      >
        <div className="explorar-products-modal-content">
          {loadingProductos ? (
            <div className="explorar-loading-spinner">
              <div className="explorar-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : (
            <>
              <div className="explorar-products-header">
                <h4>Catálogo de productos y servicios</h4>
                <span className="explorar-products-info">
                  {productos.length} {productos.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {productos.length === 0 ? (
                <div className="explorar-empty-state">
                  <div className="explorar-empty-icon">📦</div>
                  <h3>Sin productos/servicios</h3>
                  <p>Este emprendimiento aún no ha agregado productos o servicios</p>
                </div>
              ) : (
                <div className="explorar-products-grid">
                  {productos.map(producto => (
                    <div key={producto._id} className="explorar-product-card">
                      <div className="explorar-product-header">
                        <span className={`explorar-product-type ${producto.tipo}`}>
                          {producto.tipo === 'producto' ? '📦' : '🛠️'} {producto.tipo}
                        </span>
                      </div>
                      <h4 className="explorar-product-name">{producto.nombreProducto}</h4>
                      <p className="explorar-product-description">{producto.descripcion}</p>
                      
                      {/* Información adicional si está disponible */}
                      {producto.precio && (
                        <p className="explorar-product-price">
                          S/ {producto.precio.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ExplorarCard;
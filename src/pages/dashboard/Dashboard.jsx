import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EmprendimientoCard, Modal } from '../../components';
import './Dashboard.css';

const Dashboard = () => {
  const { isAuthenticated, token, user, logout } = useAuth();
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(false); // Cambio: inicializar como false
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoEmprendimiento, setNuevoEmprendimiento] = useState({
    nombre: '',
    descripcion: '',
    categoria: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false); // Nuevo estado para controlar el spinner

  const navigate = useNavigate();
  const fetchingRef = useRef(false);
  const mountedRef = useRef(false);
  const spinnerTimerRef = useRef(null); // Para controlar el timer del spinner

  // Categorías predefinidas
  const categorias = [
    'Ropa y Accesorios',
    'Hogar y Decoración',
    'Tecnología',
    'Comidas y Bebidas',
    'Artesanías',
    'Servicios Profesionales',
    'Educación y Capacitación',
    'Salud y Bienestar',
    'Belleza y Cuidado Personal',
    'Entretenimiento y Eventos',
    'Agricultura',
    'Mascotas y Veterinaria',
    'Turismo',
    'Transporte y Logística',
    'Deportes y Recreación',
    'Construcción',
    'Otro'
  ];

  // Función para manejar el spinner con delay
  const handleLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);

    if (isLoading) {
      // Solo mostrar spinner si la carga toma más de 300ms
      spinnerTimerRef.current = setTimeout(() => {
        setShowSpinner(true);
      }, 300);
    } else {
      // Limpiar timer y ocultar spinner
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = null;
      }
      setShowSpinner(false);
    }
  }, []);

  // Optimizar fetchEmprendimientos
  const fetchEmprendimientos = useCallback(async () => {
    if (fetchingRef.current) {
      return;
    }

    if (!isAuthenticated || !token) {
      console.log('No authenticated or no token, logout');
      logout();
      return;
    }

    try {
      fetchingRef.current = true;
      handleLoadingState(true); // Usar la nueva función
      setError('');

      console.log('Fetching emprendimientos...');

      const response = await fetch('http://localhost:5000/api/emprendimientos/mis-emprendimientos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('Token expired, logging out');
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Emprendimientos fetched:', data);

      setEmprendimientos(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Error fetching emprendimientos:', err);
      setError(err.message || 'Error al cargar emprendimientos');
    } finally {
      fetchingRef.current = false;
      handleLoadingState(false); // Usar la nueva función
    }
  }, [isAuthenticated, token, logout, handleLoadingState]);

  // Cargar emprendimientos al montar el componente
  useEffect(() => {
    if (!mountedRef.current) {
      console.log('Dashboard mounted');
      console.log('IsAuthenticated:', isAuthenticated);
      console.log('Token exists:', !!token);
      console.log('User:', user);
      mountedRef.current = true;
    }

    if (isAuthenticated && token) {
      fetchEmprendimientos();
    }
  }, [isAuthenticated, token, fetchEmprendimientos]);

  // Cleanup del timer al desmontar
  useEffect(() => {
    return () => {
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoEmprendimiento(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateEmprendimiento = async (e) => {
    e.preventDefault();

    if (!nuevoEmprendimiento.nombre.trim() || !nuevoEmprendimiento.descripcion.trim() || !nuevoEmprendimiento.categoria) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (!token) {
        logout();
        return;
      }

      const payload = {
        nombreEmprendimiento: nuevoEmprendimiento.nombre,
        descripcion: nuevoEmprendimiento.descripcion,
        categoriaEmprendimiento: nuevoEmprendimiento.categoria
      };

      const response = await fetch('http://localhost:5000/api/emprendimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear emprendimiento');
      }

      const data = await response.json();
      setEmprendimientos(prev => [...prev, data.emprendimiento]);
      setShowCreateModal(false);
      setNuevoEmprendimiento({ nombre: '', descripcion: '', categoria: '' });

    } catch (err) {
      console.error('Error creating emprendimiento:', err);
      setError(err.message || 'Error al crear emprendimiento');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleUpdateEmprendimiento = useCallback((emprendimientoActualizado) => {
    setEmprendimientos(prev =>
      prev.map(emp =>
        emp._id === emprendimientoActualizado._id
          ? emprendimientoActualizado
          : emp
      )
    );
  }, []);

  const handleDeleteEmprendimiento = useCallback((emprendimientoId) => {
    setEmprendimientos(prev =>
      prev.filter(emp => emp._id !== emprendimientoId)
    );
  }, []);

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNuevoEmprendimiento({ nombre: '', descripcion: '', categoria: '' });
    setError('');
  };

  const handleRetry = () => {
    fetchEmprendimientos();
  };

  // Cambio: solo mostrar spinner si showSpinner es true
  if (showSpinner) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando emprendimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Mi Dashboard</h1>
        <p>Gestiona tus emprendimientos y productos/servicios</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          {error.includes('conexión') && (
            <button className="retry-btn" onClick={handleRetry}>
              Reintentar
            </button>
          )}
        </div>
      )}

      <div className="dashboard-content">
        <div className="emprendimientos-section">
          <div className="section-header">
            <h2>Mis Emprendimientos</h2>
            <button
              className="create-btn"
              onClick={() => setShowCreateModal(true)}
              title="Crear nuevo emprendimiento"
            >
              <span className="plus-icon">+</span>
            </button>
          </div>

          {emprendimientos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚀</div>
              <h3>¡Comienza tu primer emprendimiento!</h3>
              <p>Haz clic en el botón "+" para crear tu primer emprendimiento</p>
            </div>
          ) : (
            <div className="emprendimientos-grid">
              {emprendimientos.map(emprendimiento => (
                <EmprendimientoCard
                  key={emprendimiento._id}
                  emprendimiento={emprendimiento}
                  onUpdate={handleUpdateEmprendimiento}
                  onDelete={handleDeleteEmprendimiento}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        title="Crear Nuevo Emprendimiento"
      >
        <form onSubmit={handleCreateEmprendimiento} className="create-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Emprendimiento *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={nuevoEmprendimiento.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Mi Tienda Online"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={nuevoEmprendimiento.descripcion}
              onChange={handleInputChange}
              placeholder="Describe tu emprendimiento..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={nuevoEmprendimiento.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Emprendimiento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
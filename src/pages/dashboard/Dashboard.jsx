import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EmprendimientoCard, Modal } from '../../components';
import './Dashboard.css';
import { usePageReady } from '../../context/PageReadyContext';

const Dashboard = () => {
  const { isAuthenticated, token, user, logout, loading: authLoading } = useAuth();
  const { finishLoading, resetPageState } = usePageReady();
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoEmprendimiento, setNuevoEmprendimiento] = useState({
    nombre: '',
    descripcion: '',
    categoria: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const navigate = useNavigate();

  // Referencias para controlar efectos
  const fetchingRef = useRef(false);
  const hasNotifiedReady = useRef(false);
  const componentMounted = useRef(true);
  const abortControllerRef = useRef(null);

  const categorias = [
    'Ropa y Accesorios', 'Hogar y Decoración', 'Tecnología',
    'Comidas y Bebidas', 'Artesanías', 'Servicios Profesionales',
    'Educación y Capacitación', 'Salud y Bienestar', 'Belleza y Cuidado Personal',
    'Entretenimiento y Eventos', 'Agricultura', 'Mascotas y Veterinaria',
    'Turismo', 'Transporte y Logística', 'Deportes y Recreación',
    'Construcción', 'Otro'
  ];

  const fetchEmprendimientos = useCallback(async () => {
    // Evitar fetches concurrentes
    if (fetchingRef.current) {
      console.log('⏭️ Dashboard: Fetch ya en progreso, saltando');
      return;
    }

    if (!isAuthenticated || !token) {
      console.log('❌ Dashboard: No autenticado para fetch');
      return;
    }

    console.log('📡 Dashboard: Iniciando fetch de emprendimientos');

    try {
      fetchingRef.current = true;
      setError('');

      // Crear nuevo AbortController para esta petición
      abortControllerRef.current = new AbortController();

      const response = await fetch('http://localhost:5000/api/emprendimientos/mis-emprendimientos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: abortControllerRef.current.signal
      });

      // Verificar si el componente sigue montado
      if (!componentMounted.current) {
        console.log('🚫 Dashboard: Componente desmontado, cancelando fetch');
        return;
      }

      if (response.status === 401) {
        console.log('🔒 Dashboard: Token expirado');
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Verificar nuevamente si el componente sigue montado
      if (!componentMounted.current) {
        console.log('🚫 Dashboard: Componente desmontado antes de setear datos');
        return;
      }

      console.log('✅ Dashboard: Emprendimientos obtenidos:', data.length);
      setEmprendimientos(Array.isArray(data) ? data : []);
      setDataLoaded(true);

    } catch (err) {
      // Ignorar errores de abort
      if (err.name === 'AbortError') {
        console.log('⏹️ Dashboard: Fetch cancelado');
        return;
      }

      if (!componentMounted.current) {
        console.log('🚫 Dashboard: Componente desmontado, ignorando error');
        return;
      }

      console.error('❌ Dashboard: Error fetching emprendimientos:', err);
      setError(err.message || 'Error al cargar emprendimientos');
      setDataLoaded(true);
    } finally {
      fetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, token, logout]);

  // Efecto de montaje/desmontaje - configuración inicial
  useEffect(() => {
    console.log('🏗️ Dashboard: Componente montado');
    componentMounted.current = true;
    hasNotifiedReady.current = false;

    return () => {
      console.log('🧹 Dashboard: Componente desmontado');
      componentMounted.current = false;

      // Cancelar fetch en progreso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Limpiar estado del contexto
      resetPageState();

      // Resetear refs
      fetchingRef.current = false;
      hasNotifiedReady.current = false;
    };
  }, [resetPageState]);

  // Efecto principal - manejo de autenticación y carga de datos
  useEffect(() => {
    console.log('🚀 Dashboard: Efecto principal', {
      authLoading,
      isAuthenticated,
      hasToken: !!token,
      dataLoaded,
      componentMounted: componentMounted.current
    });

    // No hacer nada si el componente no está montado
    if (!componentMounted.current) {
      return;
    }

    // Si auth está cargando, no hacer nada
    if (authLoading) {
      console.log('⏳ Dashboard: Auth cargando, esperando...');
      return;
    }

    // Si no está autenticado, redirigir
    if (!isAuthenticated) {
      console.log('❌ Dashboard: No autenticado, redirigiendo');
      logout();
      return;
    }

    // Si está autenticado pero no tiene datos, cargar
    if (isAuthenticated && token && !dataLoaded && !fetchingRef.current) {
      console.log('📊 Dashboard: Cargando datos');
      fetchEmprendimientos();
    }
  }, [authLoading, isAuthenticated, token, dataLoaded, fetchEmprendimientos, logout]);

  // Efecto para notificar cuando esté listo
  useEffect(() => {
    const shouldNotify = !authLoading &&
      isAuthenticated &&
      dataLoaded &&
      !hasNotifiedReady.current &&
      componentMounted.current;

    console.log('🔍 Dashboard: Verificando si notificar', {
      authLoading,
      isAuthenticated,
      dataLoaded,
      hasNotifiedReady: hasNotifiedReady.current,
      componentMounted: componentMounted.current,
      shouldNotify
    });

    if (shouldNotify) {
      console.log('✅ Dashboard: Notificando que está listo');
      hasNotifiedReady.current = true;

      // Tiempo extendido: 
      finishLoading();
    }
  }, [authLoading, isAuthenticated, dataLoaded, finishLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoEmprendimiento(prev => ({ ...prev, [name]: value }));
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

      // Solo actualizar si el componente sigue montado
      if (componentMounted.current) {
        setEmprendimientos(prev => [...prev, data.emprendimiento]);
        setShowCreateModal(false);
        setNuevoEmprendimiento({ nombre: '', descripcion: '', categoria: '' });
      }

    } catch (err) {
      console.error('Error creating emprendimiento:', err);
      if (componentMounted.current) {
        setError(err.message || 'Error al crear emprendimiento');
      }
    } finally {
      if (componentMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateEmprendimiento = useCallback((emprendimientoActualizado) => {
    if (!componentMounted.current) return;

    setEmprendimientos(prev =>
      prev.map(emp =>
        emp._id === emprendimientoActualizado._id ? emprendimientoActualizado : emp
      )
    );
  }, []);

  const handleDeleteEmprendimiento = useCallback((emprendimientoId) => {
    if (!componentMounted.current) return;

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
    console.log('🔄 Dashboard: Reintentando carga');
    setDataLoaded(false);
    setError('');
    hasNotifiedReady.current = false;
    fetchEmprendimientos();
  };

  console.log('🎨 Dashboard: Renderizando', {
    authLoading,
    isAuthenticated,
    dataLoaded,
    emprendimientosCount: emprendimientos.length,
    componentMounted: componentMounted.current
  });

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
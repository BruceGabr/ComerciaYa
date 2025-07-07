import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePageReady } from '../../context/PageReadyContext';
import './Explorar.css';

const Explorar = () => {
  const { token } = useAuth();
  const { pageReady, isLoading, finishLoading } = usePageReady();
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [filteredEmprendimientos, setFilteredEmprendimientos] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
    try {
      setError('');

      // Crear nuevo AbortController para esta petición
      abortControllerRef.current = new AbortController();

      const response = await fetch('http://localhost:5000/api/emprendimientos', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        signal: abortControllerRef.current.signal
      });

      if (!componentMounted.current) return;

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!componentMounted.current) return;

      console.log('✅ Explorar: Emprendimientos obtenidos:', data.length);
      setEmprendimientos(Array.isArray(data) ? data : []);
      setFilteredEmprendimientos(Array.isArray(data) ? data : []);
      finishLoading();

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('⏹️ Explorar: Fetch cancelado');
        return;
      }

      if (!componentMounted.current) return;

      console.error('❌ Explorar: Error fetching emprendimientos:', err);
      setError(err.message || 'Error al cargar emprendimientos');
      finishLoading();
    }
  }, [token, finishLoading]);

  // Efecto de limpieza
  useEffect(() => {
    componentMounted.current = true;

    return () => {
      componentMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Cargar emprendimientos al montar el componente
  useEffect(() => {
    fetchEmprendimientos();
  }, [fetchEmprendimientos]);

  // Filtrar emprendimientos
  useEffect(() => {
    let filtered = emprendimientos;

    if (searchTerm.trim()) {
      filtered = filtered.filter(emp =>
        emp.nombreEmprendimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(emp => emp.categoriaEmprendimiento === selectedCategory);
    }

    setFilteredEmprendimientos(filtered);
  }, [emprendimientos, searchTerm, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowFilters(false);
  };

  const handleRetry = () => {
    fetchEmprendimientos();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Ropa y Accesorios': '👕',
      'Hogar y Decoración': '🏠',
      'Tecnología': '💻',
      'Comidas y Bebidas': '🍕',
      'Artesanías': '🎨',
      'Servicios Profesionales': '💼',
      'Educación y Capacitación': '📚',
      'Salud y Bienestar': '🏥',
      'Belleza y Cuidado Personal': '💄',
      'Entretenimiento y Eventos': '🎭',
      'Agricultura': '🌾',
      'Mascotas y Veterinaria': '🐾',
      'Turismo': '✈️',
      'Transporte y Logística': '🚛',
      'Deportes y Recreación': '⚽',
      'Construcción': '🏗️',
      'Otro': '📦'
    };
    return icons[category] || '📦';
  };

  if (isLoading || !pageReady) {
    return (
      <div className="explorar-container">
        <div className="explorar-loading">
          <div className="loading-spinner"></div>
          <p>Cargando emprendimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explorar-container">
      {/* Header */}
      <div className="explorar-header">
        <div className="header-content">
          <h1 className="explorar-title">Explorar Emprendimientos</h1>
          <p className="explorar-subtitle">
            Descubre increíbles emprendimientos locales y conecta con sus productos y servicios
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="explorar-filters">
        <div className="filters-container">
          <div className="search-section">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar emprendimientos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              className={`filters-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              🎛️ Filtros
            </button>
          </div>

          {showFilters && (
            <div className="filters-dropdown">
              <div className="filter-group">
                <label htmlFor="category-filter">Categoría:</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="category-select"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {getCategoryIcon(categoria)} {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-actions">
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filtros activos */}
        {(searchTerm || selectedCategory) && (
          <div className="active-filters">
            <span className="active-filters-label">Filtros activos:</span>
            {searchTerm && (
              <span className="filter-tag">
                Búsqueda: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>✕</button>
              </span>
            )}
            {selectedCategory && (
              <span className="filter-tag">
                {getCategoryIcon(selectedCategory)} {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="explorar-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button className="retry-btn" onClick={handleRetry}>
              Reintentar
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="stats-bar">
          <div className="stats-item">
            <span className="stats-number">{filteredEmprendimientos.length}</span>
            <span className="stats-label">
              {filteredEmprendimientos.length === 1 ? 'Emprendimiento' : 'Emprendimientos'}
            </span>
          </div>
          {(searchTerm || selectedCategory) && (
            <div className="stats-item">
              <span className="stats-number">{emprendimientos.length}</span>
              <span className="stats-label">Total disponibles</span>
            </div>
          )}
        </div>

        {/* Grid de emprendimientos */}
        {filteredEmprendimientos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>
              {searchTerm || selectedCategory
                ? 'No se encontraron emprendimientos'
                : 'No hay emprendimientos disponibles'}
            </h3>
            <p>
              {searchTerm || selectedCategory
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Aún no hay emprendimientos registrados'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="emprendimientos-grid">
            {filteredEmprendimientos.map(emprendimiento => (
              <div key={emprendimiento._id} className="emprendimiento-card-explorar">
                <div className="card-header-explorar">
                  <div className="card-category-explorar">
                    <span className="category-badge-explorar">
                      {getCategoryIcon(emprendimiento.categoriaEmprendimiento)}
                      {emprendimiento.categoriaEmprendimiento}
                    </span>
                  </div>
                </div>

                <div className="card-content-explorar">
                  <h3 className="card-title-explorar">{emprendimiento.nombreEmprendimiento}</h3>
                  <p className="card-description-explorar">{emprendimiento.descripcion}</p>

                  <div className="card-stats-explorar">
                    <div className="stat-item-explorar">
                      <span className="stat-icon-explorar">📅</span>
                      <span className="stat-text-explorar">
                        {formatDate(emprendimiento.createdAt)}
                      </span>
                    </div>
                    <div className="stat-item-explorar">
                      <span className="stat-icon-explorar">⭐</span>
                      <span className="stat-text-explorar">
                        {emprendimiento.promedioValoraciones > 0
                          ? `${emprendimiento.promedioValoraciones.toFixed(1)} estrellas`
                          : 'Sin valoraciones'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-footer-explorar">
                  <div className="card-actions-explorar">
                    <button className="btn-contact">
                      📞 Contactar
                    </button>
                    <button className="btn-view">
                      👁️ Ver más
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explorar;
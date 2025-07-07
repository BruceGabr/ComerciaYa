import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Header, Sidebar, Footer, ScrollToTop } from './components';
import { Home, Explorar, Registro, Login, Perfil, Dashboard } from "./pages";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { usePageReady } from './context/PageReadyContext';

// Definir rutas con datos fuera del componente para evitar re-creaciones
const ROUTES_WITH_DATA = ['/dashboard', '/perfil'];

// Componente interno que tiene acceso al AuthContext
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { pageReady, isLoading, resetPageState, startLoading } = usePageReady();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();

  // Refs para controlar efectos y evitar renders innecesarios
  const previousPathRef = useRef(location.pathname);
  const hasInitializedRef = useRef(false);
  const authStatusRef = useRef({ isAuthenticated, authLoading });

  // Actualizar ref del estado de auth
  useEffect(() => {
    authStatusRef.current = { isAuthenticated, authLoading };
  }, [isAuthenticated, authLoading]);

  // Efecto para manejar cambios de ruta - optimizado
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // Si la autenticación aún no está determinada, no hacer nada
    if (isAuthenticated === null) {
      console.log('⏳ App: Esperando verificación de autenticación...');
      return;
    }

    // Solo proceder si la ruta cambió y la autenticación está determinada
    if (previousPath !== currentPath) {
      console.log('📍 App: Ruta cambió efectivamente');
      resetPageState();
      previousPathRef.current = currentPath;

      // Ahora routesWithData está definido
      if (ROUTES_WITH_DATA.includes(currentPath)) {
        console.log('⚡ App: Preparando carga para ruta con datos');
        startLoading();
      }
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      console.log('🚀 App: Inicialización completada');
    }
  }, [location.pathname, startLoading, resetPageState, isAuthenticated]);

  // Determinar si mostrar splash - flujo correcto
  const shouldShowSplash = () => {
    const currentPath = location.pathname;
    const isDataRoute = ROUTES_WITH_DATA.includes(currentPath);

    // PRIORIDAD 1: Si auth está cargando O la autenticación no está determinada (null)
    if (authLoading || isAuthenticated === null) {
      console.log('⏳ App: Splash por auth loading o verificación pendiente');
      return true;
    }

    // PRIORIDAD 2: Si es ruta con datos pero no autenticado
    if (isDataRoute && !isAuthenticated) {
      console.log('🚫 App: Ruta privada sin autenticación, no mostrar splash');
      return false;
    }

    // PRIORIDAD 3: Si es ruta con datos y autenticado, mostrar splash hasta que pageReady
    if (isDataRoute && isAuthenticated) {
      const shouldShow = isLoading || !pageReady;
      console.log('🎯 App: Ruta con datos autenticada', { isLoading, pageReady, shouldShow });
      return shouldShow;
    }

    // Cualquier otra ruta (pública o sin datos)
    console.log('🌍 App: Ruta pública o sin datos, no mostrar splash');
    return false;
  };

  const showSplash = shouldShowSplash();

  const getMainContentClass = () => {
    if (!isAuthenticated) return 'main-content';
    return `main-content ${sidebarExpanded
      ? 'main-content--with-sidebar-expanded'
      : 'main-content--with-sidebar-collapsed'
      }`;
  };

  console.log('✅ App: Renderizando contenido principal', {
    showSplash,
    currentPath: location.pathname,
    authLoading,
    isAuthenticated,
    isLoading,
    pageReady
  });

  return (
    <div className="app-container">
      {/* Mostrar splash como overlay si es necesario */}
      {showSplash && (
        <div className="splash-screen">
          <div className="splash-content">
            <div className="splash-logo">ComerciaYa</div>
            <div className="spinner-container">
              <div className="spinner-circle"></div>
              <div className="loading-text">
                {authLoading ? 'Verificando sesión...' : 'Cargando datos...'}
              </div>
            </div>
          </div>
        </div>
      )}

      <Header />
      <div className="app-content">
        {isAuthenticated && (
          <Sidebar
            isExpanded={sidebarExpanded}
            setIsExpanded={setSidebarExpanded}
          />
        )}

        <main className={getMainContentClass()}>
          <ScrollToTop />
          <div className="content-wrapper">
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                }
              />
              <Route path="/explorar" element={<Explorar />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/registro"
                element={
                  <PublicRoute>
                    <Registro />
                  </PublicRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <PrivateRoute>
                    <Perfil />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
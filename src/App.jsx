import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Header, Sidebar, Footer, ScrollToTop } from './components';
import { Home, Explorar, Registro, Login, Perfil, Dashboard } from "./pages";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { usePageReady } from './context/PageReadyContext';

// 🔧 Definir rutas que requieren carga de datos
const ROUTES_WITH_DATA = [
  '/dashboard',    // Carga emprendimientos
  '/perfil',       // Carga perfil de usuario
  '/explorar',     // Carga productos/emprendimientos públicos
];

// 🔧 Rutas que NO necesitan cargar datos
const ROUTES_WITHOUT_DATA = [
  '/login',
  '/registro',
  '/home',
  '/'
];

// Componente interno que tiene acceso al AuthContext
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { pageReady, isLoading, resetPageState, startLoading } = usePageReady();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();

  // Refs para controlar efectos
  const previousPathRef = useRef(location.pathname);
  const hasInitializedRef = useRef(false);

  // Efecto para manejar cambios de ruta
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // Solo proceder si la ruta cambió
    if (previousPath !== currentPath) {
      console.log('📍 App: Ruta cambió de', previousPath, 'a', currentPath);
      resetPageState();
      previousPathRef.current = currentPath;

      // Solo iniciar carga si es una ruta que maneja datos
      if (ROUTES_WITH_DATA.includes(currentPath)) {
        console.log('⚡ App: Iniciando carga para ruta con datos');
        startLoading();
      }
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      console.log('🚀 App: Inicialización completada');
    }
  }, [location.pathname, startLoading, resetPageState]);

  // Lógica simplificada para mostrar spinner (copiando comportamiento del Header)
  const shouldShowSplash = () => {
    const currentPath = location.pathname;

    // 1. Si es una ruta que NO maneja datos, NUNCA mostrar spinner
    // (mismo comportamiento que el Header: renderiza inmediatamente)
    if (ROUTES_WITHOUT_DATA.includes(currentPath)) {
      console.log('🚫 App: Ruta sin datos, renderizar inmediatamente');
      return false;
    }

    // 2. Para rutas con datos, solo mostrar spinner si:
    if (ROUTES_WITH_DATA.includes(currentPath)) {
      // - La autenticación está cargando Y la ruta requiere autenticación
      if (authLoading && (currentPath === '/dashboard' || currentPath === '/perfil')) {
        console.log('⏳ App: Spinner por verificación de autenticación en ruta privada');
        return true;
      }
      
      // - Los datos están cargando
      if (isLoading || !pageReady) {
        console.log('📊 App: Spinner por carga de datos');
        return true;
      }
    }

    // 3. En todos los demás casos, no mostrar spinner
    console.log('✅ App: No mostrar spinner');
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

  // Función para determinar qué texto mostrar en el spinner
  const getLoadingText = () => {
    if (authLoading) {
      return 'Verificando sesión...';
    }
    if (isLoading) {
      return 'Cargando datos...';
    }
    return 'Cargando...';
  };

  console.log('✅ App: Renderizando', {
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
                {getLoadingText()}
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
              <Route
                path="/home"
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
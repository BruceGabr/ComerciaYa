import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header, Sidebar, Footer, ScrollToTop } from './components';
import { Home, Explorar, Registro, Login, Perfil, Dashboard } from "./pages";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { PageReadyProvider } from "./context/PageReadyContext";
import { usePageReady } from './context/PageReadyContext';

// Componente interno que tiene acceso al AuthContext
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { pageReady, isLoading, resetPageState, startLoading } = usePageReady();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();

  // ✅ Efecto para detectar navegación a rutas que requieren carga
  useEffect(() => {
    const currentPath = location.pathname;
    const routesWithData = ['/dashboard', '/perfil'];

    console.log('🔍 App: Cambio de ruta detectado ->', currentPath);

    if (routesWithData.includes(currentPath)) {
      console.log('⚡ App: Ruta con datos detectada, iniciando carga PREVENTIVA');
      startLoading();
    } else {
      resetPageState();
    }
  }, [location.pathname, startLoading, resetPageState]);

  // ✅ Determinar si mostrar splash
  const shouldShowSplash = () => {
    const currentPath = location.pathname;

    console.log('🔍 App shouldShowSplash:', {
      path: currentPath,
      authLoading,
      isAuthenticated,
      isLoading,
      pageReady
    });

    // SIEMPRE mostrar splash si auth está cargando
    if (authLoading) {
      console.log('🔄 App: Splash por auth loading');
      return true;
    }

    // Rutas que requieren carga de datos
    const routesWithData = ['/dashboard', '/perfil'];
    const isDataRoute = routesWithData.includes(currentPath);

    // Si es una ruta con datos y está autenticado
    if (isDataRoute && isAuthenticated) {
      const shouldShow = isLoading || !pageReady;
      console.log('🎯 App: Ruta con datos -', {
        isLoading,
        pageReady,
        shouldShow
      });
      return shouldShow;
    }

    console.log('❌ App: No mostrar splash');
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

  console.log('✅ App: Renderizando contenido principal');

  return (
    <div className="app-container">
      {/* ✅ Mostrar splash como overlay si es necesario */}
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
    <PageReadyProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PageReadyProvider>
  );
}

export default App;
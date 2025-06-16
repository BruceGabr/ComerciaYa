import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header, Sidebar, Footer, ScrollToTop } from './components';
import { Home, Explorar, Registro, Login, Perfil, Dashboard, NuevoEmprendimiento, Reseñas } from "./pages";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// Componente interno que tiene acceso al AuthContext
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determinar la clase del main-content según el estado del sidebar
  const getMainContentClass = () => {
    if (!isAuthenticated) {
      return 'main-content';
    }
    
    return `main-content ${
      sidebarExpanded 
        ? 'main-content--with-sidebar-expanded' 
        : 'main-content--with-sidebar-collapsed'
    }`;
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-content">
        {/* Sidebar solo aparece cuando el usuario está autenticado */}
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

              {/* Rutas privadas */}
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
              <Route
                path="/reseñas"
                element={
                  <PrivateRoute>
                    <Reseñas />
                  </PrivateRoute>
                }
              />
              <Route
                path="/nuevoEmprendimiento"
                element={
                  <PrivateRoute>
                    <NuevoEmprendimiento />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
          
          {/* Footer dentro del contenido scrolleable */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

// Componente principal que envuelve todo en el AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
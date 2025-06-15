import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Header from "./components/header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/home/Home";
import Explorar from "./pages/explorar/Explorar";
import Login from "./pages/login/Login";
import Registro from "./pages/registro/Registro";
import Perfil from "./pages/perfil/Perfil";
import NuevoEmprendimiento from "./pages/nuevoEmprendimiento/NuevoEmprendimiento";
import Reseñas from "./pages/reseñas/Reseñas";
import Dashboard from "./pages/dashboard/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Componente interno que tiene acceso al AuthContext
function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      <Header />
      <div className="app-content">
        {/* Sidebar solo aparece cuando el usuario está autenticado */}
        {isAuthenticated && <Sidebar />}
        <main className="main-content">
          <ScrollToTop />
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
        </main>
      </div>
      <Footer />
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
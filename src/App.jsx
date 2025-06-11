import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/header/Header";
import Home from "./pages/home/Home";
import Explorar from "./pages/explorar/Explorar";
import Login from "./pages/login/Login";
import Registro from "./pages/registro/Registro";
import Perfil from "./pages/perfil/Perfil";
import NuevoEmprendimiento from "./pages/nuevoEmprendimiento/NuevoEmprendimiento";
import Reseñas from "./pages/reseñas/Reseñas";
import Dashboard from "./pages/dashboard/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";  // Importa PrivateRoute
import PublicRoute from "./routes/PublicRoute";  // Importa PublicRoute
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <Header />
      <ScrollToTop />
      <main className="app">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Home />
              </PublicRoute>} />
          <Route
            path="/explorar" element={<Explorar />} />
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
      <Footer />
    </AuthProvider>
  );
}

export default App;

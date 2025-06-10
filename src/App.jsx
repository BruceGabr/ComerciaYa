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
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <Header />
      <ScrollToTop />
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/nuevoEmprendimiento" element={<NuevoEmprendimiento />} />
          <Route path="/reseñas" element={<Reseñas />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Protege la ruta nuevoEmprendimiento */}
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

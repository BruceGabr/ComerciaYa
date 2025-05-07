import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Importamos el contexto
import Header from "./components/Header";
import Home from "./pages/Home";
import Explorar from "./pages/Explorar";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import NuevoProducto from "./pages/NuevoProducto";
import Reseñas from "./pages/Reseñas";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/nuevo-producto" element={<NuevoProducto />} />
          <Route path="/reseñas" element={<Reseñas />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer/>
    </AuthProvider>
  );
}

export default App;

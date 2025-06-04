// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate para redirigir en logout (opcional)

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializa el estado 'isAuthenticated' leyendo de localStorage.
  // Esto hace que la sesión sea persistente entre recargas de página.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem("isAuthenticated");
      // Si "saved" es "true" (string), retorna true, de lo contrario, retorna false.
      return saved === "true";
    } catch (error) {
      console.error("Error al leer isAuthenticated de localStorage:", error);
      // Si hay un error (ej. localStorage no disponible), asumimos que no está autenticado.
      return false;
    }
  });

  const navigate = useNavigate(); // Hook para la navegación.

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    console.log("AuthContext: Usuario ha iniciado sesión. isAuthenticated:", true);
    // Ya no es 'simulado', así que la redirección sucede.
  };

  const logout = () => {
    setIsAuthenticated(false); // Cambia el estado a no autenticado
    localStorage.setItem("isAuthenticated", "false"); // Actualiza localStorage
    // Opcional: También podrías querer limpiar otros datos del usuario si los guardas
    // localStorage.removeItem("miEmprendimientoData");
    console.log("AuthContext: Usuario ha cerrado sesión. isAuthenticated:", false);

    // Redirige al usuario a la página de login después de cerrar sesión
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
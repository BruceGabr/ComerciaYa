// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

// Crear contexto de autenticación
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    // Aquí va la lógica de inicio de sesión
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Aquí va la lógica de cierre de sesión
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

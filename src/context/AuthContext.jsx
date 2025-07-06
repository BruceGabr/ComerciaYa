// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para verificar token almacenado al iniciar la app
  useEffect(() => {
    const checkStoredAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (!storedToken || !storedUser) {
        console.log("AuthContext: No hay sesión almacenada");
        setLoading(false); // 👈 necesaria
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const isValid = await verifyToken(storedToken, parsedUser.id);

        if (isValid) {
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("AuthContext: Sesión restaurada para:", parsedUser.correo);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          console.log("AuthContext: Token inválido o expirado");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      } finally {
        setLoading(false); // ✅ siempre al final
      }
    };

    checkStoredAuth();
  }, []);


  // Función para verificar si un token es válido
  const verifyToken = async (token, userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/verify/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error("Error verificando token:", error);
      return false;
    }
  };

  // Función de login - recibe token y datos del usuario
  const login = (authToken, userData) => {
    try {
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Guardar en localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      console.log("AuthContext: Usuario autenticado:", userData.correo);
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  // Función de logout
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);

    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    console.log("AuthContext: Usuario deslogueado");
    navigate("/login");
  };

  // Función para obtener perfil completo del usuario
  const getUserProfile = async () => {
    if (!token || !user) {
      throw new Error("No hay usuario autenticado");
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/user/profile/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo perfil:", error);

      // Si el token expiró, hacer logout
      if (error.response?.status === 401) {
        logout();
      }

      throw error;
    }
  };

  // Función para actualizar perfil
  const updateUserProfile = async (profileData) => {
    if (!token || !user) {
      throw new Error("No hay usuario autenticado");
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/user/profile/${user.id}`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error actualizando perfil:", error);

      // Si el token expiró, hacer logout
      if (error.response?.status === 401) {
        logout();
      }

      throw error;
    }
  };

  // Función para hacer requests autenticados
  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const config = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const response = await axios(url, config);
      return response;
    } catch (error) {
      // Si el token expiró, hacer logout
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    makeAuthenticatedRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
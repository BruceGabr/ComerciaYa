// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = no verificado, true/false = verificado
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Función para verificar si un token es válido - memoizada
  const verifyToken = useCallback(async (token, userId) => {
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
  }, []);

  // ✅ Función de logout memoizada
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);

    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    console.log("AuthContext: Usuario deslogueado");
    navigate("/login");
  }, [navigate]);

  // ✅ Función de login memoizada
  const login = useCallback((authToken, userData) => {
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
  }, []);

  // ✅ Función para verificar token almacenado - optimizada
  useEffect(() => {
    let mounted = true;

    const checkStoredAuth = async () => {
      console.log("AuthContext: Verificando sesión almacenada...");

      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (!storedToken || !storedUser) {
        console.log("AuthContext: No hay sesión almacenada");
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const isValid = await verifyToken(storedToken, parsedUser.id);

        if (!mounted) return;

        if (isValid) {
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("AuthContext: Sesión restaurada para:", parsedUser.correo);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setIsAuthenticated(false);
          console.log("AuthContext: Token inválido o expirado");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        if (mounted) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkStoredAuth();

    return () => {
      mounted = false;
    };
  }, [verifyToken]);

  // ✅ Función para obtener perfil completo del usuario - memoizada
  const getUserProfile = useCallback(async () => {
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
  }, [token, user, logout]);

  // ✅ Función para actualizar perfil - memoizada
  const updateUserProfile = useCallback(async (profileData) => {
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
  }, [token, user, logout]);

  // ✅ Función para hacer requests autenticados - memoizada
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
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
  }, [token, logout]);

  // ✅ Memoizar el valor del contexto para evitar re-renders
  const value = useMemo(() => ({
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    makeAuthenticatedRequest
  }), [
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    makeAuthenticatedRequest
  ]);

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
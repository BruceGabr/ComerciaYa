// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (isAuthenticated === null || loading) {
    return <div className="private-loader">Verificando autenticación...</div>;
  }
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  console.log("PrivateRoute: Usuario autenticado, renderizando contenido");
  return children;
};

export default PrivateRoute;
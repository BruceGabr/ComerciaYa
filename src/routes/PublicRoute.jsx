import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Si está definitivamente autenticado, redirigir a dashboard
  if (isAuthenticated === true) {
    return <Navigate to="/dashboard" replace />;
  }

  // En todos los demás casos (loading, null, false), mostrar contenido público
  // Esto copia el comportamiento del Header: renderiza inmediatamente
  return children;
};

export default PublicRoute;
// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Si está cargando, no redirigir aún - esperar a que termine
  if (loading) {
    console.log("PrivateRoute: Verificando autenticación...");
    return null; // o un spinner si prefieres
  }

  // Solo redirigir si YA terminó de cargar y NO está autenticado
  if (!isAuthenticated) {
    console.log("PrivateRoute: Usuario no autenticado, redirigiendo al login");
    return <Navigate to="/login" replace />;
  }

  console.log("PrivateRoute: Usuario autenticado, renderizando contenido");
  return children;
};

export default PrivateRoute;
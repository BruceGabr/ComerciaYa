import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Si está definitivamente NO autenticado, redirigir a login
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Si aún está verificando autenticación (loading o null), no renderizar nada
  // El spinner principal se encargará de mostrar el estado de carga
  if (loading || isAuthenticated === null) {
    return null;
  }

  // Si está autenticado, renderizar el contenido
  console.log("PrivateRoute: Usuario autenticado, renderizando contenido");
  return children;
};

export default PrivateRoute;
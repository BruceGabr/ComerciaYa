// src/components/PrivateRoute.jsx
// import { Navigate } from "react-router-dom"; // Ya no necesitamos Navigate para esto
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Esto siempre será true ahora

  // En modo de prueba, PrivateRoute siempre permite el acceso
  if (!isAuthenticated) {
    // Esta condición NUNCA se cumplirá con el AuthContext modificado,
    // pero se mantiene por si en el futuro se revierte el AuthContext.
    // return <Navigate to="/login" replace />;
    console.warn("PrivateRoute detectó !isAuthenticated pero está en modo de prueba. ¡Ignorando redirección!");
  }

  return children; // Siempre permite el acceso a las rutas protegidas
};

export default PrivateRoute;
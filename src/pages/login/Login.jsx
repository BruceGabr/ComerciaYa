// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  console.log("Login renderizado");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const { isAuthenticated, login } = useAuth(); // isAuthenticated ahora viene del estado real
  const navigate = useNavigate();

  // Este useEffect redirige si el usuario ya está autenticado.
  // Será útil si intentan acceder a /login estando ya logueados.
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Login: Usuario ya autenticado, redirigiendo a /dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí iría tu lógica de validación de credenciales con un backend.
    // Por ahora, simulamos un login exitoso si los campos no están vacíos.
    if (correo.trim() !== "" && contraseña.trim() !== "") {
      login(); // Llama a la función login del contexto (que ahora es funcional)
      setMensaje("Iniciando sesión..."); // Mensaje normal
    } else {
      setMensaje("Credenciales inválidas. Por favor, ingresa tu correo y contraseña.");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f2f2f2",
      padding: "2rem"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "2.5rem",
        maxWidth: "400px",
        width: "100%",
        borderRadius: "8px",
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
        textAlign: "center"
      }}>
        <h2>Iniciar Sesión</h2> {/* Título sin "Modo de Prueba" */}
        <p>Ingresa con tu cuenta para gestionar tus productos o servicios.</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #dddfe2",
              borderRadius: "6px",
              backgroundColor: "#f5f6f7",
              boxSizing: "border-box"
            }}
          />
          <input
            type="password"
            name="contraseña"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #dddfe2",
              borderRadius: "6px",
              backgroundColor: "#f5f6f7",
              boxSizing: "border-box"
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              fontSize: "1.1rem",
              backgroundColor: "#077A7D",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.3s ease"
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#055e60")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#077A7D")}
          >
            Iniciar Sesión
          </button>
        </form>
        {mensaje && (
          <div style={{
            marginTop: "1rem",
            color: mensaje.includes("inválidas") ? "#c0392b" : "#077A7D",
            fontWeight: "bold"
          }}>
            {mensaje}
          </div>
        )}
        <p style={{ marginTop: "1rem" }}>
          <a href="/forgot-password" style={{ color: "#077A7D", textDecoration: "none", fontSize: "0.95rem" }}>
            ¿Has olvidado la contraseña?
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
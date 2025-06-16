// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bgLogin from "../../assets/images/bg-login.webp";
import "./Login.css";

function Login() {
  console.log("Login renderizado");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState(""); // 'success' o 'error'
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Precargar imagen de fondo
  useEffect(() => {
    const img = new Image();
    img.src = bgLogin;
  }, []);

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Login: Usuario ya autenticado, redirigiendo a /dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Limpiar mensaje anterior
    setMensaje("");
    setMensajeTipo("");

    // Validación de credenciales
    if (correo.trim() !== "" && contraseña.trim() !== "") {
      login();
      setMensaje("Iniciando sesión...");
      setMensajeTipo("success");
    } else {
      setMensaje("Por favor, completa todos los campos.");
      setMensajeTipo("error");
    }
  };

  return (
    <div className="login-container">
      <img src={bgLogin} alt="" className="background-image" loading="eager" />
      <div className="login-box">
        <h2 className="login-title">Iniciar Sesión</h2>
        <p className="login-subtitle">
          Accede a tu cuenta para gestionar tus emprendimientos
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="form-input"
          />

          <input
            type="password"
            name="contraseña"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
            className="form-input"
          />

          <button type="submit" className="submit-button">
            Iniciar Sesión
          </button>
        </form>

        {mensaje && (
          <div className={`login-message ${mensajeTipo}`}>
            {mensaje}
          </div>
        )}

        <div className="forgot-password">
          <a href="/forgot-password" className="forgot-password-link">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
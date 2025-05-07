// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje("Iniciando sesión...");
    setTimeout(() => {
      console.log("Sesión iniciada con:", { correo, contraseña });
      navigate("/");
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <p>Ingresa con tu cuenta para gestionar tus productos o servicios.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            name="contraseña"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
        {mensaje && <div className="login-mensaje">{mensaje}</div>}
        <p className="forgot-password">
          <a href="/forgot-password">¿Has olvidado la contraseña?</a>
        </p>
      </div>
    </div>
  );
}

export default Login;


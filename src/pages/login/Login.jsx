import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import axios from 'axios'; // Importa axios

import bgLogin from "../../assets/images/bg-login.webp";
import "./Login.css";


function Login() {
  console.log("Login renderizado");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  const handleSubmit = async (e) => { // Marca la función como async
    e.preventDefault();
    setMensaje("Iniciando sesión..."); // Muestra el mensaje mientras se procesa


    try {
      const response = await axios.post('http://localhost:5000/api/login', { // URL de tu backend
        correo,
        contraseña,
      });

      if (response.status === 200) {
        setMensaje("Inicio de sesión exitoso.");
        login(); // Llama a la función login del contexto para cambiar el estado de autenticación
        navigate("/dashboard"); // Redirige al dashboard
      } else {
        // Esto rara vez se activará si el backend maneja bien los errores con códigos de estado 4xx
        setMensaje("Credenciales inválidas. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error.response?.data || error.message);
      if (error.response && error.response.status === 400) {
        setMensaje(error.response.data.message || "Credenciales inválidas. Por favor, verifica tu correo y contraseña.");
      } else {
        setMensaje("Ocurrió un error al intentar iniciar sesión. Inténtalo más tarde.");
      }

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
        <h2>Iniciar Sesión</h2>
        <p>Ingresa con tu cuenta para gestionar tus productos o servicios.</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

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

          <div style={{
            marginTop: "1rem",
            color: mensaje.includes("inválidas") || mensaje.includes("error") ? "#c0392b" : "#077A7D",
            fontWeight: "bold"
          }}>

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
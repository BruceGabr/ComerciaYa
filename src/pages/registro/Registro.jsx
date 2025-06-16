import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios"; // Importa axios
import "./Registro.css";

function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: { dia: "", mes: "", año: "" },
    genero: "",
    contacto: "", // Esto será numeroTelefonico en el backend
    correo: "",
    contrasena: "",
    confirmarContrasena: "", // Corregí el nombre para consistencia
  });
  const [mensaje, setMensaje] = useState(""); // Para mostrar mensajes al usuario

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["dia", "mes", "año"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        fechaNacimiento: {
          ...prev.fechaNacimiento,
          [name]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => { // Marca la función como async
    e.preventDefault();
    setMensaje("Procesando registro..."); // Mensaje de carga

    if (formData.contrasena !== formData.confirmarContrasena) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    // Mapeo de meses de texto a números para el formato de fecha
    const monthMap = {
      "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
      "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12"
    };

    // Crear un objeto de datos para enviar al backend, coincidiendo con el esquema de MongoDB
    const dataToSend = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      fechaNacimiento: {
        dia: formData.fechaNacimiento.dia,
        mes: monthMap[formData.fechaNacimiento.mes], // Convierte a número de mes
        año: formData.fechaNacimiento.año,
      },
      genero: formData.genero,
      contacto: formData.contacto, // Se mapeará a numeroTelefonico en el backend
      correo: formData.correo,
      contrasena: formData.contrasena,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/register", dataToSend); // URL de tu backend

      if (response.status === 201) {
        setMensaje("Registro exitoso. Redirigiendo...");
        login(); // Cambiamos estado a autenticado en el frontend
        navigate("/miemprendimiento"); // Navega a la página de emprendimiento
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error.response?.data || error.message);
      if (error.response && error.response.status === 409) {
        setMensaje(error.response.data.message); // Mostrar el mensaje "El correo ya está registrado."
      } else {
        setMensaje("Error al registrar el usuario. Por favor, inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <h2>Crea tu cuenta</h2>
        <p>es rápido y fácil</p>
        <form className="registro-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />

          <label>Fecha de nacimiento:</label>
          <div className="fecha-group">
            <select
              name="dia"
              value={formData.fechaNacimiento.dia}
              onChange={handleChange}
              required
            >
              <option value="">Día</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}> {/* Asegura 2 dígitos */}
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              name="mes"
              value={formData.fechaNacimiento.mes}
              onChange={handleChange}
              required
            >
              <option value="">Mes</option>
              {[
                "ene", "feb", "mar", "abr", "may", "jun",
                "jul", "ago", "sep", "oct", "nov", "dic",
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              name="año"
              value={formData.fechaNacimiento.año}
              onChange={handleChange}
              required
            >
              <option value="">Año</option>
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(
                (yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                )
              )}
            </select>
          </div>

          <label>Género:</label>
          <div className="genero-group">
            {["Mujer", "Hombre", "Sin Especificar"].map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="genero"
                  value={g}
                  onChange={handleChange}
                  checked={formData.genero === g}
                  required
                />
                {g}
              </label>
            ))}
          </div>

          <input
            type="text"
            name="contacto" // Cambiado de 'numeroTelefonico' para coincidir con tu estado actual
            placeholder="Número de contacto"
            value={formData.contacto}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={formData.correo}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="contrasena" // Cambiado de 'contraseña' para consistencia con backend
            placeholder="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmarContrasena" // Cambiado de 'confirmarContraseña' para consistencia
            placeholder="Confirmar contraseña"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            required
          />

          <button type="submit">Registrarse</button>
        </form>
        {mensaje && (
          <div style={{ marginTop: "1rem", color: mensaje.includes("exitoso") ? "green" : "red" }}>
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

export default Registro;
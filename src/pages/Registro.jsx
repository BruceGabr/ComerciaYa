import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // Importa el contexto
import "./Registro.css";

function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();  // Obtenemos la función login del contexto

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: { dia: "", mes: "", año: "" },
    genero: "",
    contacto: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.contraseña !== formData.confirmarContraseña) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Aquí puedes hacer tu llamada a backend o validar y guardar el usuario
    console.log("Datos registrados:", formData);

    // Simular registro exitoso: hacer login y navegar a emprendimiento
    login(); // Cambiamos estado a autenticado
    navigate("/miemprendimiento");
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
                <option key={i + 1} value={i + 1}>
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
                "ene",
                "feb",
                "mar",
                "abr",
                "may",
                "jun",
                "jul",
                "ago",
                "sep",
                "oct",
                "nov",
                "dic",
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
            name="contacto"
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
            name="contraseña"
            placeholder="Contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmarContraseña"
            placeholder="Confirmar contraseña"
            value={formData.confirmarContraseña}
            onChange={handleChange}
            required
          />

          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
}

export default Registro;

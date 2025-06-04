// src/pages/VistaEmprendimiento.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "miEmprendimientoData";

const VistaEmprendimiento = () => {
  const navigate = useNavigate();
  const [emprendimiento, setEmprendimiento] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        // Adaptar los datos cargados para evitar errores con URL.createObjectURL
        // Las imágenes no se guardan directamente como objetos File en localStorage
        setEmprendimiento({
            ...parsedData,
            productos: parsedData.productos ? parsedData.productos.map(p => ({
                ...p,
                imagen: null // Aseguramos que la imagen no es un objeto File al cargar de localStorage
            })) : []
        });
      } catch (error) {
        console.error("Error al parsear datos para VistaEmprendimiento:", error);
        localStorage.removeItem(STORAGE_KEY); // Limpiar datos corruptos
        setEmprendimiento(null); // No hay datos válidos para mostrar
        navigate("/explorar"); // Redirigir porque no hay datos válidos
      }
    } else {
      console.log("VistaEmprendimiento: No hay datos guardados para mostrar.");
      navigate("/explorar");
    }
  }, [navigate]);

  if (!emprendimiento) return null; // No renderiza nada si no hay datos

  return (
    <div className="vista-emprendimiento-container" style={{ maxWidth: 700, margin: "auto", padding: "2rem" }}>
      <h2>Detalle de Mi Emprendimiento</h2>

      {/* Portada - Si no guardas la portada en una URL, no se mostrará aquí */}
      {/* emprendimiento.portada en localStorage no es un objeto File/Blob */}
      {/* Si tienes una URL de portada guardada, usarías: <img src={emprendimiento.portadaUrl} /> */}
      {emprendimiento.portada && <p>Aquí iría la imagen de portada si estuviera guardada como URL.</p>}


      <p style={{ marginBottom: "2rem", whiteSpace: "pre-line" }}>{emprendimiento.descripcion}</p>

      <h3>Productos</h3>
      {emprendimiento.productos.length === 0 && <p>No hay productos agregados.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {emprendimiento.productos.map((prod, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Las imágenes de productos tampoco se guardan como objetos File/Blob en localStorage */}
            {prod.imagen && <p>Aquí iría la imagen del producto si estuviera guardada como URL.</p>}
            <h4>{prod.nombre}</h4>
            <p style={{ whiteSpace: "pre-line" }}>{prod.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaEmprendimiento;
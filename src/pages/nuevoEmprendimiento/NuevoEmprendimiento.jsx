// src/pages/MiEmprendimiento.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./NuevoEmprendimiento.css";

const STORAGE_KEY = "miEmprendimientoData";

const NuevoEmprendimiento = () => {
  console.log("MiEmprendimiento renderizado"); // Debug
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no está autenticado
  useEffect(() => {
    console.log("MiEmprendimiento useEffect: isAuthenticated =", isAuthenticated); // Debug
    if (!isAuthenticated) {
      console.log("MiEmprendimiento: No autenticado, redirigiendo a /login"); // Debug
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [portada, setPortada] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    imagen: null,
  });

  // Cargar datos guardados
  useEffect(() => {
    console.log("MiEmprendimiento: Intentando cargar datos de localStorage."); // Debug
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log("MiEmprendimiento: Datos de localStorage cargados:", parsed); // Debug
        setDescripcion(parsed.descripcion || "");
        // Asumimos que la imagen de portada y las imágenes de productos no se guardan como blobs/files en localStorage
        // Solo guardamos y cargamos el nombre y la descripción de los productos
        setProductos(
          parsed.productos
            ? parsed.productos.map((p) => ({
                nombre: p.nombre, // Aseguramos que solo copiamos lo que esperamos
                descripcion: p.descripcion,
                imagen: null, // Las imágenes no se persisten en localStorage de esta forma
              }))
            : []
        );
        // Si tienes una lógica para cargar la portada guardada (ej. una URL), hazlo aquí.
        // setPortada(parsed.portadaUrl || null); // Si guardaras la URL de la portada
      } catch (error) {
        console.error("Error al parsear 'miEmprendimientoData' de localStorage:", error); // Debug
        // Limpiar datos corruptos para evitar bucles o errores futuros
        localStorage.removeItem(STORAGE_KEY);
        // Resetear estados a vacío para que el componente se renderice sin datos previos
        setDescripcion("");
        setProductos([]);
      }
    } else {
      console.log("MiEmprendimiento: No se encontraron datos en localStorage para el emprendimiento."); // Debug
    }
  }, []); // Se ejecuta solo una vez al montar

  // Guardar en localStorage cuando cambie la descripción o los productos
  useEffect(() => {
    // Guardamos solo la descripción y productos (sin imagen real/URL de objeto)
    const dataToSave = {
      descripcion,
      productos: productos.map(({ nombre, descripcion }) => ({
        nombre,
        descripcion,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log("MiEmprendimiento: Datos guardados en localStorage."); // Debug
  }, [descripcion, productos]);

  // Handlers
  const handlePortadaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPortada(file);
    }
  };

  const handleNuevoProductoChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      setNuevoProducto({ ...nuevoProducto, imagen: files[0] });
    } else {
      setNuevoProducto({ ...nuevoProducto, [name]: value });
    }
  };

  const agregarProducto = () => {
    if (!nuevoProducto.nombre.trim() || !nuevoProducto.descripcion.trim() || !nuevoProducto.imagen) {
      alert("Por favor, rellena todos los campos y selecciona una imagen para el producto.");
      return;
    }
    setProductos([...productos, nuevoProducto]);
    setNuevoProducto({ nombre: "", descripcion: "", imagen: null }); // Resetear formulario
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    setProductos(nuevosProductos);
  };

  return (
    <div className="miemprendimiento-container">
      <div className="miemprendimiento-box">
        <h2>Mi Emprendimiento</h2>

        {/* Portada */}
        <div className="form-group">
          <label>Portada:</label>
          <input type="file" accept="image/*" onChange={handlePortadaChange} />
          {portada && (
            <img
              src={URL.createObjectURL(portada)}
              alt="Portada"
              className="imagen-previa"
              style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover", marginTop: "10px", borderRadius: "8px" }}
            />
          )}
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label>Descripción de tu emprendimiento:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            placeholder="Describe tu emprendimiento en pocas palabras..."
          />
        </div>

        {/* Agregar productos */}
        <div className="form-group">
          <h3>Agregar Nuevo Producto/Servicio</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del producto o servicio"
            value={nuevoProducto.nombre}
            onChange={handleNuevoProductoChange}
          />
          <textarea
            name="descripcion"
            placeholder="Descripción detallada del producto/servicio"
            value={nuevoProducto.descripcion}
            onChange={handleNuevoProductoChange}
            rows={3}
          />
          <label>Imagen del producto:</label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            onChange={handleNuevoProductoChange}
          />
          {nuevoProducto.imagen && (
            <img
              src={URL.createObjectURL(nuevoProducto.imagen)}
              alt="Previa del producto"
              className="imagen-previa"
              style={{ maxWidth: "100px", maxHeight: "100px", objectFit: "cover", marginTop: "5px", borderRadius: "4px" }}
            />
          )}
          <button onClick={agregarProducto}>Agregar Producto</button>
        </div>

        {/* Lista de productos agregados */}
        <div className="productos-lista">
          <h3>Tus Productos/Servicios Agregados</h3>
          {productos.length === 0 && <p>Aún no has agregado ningún producto o servicio. ¡Usa el formulario de arriba!</p>}
          {productos.map((prod, index) => (
            <div key={index} className="producto-card" style={{ border: "1px solid #eee", padding: "1rem", marginBottom: "1rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              {prod.imagen && (
                <img
                  src={URL.createObjectURL(prod.imagen)}
                  alt={prod.nombre}
                  className="imagen-previa"
                  style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover", marginBottom: "0.5rem", borderRadius: "6px" }}
                />
              )}
              <h4>{prod.nombre}</h4>
              <p>{prod.descripcion}</p>
              <button
                style={{
                  backgroundColor: "#c0392b",
                  color: "white",
                  border: "none",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
                onClick={() => eliminarProducto(index)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NuevoEmprendimiento;
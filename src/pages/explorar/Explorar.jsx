import React, { useEffect, useState } from "react";
import "./Explorar.css";
import EmprendimientoCard from "../../components/emprendimientoCard/EmprendimientoCard";

import artesaniasImg from "../../assets/images/artesanias.webp";
import comidaCaseraImg from "../../assets/images/comida-casera.jpg";
import productosNaturalesImg from "../../assets/images/productos-naturales.webp";

const STORAGE_KEY = "miEmprendimientoData";

const Explorar = () => {
  // Estado para emprendimiento dinámico guardado
  const [emprendimientoUsuario, setEmprendimientoUsuario] = useState(null);

  // Lista estática actual
  const emprendimientos = [
    {
      id: 1,
      nombre: "Artesanías Peruanas",
      imagen: artesaniasImg,
      descripcion:
        "Artesanías únicas elaboradas a mano con materiales locales. Perfectas para regalos o decoración.",
    },
    {
      id: 2,
      nombre: "Comida Casera de Mamá",
      imagen: comidaCaseraImg,
      descripcion:
        "Disfruta de los sabores tradicionales de la comida casera peruana, con ingredientes frescos y naturales.",
    },
    {
      id: 3,
      nombre: "Productos Naturales",
      imagen: productosNaturalesImg,
      descripcion:
        "Productos 100% naturales para el cuidado de tu piel, elaborados con hierbas y aceites orgánicos.",
    },
  ];

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedData = JSON.parse(data);

      // Convertir el objeto a formato compatible con EmprendimientoCard
      // Por ejemplo: nombre, descripción, imagen (que no tenemos como URL, así que ponemos null o imagen placeholder)
      setEmprendimientoUsuario({
        id: "usuario",
        nombre: "Mi Emprendimiento",
        descripcion: parsedData.descripcion,
        imagen: null, // Puedes poner una imagen placeholder si quieres
        productos: parsedData.productos, // por si queremos usarlo después
      });
    }
  }, []);

  return (
    <div className="explorar">
      {/* Sección principal */}
      <section className="explorar__header">
        <div className="container">
          <h2 className="explorar__title">
            Lo Mejor de Nuestros Emprendedores
          </h2>
          <p className="explorar__description">
            Descubre nuevos productos y servicios ofrecidos por emprendedores
            locales.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="explorar__products">
        <div className="container">
          <h3 className="explorar__section-title">
            Emprendimientos Disponibles
          </h3>
          <div className="explorar__grid">
            {/* Mostrar emprendimiento del usuario si existe */}
            {emprendimientoUsuario && (
              <EmprendimientoCard
                key={emprendimientoUsuario.id}
                nombre={emprendimientoUsuario.nombre}
                imagen={emprendimientoUsuario.imagen}
                descripcion={emprendimientoUsuario.descripcion}
              />
            )}

            {/* Mostrar los emprendimientos estáticos */}
            {emprendimientos.map((emprendimiento) => (
              <EmprendimientoCard
                key={emprendimiento.id}
                nombre={emprendimiento.nombre}
                imagen={emprendimiento.imagen}
                descripcion={emprendimiento.descripcion}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explorar;

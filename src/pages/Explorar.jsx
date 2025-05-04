import React from "react";
import "./Explorar.css";
import artesaniasImg from "../assets/images/artesanias.webp";
import comidaCaseraImg from "../assets/images/comida-casera.jpg";
import productosNaturalesImg from "../assets/images/productos-naturales.webp";

const Explorar = () => {
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
            {/* Mapeando los emprendimientos */}
            {emprendimientos.map((emprendimiento) => (
              <div key={emprendimiento.id} className="explorar__card">
                <img
                  src={emprendimiento.imagen}
                  alt={emprendimiento.nombre}
                  className="explorar__image"
                />
                <h4 className="explorar__name">{emprendimiento.nombre}</h4>
                <p className="explorar__description">
                  {emprendimiento.descripcion}
                </p>
                <button className="explorar__button">Ver más</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explorar;

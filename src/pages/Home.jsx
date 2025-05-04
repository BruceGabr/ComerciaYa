import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Crearemos este archivo para estilos
import artesaniasImg from "../assets/images/artesanias.webp";
import comidaCaseraImg from "../assets/images/comida-casera.jpg";
import productosNaturalesImg from "../assets/images/productos-naturales.webp";
import bannerImg from "../assets/images/contabilidad.png";

const Home = () => {
  return (
    <div className="home">
      {/* Sección de Bienvenida */}
      <section className="home__banner">
        <div className="container home__banner-content">
          <div className="home__banner-image">
            <img src={bannerImg} alt="Contabilidad" />
          </div>
          <div className="home__banner-text">
            <h2 className="home__title">
              Explora la Creatividad de tu Comunidad
            </h2>
            <p className="home__description">
              Conoce los mejores productos y servicios de emprendedores locales.
            </p>
            <p className="home__description">
              Descubre variedad, calidad y autenticidad en cada propuesta, y
              apoya el crecimiento de tu comunidad con cada elección.
            </p>
            <Link to="/explorar" className="home__cta">
              Explorar Productos
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de productos destacados */}
      <section className="home__featured-products">
        <div className="container">
          <h3 className="home__section-title">Productos Destacados</h3>
          <div className="home__products">
            {/* Simulando productos */}
            <div className="home__product">
              <img
                src={artesaniasImg}
                alt="Productos de artesanía"
                className="home__image"
              />
              <p>Producto 1</p>
            </div>
            <div className="home__product">
              <img
                src={comidaCaseraImg}
                alt="Comida casera"
                className="home__image"
              />
              <p>Producto 2</p>
            </div>
            <div className="home__product">
              <img
                src={productosNaturalesImg}
                alt="Productos naturales"
                className="home__image"
              />
              <p>Producto 3</p>
            </div>
          </div>
        </div>
      </section>

      {/* Otra sección adicional, por ejemplo sobre la plataforma */}
      <section className="home__about">
        <h3 className="home__section-title">¿Cómo funciona?</h3>
        <p>
          EmprendeLocal conecta a emprendedores locales con clientes que buscan
          productos y servicios únicos. ¡Únete a nuestra comunidad!
        </p>
      </section>
    </div>
  );
};

export default Home;

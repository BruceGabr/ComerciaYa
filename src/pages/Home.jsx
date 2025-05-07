import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Crearemos este archivo para estilos
import EmprendimientoCard from "../components/EmprendimientoCard";

import artesaniasImg from "../assets/images/artesanias.webp";
import comidaCaseraImg from "../assets/images/comida-casera.jpg";
import productosNaturalesImg from "../assets/images/productos-naturales.webp";
import bannerImg from "../assets/images/contabilidad.png";

const Home = () => {
  const destacados = [
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
            <div className="home__description">
              <p>
                Conoce los mejores productos y servicios de emprendedores
                locales.
              </p>
              <p>
                Descubre variedad, calidad y autenticidad en cada propuesta, y
                apoya el crecimiento de tu comunidad con cada elección.
              </p>
            </div>
            <Link to="/explorar" className="home__cta">
              Explorar Productos
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de emprendimientos destacados */}
      <section className="home__featured-products">
        <div className="container">
          <h3 className="home__section-title">Emprendimientos Destacados</h3>
          <div className="home__cards-grid">
            {destacados.map((item) => (
              <EmprendimientoCard
                key={item.id}
                nombre={item.nombre}
                imagen={item.imagen}
                descripcion={item.descripcion}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Beneficios */}
      <section className="home__benefits">
        <div className="container">
          <h3 className="home__section-title">
            Beneficios de Usar EmprendeLocal
          </h3>
          <div className="home__benefit-cards">
            <div className="home__benefit-card">
              <i className="fas fa-handshake home__icon"></i>
              <h4>Conexión directa</h4>
              <p>
                Conecta fácilmente con clientes interesados en tus productos y
                servicios.
              </p>
            </div>
            <div className="home__benefit-card">
              <i className="fas fa-bullhorn home__icon"></i>
              <h4>Visibilidad gratuita</h4>
              <p>
                Promociona tu emprendimiento sin costos y sin complicaciones.
              </p>
            </div>
            <div className="home__benefit-card">
              <i className="fas fa-edit home__icon"></i>
              <h4>Publicación fácil</h4>
              <p>
                Sube tus productos o servicios en pocos pasos y empieza a
                vender.
              </p>
            </div>
            <div className="home__benefit-card">
              <i className="fas fa-seedling home__icon"></i>
              <h4>Apoya lo local</h4>
              <p>
                Fomenta el crecimiento económico de tu comunidad participando
                activamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Convocatoria */}
      <section className="home__about">
        <div className="container home__about-content">
          <h3 className="home__section-title">¿Cómo funciona?</h3>
          <p className="home__about-text">
            EmprendeLocal es una plataforma que conecta a emprendedores con
            personas que valoran lo auténtico y local. Aquí podrás descubrir
            productos y servicios únicos, apoyar negocios cercanos y fomentar el
            crecimiento de tu comunidad.
          </p>
        </div>
      </section>

      <section className="home__join">
        <div className="container home__join-content">
          <h3 className="home__section-title">¿Tienes un Emprendimiento?</h3>
          <p className="home__join-text">
            Forma parte de EmprendeLocal y lleva tu negocio al siguiente nivel.
            Crea tu perfil, comparte tus productos y conecta con más clientes de
            manera gratuita.
          </p>
          <a href="/registro" className="home__cta home__cta-join">
            Quiero Unirme
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;

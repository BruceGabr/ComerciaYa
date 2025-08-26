import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Crearemos este archivo para estilos
import ExplorarCard from "../../components/explorarCard/ExplorarCard";

import bannerImg from "../../assets/images/contabilidad.png";

const Home = () => {
  const [emprendimientosDestacados, setEmprendimientosDestacados] = useState([]);
  const [loadingDestacados, setLoadingDestacados] = useState(true);

  // Función para obtener los 3 emprendimientos más recientes
  const fetchEmprendimientosDestacados = async () => {
    try {
      setLoadingDestacados(true);
      const response = await fetch('http://localhost:5000/api/emprendimientos?limit=3&sort=createdAt&order=desc');
      const data = await response.json();
      setEmprendimientosDestacados(data);
    } catch (error) {
      console.error('Error al cargar emprendimientos destacados:', error);
      setEmprendimientosDestacados([]);
    } finally {
      setLoadingDestacados(false);
    }
  };

  useEffect(() => {
    fetchEmprendimientosDestacados();
  }, []);

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
          <h3 className="home__section-title">Emprendimientos Más Recientes</h3>
          
          {loadingDestacados ? (
            <div className="home__loading">
              <div className="home__spinner"></div>
              <p>Cargando emprendimientos...</p>
            </div>
          ) : emprendimientosDestacados.length === 0 ? (
            <div className="home__empty-state">
              <div className="home__empty-icon">🏪</div>
              <h4>No hay emprendimientos disponibles</h4>
              <p>Sé el primero en registrar tu emprendimiento</p>
              <Link to="/registro" className="home__cta">
                Registrar Emprendimiento
              </Link>
            </div>
          ) : (
            <div className="home__cards-grid">
              {emprendimientosDestacados.map((emprendimiento) => (
                <ExplorarCard
                  key={emprendimiento._id}
                  emprendimiento={emprendimiento}
                />
              ))}
            </div>
          )}

          {/* Enlace para ver todos los emprendimientos */}
          {emprendimientosDestacados.length > 0 && (
            <div className="home__view-all">
              <Link to="/explorar" className="home__view-all-btn">
                Ver todos los emprendimientos →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Sección de Beneficios */}
      <section className="home__benefits">
        <div className="container">
          <h3 className="home__section-title">
            Beneficios de Usar ComerciaYa
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
            ComerciaYa es una plataforma que conecta a emprendedores con
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
            Forma parte de ComerciaYa y lleva tu negocio al siguiente nivel.
            Crea tu perfil, comparte tus productos y conecta con más clientes de
            manera gratuita.
          </p>
          <Link to="/registro" className="home__cta home__cta-join">
            Quiero Unirme
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
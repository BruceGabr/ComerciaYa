// src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import './Header.css';

// Componente Navbar separado
const Navbar = ({ isAuthenticated, logout, isMenuOpen, setIsMenuOpen }) => {
  // Configuración de links para usuarios no autenticados
  const guestLinks = [
    { to: "/", label: "Inicio" },
    { to: "/explorar", label: "Explorar" },
    { to: "/registro", label: "Registrarse" },
    { to: "/login", label: "Iniciar sesión" }
  ];

  // Configuración de links para usuarios autenticados
  const authenticatedLinks = [
    { to: "/explorar", label: "Explorar" }
  ];

  // Seleccionar los links según el estado de autenticación
  const navLinks = isAuthenticated ? authenticatedLinks : guestLinks;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className={`header__nav ${isMenuOpen ? "header__nav--open" : ""}`}>
      <ul className="header__menu">
        {/* Mapeo de links dinámicos */}
        {navLinks.map((link, index) => (
          <li key={index} className="header__item">
            <Link
              to={link.to}
              className="header__link"
              onClick={handleLinkClick}
            >
              {link.label}
            </Link>
          </li>
        ))}
        
      </ul>
    </nav>
  );
};

// Componente Header principal
function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header__container">
        <a className="header__logo">ComerciaYa</a>

        {/* Ícono de menú hamburguesa (solo en móvil) */}
        <button
          className={`header__hamburger ${isMenuOpen ? "header__hamburger--open" : ""}`}
          onClick={toggleMenu}
        >
          <span className="header__hamburger-line"></span>
          <span className="header__hamburger-line"></span>
          <span className="header__hamburger-line"></span>
        </button>

        {/* Componente Navbar */}
        <Navbar 
          isAuthenticated={isAuthenticated}
          logout={logout}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>
    </header>
  );
}

export default Header;
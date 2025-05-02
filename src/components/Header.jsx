import React, { useState } from 'react';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);  // Estado para controlar el menú

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);  // Cambia el estado del menú al hacer clic en el ícono
  };

  return (
    <header className="header">
      <div className="container header__container">
        <h1 className="header__logo">EmprendeLocal</h1>
        {/* Ícono de menú hamburguesa (solo en móvil) */}
        <button className="header__hamburger" onClick={toggleMenu}>
          <span className="header__hamburger-line"></span>
          <span className="header__hamburger-line"></span>
          <span className="header__hamburger-line"></span>
        </button>
        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__menu">
            <li className="header__item"><a href="#" className="header__link">Inicio</a></li>
            <li className="header__item"><a href="#" className="header__link">Registro</a></li>
            <li className="header__item"><a href="#" className="header__link">Contacto</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;

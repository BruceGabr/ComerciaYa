// src/components/Footer.jsx

import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container container">
                <p className="footer__text">
                    © {new Date().getFullYear()} ComerciaYa. Todos los derechos reservados.
                </p>
                <div className="footer__contact">

                    <a className="header__logo">ComerciaYa</a>
                    <div className="footer__social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                            <i className="fab fa-twitter"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

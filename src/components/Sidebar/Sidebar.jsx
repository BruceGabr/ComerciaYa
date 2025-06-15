import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

function Sidebar({ isExpanded, setIsExpanded }) {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      to: "/perfil",
      icon: "fas fa-user",
      label: "Mi Perfil",
    },
    {
      to: "/dashboard",
      icon: "fas fa-briefcase",
      label: "Mis Emprendimientos",
    },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}>
      <div className="sidebar__header">
        <button 
          className="sidebar__toggle" 
          onClick={toggleSidebar}
          title={isExpanded ? "Contraer sidebar" : "Expandir sidebar"}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
        </button>
      </div>
      
      <hr className="sidebar__separator" />
      
      <ul className="sidebar__menu">
        {navItems.map(({ to, icon, label }) => (
          <li key={to} className="sidebar__item">
            <Link
              to={to}
              className={`sidebar__link ${
                location.pathname === to ? "sidebar__link--active" : ""
              }`}
              title={!isExpanded ? label : ""}
            >
              <i className={`sidebar__icon ${icon}`}></i>
              {isExpanded && <span className="sidebar__label">{label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="sidebar__separator" />

      <button 
        className="sidebar__logout" 
        onClick={logout}
        title={!isExpanded ? "Cerrar sesión" : ""}
      >
        <i className="fas fa-sign-out-alt sidebar__icon"></i>
        {isExpanded && <span className="sidebar__label">Cerrar sesión</span>}
      </button>
    </aside>
  );
}

export default Sidebar;
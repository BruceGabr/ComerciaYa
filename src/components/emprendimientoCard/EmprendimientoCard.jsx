import React from "react";
import "./EmprendimientoCard.css";

const EmprendimientoCard = ({ nombre, imagen, descripcion }) => {
  return (
    <div className="card-emprendimiento">
      <img
        src={imagen}
        alt={nombre}
        className="card-emprendimiento__image"
      />
      <h4 className="card-emprendimiento__name">{nombre}</h4>
      <p className="card-emprendimiento__description">{descripcion}</p>
      <button className="card-emprendimiento__button">Ver más</button>
    </div>
  );
};

export default EmprendimientoCard;

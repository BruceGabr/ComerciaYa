import React from "react";
import "./EmprendimientoCard.css"; // Importa el CSS específico para la tarjeta

const EmprendimientoCard = ({ nombre, imagen, descripcion }) => {
  return (
    <div className="explorar__card">
      <img
        src={imagen}
        alt={nombre}
        className="explorar__image"
      />
      <h4 className="explorar__name">{nombre}</h4>
      <p className="explorar__description">{descripcion}</p>
      <button className="explorar__button">Ver más</button>
    </div>
  );
};

export default EmprendimientoCard;

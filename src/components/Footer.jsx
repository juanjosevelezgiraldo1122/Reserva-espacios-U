import React from "react";
import "../styles/Footer.css";

const anioCreacion = 2026;

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="pie-pagina">
      <div className="contenedor">
        <div className="pie-pagina-fila">
          <span>Sistema de reservas de espacios</span>
          <span>Atención de 6:00 a 20:00</span>
        </div>

        <div className="pie-pagina-fila pie-pagina-fila-secundaria">
          <span className="pie-pagina-derechos">
            © {anioActual} Sistema de Reservas de Espacios. Creado en {anioCreacion}.
          </span>
          <span className="pie-pagina-asistencia">
            ¿Necesitas ayuda? Acércate a la oficina del campus.
          </span>
        </div>
      </div>
    </footer>
  );
}
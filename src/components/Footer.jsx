import { Link } from "react-router-dom";
import "../styles/Footer.css";

const anioCreacion = 2026;

export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="pie-pagina">
      <div className="contenedor">
        <div className="pie-pagina-principal">
          <div className="pie-pagina-marca">
            <Link to="/" className="pie-pagina-logo" aria-label="ReservaEspacios, inicio">
              <span className="pie-pagina-logo-icon">R</span>
              <span>Reserva<span>Espacios</span></span>
            </Link>
            <p>Sistema de reservas de espacios para la comunidad universitaria.</p>
          </div>

          <div className="pie-pagina-dato">
            <span className="pie-pagina-icono" aria-hidden="true">◷</span>
            <div><small>Horario de atención</small><strong>6:00 a. m. – 8:00 p. m.</strong></div>
          </div>

          <div className="pie-pagina-dato pie-pagina-ayuda">
            <span className="pie-pagina-icono" aria-hidden="true">?</span>
            <div><small>¿Necesitas ayuda?</small><strong>Acércate a la oficina del campus.</strong></div>
          </div>
        </div>

        <div className="pie-pagina-inferior">
          <span>© {anioActual} Sistema de Reservas de Espacios. Creado en {anioCreacion}.</span>
          <span className="pie-pagina-pie">Hecho para tu comunidad universitaria <i aria-hidden="true">✦</i></span>
        </div>
      </div>
    </footer>
  );
}

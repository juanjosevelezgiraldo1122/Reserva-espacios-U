import React from "react";
import "../styles/Home.css";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Register from "../login/Register";  /* Link de registro de usuario no eliminar*/
import InicioSesion from "../login/InicioSesion"; /* Link de inicio de sesion no eliminar */ 

const espacios = [
  { nombre: "Espacios comunes (10 Aulas comunes)", cupo: 100 },
  { nombre: "Sala de cómputo A", cupo: 30 },
  { nombre: "Sala de cómputo B", cupo: 20 },
  { nombre: "Sala de conferencias", cupo: 10 },
  { nombre: "Trabajo libre", cupo: 10 },
  { nombre: "Auditorio 1", cupo: 100 },
  { nombre: "Auditorio 2", cupo: 200 },
  { nombre: "Auditorio 3", cupo: 300 },
];

const pasos = [
  {
    numero: "1",
    titulo: "Regístrate",
    detalle: "Debes tener una cuenta activa antes de poder reservar cualquier espacio.",
  },
  {
    numero: "2",
    titulo: "Consulta disponibilidad",
    detalle: "Elige el espacio que necesitas y revisa qué horarios están libres en la fecha que quieres.",
  },
  {
    numero: "3",
    titulo: "Completa tus datos",
    detalle: "Ingresa la información mínima solicitada: motivo, número de personas y horario.",
  },
  {
    numero: "4",
    titulo: "Confirma tu solicitud",
    detalle: "Revisa el resumen y confirma. Recibirás la reserva con el espacio y el horario asignado.",
  },
];

export default function Home() {
  return (
    <div className="pagina">
      {/* Barra superior */}
      <header className="barra-superior">
        <div className="contenedor barra-superior-interior">
          <div className="marca">Reserva<span>Espacios</span></div>
          <nav className="navegacion">
            <a href="#espacios">Espacios</a>
            <a href="#pasos">Cómo reservar</a>
            <button className="boton boton-secundario"><Link to="/Register">Registrarme</Link></button>
            <button className="boton boton-primario"><Link to="/InicioSesion">Iniciar sesión</Link></button>
          </nav>
        </div>
      </header>

      {/* Bienvenida */}
      <section className="bienvenida">
        <div className="contenedor bienvenida-cuadricula">
          <div>
            <h1>Reserva tu espacio sin complicaciones</h1>
            <p>
              Consulta la disponibilidad de salas, auditorios y espacios de
              trabajo, y confirma tu reserva en pocos pasos. Solo necesitas
              estar registrado.
            </p>
            <div className="bienvenida-acciones">
              <button className="boton boton-primario">Consultar disponibilidad</button>
              <button className="boton boton-secundario">Ver cómo funciona</button>
            </div>
          </div>

          <div className="placa">
            <div className="placa-etiqueta">Horario de atención</div>
            <div className="placa-horas">6:00 – 20:00</div>
            <div className="placa-nota">Todos los días, sujeto a disponibilidad</div>
          </div>
        </div>
      </section>

      {/* Directorio de espacios */}
      <section id="espacios" className="directorio">
        <div className="contenedor">
          <h2>Espacios disponibles</h2>
          <p className="directorio-subtitulo">
            Esta es la capacidad de cada espacio. La disponibilidad real por
            fecha y hora se confirma en el paso de consulta.
          </p>
          <div className="lista">
            {espacios.map((espacio) => (
              <div className="fila" key={espacio.nombre}>
                <span className="fila-nombre">{espacio.nombre}</span>
                <span>
                  <span className="fila-cupo">{espacio.cupo}</span>
                  <span className="fila-cupo-etiqueta">puestos</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paso a paso */}
      <section id="pasos" className="pasos">
        <div className="contenedor">
          <h2>Cómo reservar un espacio</h2>
          <p className="pasos-subtitulo">
            El proceso tiene cuatro pasos y toma solo unos minutos.
          </p>
          <div className="pasos-lista">
            {pasos.map((paso) => (
              <div className="paso" key={paso.numero}>
                <div className="paso-numero">{paso.numero}</div>
                <div className="paso-titulo">{paso.titulo}</div>
                <div className="paso-detalle">{paso.detalle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aviso */}
      <div className="contenedor">
        <div className="aviso">
          <div className="aviso-titulo">Recuerda activar tu reserva</div>
          <div className="aviso-texto">
            Debes activar tu reserva 5 minutos antes de la hora asignada.
            Si no la activas a tiempo, el espacio puede liberarse para
            otro usuario.
          </div>
        </div>
      </div>

        <Footer />
     
    </div>
  );
}
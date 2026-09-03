import React, { useState } from "react";
import "../styles/InicioSesion.css";
import { Link } from "react-router-dom";



const datosIniciales = {
  correo: "",
  contrasena: "",
};

export default function InicioSesion({ onIniciarSesion }) {
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos((anterior) => ({ ...anterior, [name]: value }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!datos.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo válido.";
    }

    if (!datos.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria.";
    }

    return nuevosErrores;
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setErrorGeneral("");

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    const payload = {
      correo: datos.correo.trim(),
      contrasena: datos.contrasena,
    };

    if (!onIniciarSesion) {
      console.log("Datos listos para enviar al backend:", payload);
      return;
    }

    try {
      setEnviando(true);
      await onIniciarSesion(payload);
    } catch (error) {
      setErrorGeneral("Correo o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="acceso">
      <div className="acceso-contenedor">
        <div className="acceso-tarjeta">
          <div className="acceso-encabezado">
            <div className="marca">Reserva<span>Espacios</span></div>
            <h1>Inicia sesión</h1>
            <p>Ingresa con tu correo y contraseña para reservar un espacio.</p>
          </div>

          {errorGeneral && <div className="acceso-error-general">{errorGeneral}</div>}

          <form className="acceso-formulario" onSubmit={manejarEnvio} noValidate>
            <div className="campo">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                maxLength={150}
                value={datos.correo}
                onChange={manejarCambio}
                autoComplete="email"
              />
              {errores.correo && <span className="campo-error">{errores.correo}</span>}
            </div>

            <div className="campo">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                value={datos.contrasena}
                onChange={manejarCambio}
                autoComplete="current-password"
              />
              {errores.contrasena && <span className="campo-error">{errores.contrasena}</span>}
            </div>

            <button type="submit" className="boton boton-primario acceso-boton" disabled={enviando}>
              {enviando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="acceso-pie">
            ¿Aún no tienes cuenta? <Link to="/Register">Regístrate</Link>
          </p>
          <p className="acceso-pie">
            ¿Olvidaste tu contraseña? <Link to="/RecuperarContrasena">Recupérala</Link>
          </p>
          <p className="acceso-pie">
            <Link to="/">Volver a la página principal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
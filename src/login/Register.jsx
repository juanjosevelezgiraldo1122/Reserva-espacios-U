import React, { useState } from "react";
import "../styles/Register.css";
import { Link } from "react-router-dom";


const roles = [
  { id: 1, nombre: "Estudiante" },
  { id: 2, nombre: "Docente" },
  { id: 3, nombre: "Administrativo" },
];

const programas = [
  { id: 1, nombre: "Ingeniería de Sistemas" },
  { id: 2, nombre: "Ingeniería Industrial" },
  { id: 3, nombre: "Administración de Empresas" },
  { id: 4, nombre: "Derecho" },
];

const datosIniciales = {
  cedula: "",
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: "",
  contrasena: "",
  confirmarContrasena: "",
  idRol: "",
  idPrograma: "",
};

export default function Register({ onRegistrar }) {
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos((anterior) => ({ ...anterior, [name]: value }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!datos.cedula.trim()) {
      nuevosErrores.cedula = "La cédula es obligatoria.";
    } else if (!/^\d{5,20}$/.test(datos.cedula.trim())) {
      nuevosErrores.cedula = "Ingresa solo números, entre 5 y 20 dígitos.";
    }

    if (!datos.nombres.trim()) {
      nuevosErrores.nombres = "Los nombres son obligatorios.";
    }

    if (!datos.apellidos.trim()) {
      nuevosErrores.apellidos = "Los apellidos son obligatorios.";
    }

    if (!datos.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo válido.";
    }

    if (datos.telefono && !/^\d{7,20}$/.test(datos.telefono.trim())) {
      nuevosErrores.telefono = "Ingresa solo números, entre 7 y 20 dígitos.";
    }

    if (!datos.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria.";
    } else if (datos.contrasena.length < 8) {
      nuevosErrores.contrasena = "Debe tener al menos 8 caracteres.";
    }

    if (datos.confirmarContrasena !== datos.contrasena) {
      nuevosErrores.confirmarContrasena = "Las contraseñas no coinciden.";
    }

    if (!datos.idRol) {
      nuevosErrores.idRol = "Selecciona un rol.";
    }

    return nuevosErrores;
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setEnviado(false);
      return;
    }

    const payload = {
      cedula: datos.cedula.trim(),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim(),
      telefono: datos.telefono.trim() || null,
      contrasena: datos.contrasena,
      id_rol: Number(datos.idRol),
      id_programa: datos.idPrograma ? Number(datos.idPrograma) : null,
    };

    if (onRegistrar) {
      onRegistrar(payload);
    } else {
      console.log("Datos listos para enviar al backend:", payload);
    }

    setEnviado(true);
  };

  return (
    <div className="registro">
      <div className="registro-contenedor">
        <div className="registro-tarjeta">
          <div className="registro-encabezado">
            <div className="marca">Reserva<span>Espacios</span></div>
            <h1>Crea tu cuenta</h1>
            <p>Regístrate para poder consultar disponibilidad y reservar espacios.</p>
          </div>

          {enviado && (
            <div className="registro-exito">
              Registro enviado correctamente.
            </div>
          )}

          <form className="registro-formulario" onSubmit={manejarEnvio} noValidate>
            <div className="campo">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                inputMode="numeric"
                maxLength={20}
                value={datos.cedula}
                onChange={manejarCambio}
              />
              {errores.cedula && <span className="campo-error">{errores.cedula}</span>}
            </div>

            <div className="campo-fila">
              <div className="campo">
                <label htmlFor="nombres">Nombres</label>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  maxLength={100}
                  value={datos.nombres}
                  onChange={manejarCambio}
                />
                {errores.nombres && <span className="campo-error">{errores.nombres}</span>}
              </div>

              <div className="campo">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  maxLength={100}
                  value={datos.apellidos}
                  onChange={manejarCambio}
                />
                {errores.apellidos && <span className="campo-error">{errores.apellidos}</span>}
              </div>
            </div>

            <div className="campo">
              <label htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                maxLength={150}
                value={datos.correo}
                onChange={manejarCambio}
              />
              {errores.correo && <span className="campo-error">{errores.correo}</span>}
            </div>

            <div className="campo">
              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                maxLength={20}
                value={datos.telefono}
                onChange={manejarCambio}
              />
              {errores.telefono && <span className="campo-error">{errores.telefono}</span>}
            </div>

            <div className="campo-fila">
              <div className="campo">
                <label htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  value={datos.contrasena}
                  onChange={manejarCambio}
                />
                {errores.contrasena && <span className="campo-error">{errores.contrasena}</span>}
              </div>

              <div className="campo">
                <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
                <input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type="password"
                  value={datos.confirmarContrasena}
                  onChange={manejarCambio}
                />
                {errores.confirmarContrasena && (
                  <span className="campo-error">{errores.confirmarContrasena}</span>
                )}
              </div>
            </div>

            <div className="campo-fila">
              <div className="campo">
                <label htmlFor="idRol">Rol</label>
                <select id="idRol" name="idRol" value={datos.idRol} onChange={manejarCambio}>
                  <option value="">Selecciona un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
                {errores.idRol && <span className="campo-error">{errores.idRol}</span>}
              </div>

              <div className="campo">
                <label htmlFor="idPrograma">Programa (opcional)</label>
                <select
                  id="idPrograma"
                  name="idPrograma"
                  value={datos.idPrograma}
                  onChange={manejarCambio}
                >
                  <option value="">No aplica</option>
                  {programas.map((programa) => (
                    <option key={programa.id} value={programa.id}>
                      {programa.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="boton boton-primario registro-boton">
              Crear cuenta
            </button>
          </form>

          <p className="registro-pie">
            ¿Ya tienes cuenta? <Link to="/InicioSesion">Iniciar sesión</Link>
          </p>
          <p className="registro-pie">
          <Link to="/">Volver a la página principal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
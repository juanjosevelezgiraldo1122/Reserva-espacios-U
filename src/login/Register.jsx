import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Register.css";

const roles = ["Estudiante", "Docente", "Administrativo"];
const programs = ["Ingeniería de Sistemas", "Ingeniería Industrial", "Administración de Empresas", "Derecho"];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ nombres: "", apellidos: "", documento: "", anioNacimiento: "", correo: "", telefono: "", contrasena: "", confirmar: "", idRol: "", programa: "" });
  const [error, setError] = useState("");
  const change = (event) => setData({ ...data, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault(); setError("");
    if (!data.nombres || !data.apellidos || !data.documento || !data.anioNacimiento || !data.correo || !data.contrasena || !data.idRol) { setError("Completa todos los campos obligatorios."); return; }
    if (!/^[0-9]{5,15}$/.test(data.documento)) { setError("La cédula debe contener entre 5 y 15 números."); return; }
    if (!/^[^\s@]+@amigo\.edu\.co$/i.test(data.correo)) { setError("Usa tu correo institucional con dominio @amigo.edu.co."); return; }
    if (data.contrasena.length < 8 || !/[A-Z]/.test(data.contrasena) || !/[0-9]/.test(data.contrasena)) { setError("La contraseña debe tener 8 caracteres, una mayúscula y un número."); return; }
    if (data.contrasena !== data.confirmar) { setError("Las contraseñas no coinciden."); return; }
    try { register({ ...data, idRol: Number(data.idRol), programa: data.programa || "Comunidad universitaria" }); navigate("/app/dashboard"); } catch (err) { setError(err.message); }
  };
  return <div className="auth-page register-page"><div className="auth-aside"><Link to="/" className="auth-brand"><span>R</span>Reserva<span>Espacios</span></Link><div><span className="eyebrow">Hazte parte</span><h2>Un lugar para<br />hacerlo <em>posible.</em></h2><p>Regístrate y empieza a reservar espacios pensados para tus ideas.</p></div><small>© 2026 ReservaEspacios</small></div><div className="auth-content"><div className="auth-card register-card"><Link to="/" className="mobile-brand">Reserva<span>Espacios</span></Link><span className="eyebrow">Comunidad universitaria</span><h1>Crea tu cuenta</h1><p className="auth-description">Usa tus datos institucionales para identificar al responsable de cada reserva.</p>{error && <div className="auth-error">{error}</div>}<form onSubmit={submit} noValidate><div className="form-row"><label>Nombres<input name="nombres" placeholder="Tus nombres" value={data.nombres} onChange={change} /></label><label>Apellidos<input name="apellidos" placeholder="Tus apellidos" value={data.apellidos} onChange={change} /></label></div><div className="form-row"><label>Cédula<input name="documento" inputMode="numeric" placeholder="Número de documento" value={data.documento} onChange={change} /></label><label>Año de nacimiento<input name="anioNacimiento" type="number" min="1900" max={new Date().getFullYear() - 10} placeholder="Ej. 2002" value={data.anioNacimiento} onChange={change} /></label></div><label>Correo institucional<input name="correo" type="email" placeholder="tu.correo@amigo.edu.co" value={data.correo} onChange={change} /></label><div className="form-row"><label>Rol<select name="idRol" value={data.idRol} onChange={change}><option value="">Selecciona</option>{roles.map((role, index) => <option value={index + 1} key={role}>{role}</option>)}</select></label><label>Programa <span className="optional">(opcional)</span><select name="programa" value={data.programa} onChange={change}><option value="">Selecciona</option>{programs.map((program) => <option value={program} key={program}>{program}</option>)}</select></label></div><label>Teléfono <span className="optional">(opcional)</span><input name="telefono" type="tel" placeholder="300 000 0000" value={data.telefono} onChange={change} /></label><div className="form-row"><label>Contraseña<input name="contrasena" type="password" placeholder="8 caracteres, mayúscula y número" value={data.contrasena} onChange={change} /></label><label>Confirmar contraseña<input name="confirmar" type="password" placeholder="Repite tu contraseña" value={data.confirmar} onChange={change} /></label></div><button className="btn btn-primary auth-button">Crear mi cuenta →</button></form><p className="auth-footer">¿Ya tienes una cuenta? <Link to="/InicioSesion">Inicia sesión</Link></p><Link className="back-home" to="/">← Volver al inicio</Link></div></div></div>;
}

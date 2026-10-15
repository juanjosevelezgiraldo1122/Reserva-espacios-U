import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/InicioSesion.css";

export default function InicioSesion() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState({ correo: "", contrasena: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const change = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  const enterDemo = () => {
    setError("");
    setEnviando(true);
    try { login("demo@universidad.edu.co", "Demo123!"); navigate("/app/dashboard"); } catch { setError("No fue posible abrir la cuenta demo."); } finally { setEnviando(false); }
  };
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!datos.correo || !datos.contrasena) { setError("Completa tu correo y contraseña para continuar."); return; }
    setEnviando(true);
    try { login(datos.correo, datos.contrasena); navigate("/app/dashboard"); } catch { setError("No encontramos una cuenta con estos datos."); } finally { setEnviando(false); }
  };
  return <div className="auth-page"><div className="auth-aside"><Link to="/" className="auth-brand"><span>R</span>Reserva<span>Espacios</span></Link><div><span className="eyebrow">Tu campus, más cerca</span><h2>Todo empieza<br />con un <em>espacio.</em></h2><p>Encuentra el lugar perfecto para estudiar, crear y compartir.</p></div><small>© 2026 ReservaEspacios</small></div><div className="auth-content"><div className="auth-card"><Link to="/" className="mobile-brand">Reserva<span>Espacios</span></Link><span className="eyebrow">Bienvenido de nuevo</span><h1>Inicia sesión</h1><p className="auth-description">Ingresa para gestionar tus reservas y descubrir nuevos espacios.</p>{error && <div className="auth-error">{error}</div>}<form onSubmit={submit} noValidate><label>Correo institucional o cédula<input name="correo" type="text" placeholder="tu.correo@amigo.edu.co o tu cédula" value={datos.correo} onChange={change} autoComplete="username" /></label><label>Contraseña<input name="contrasena" type="password" placeholder="Ingresa tu contraseña" value={datos.contrasena} onChange={change} autoComplete="current-password" /></label><div className="form-options"><label className="check-label"><input type="checkbox" /> Recordarme</label><button type="button" className="forgot" onClick={() => setError("Escríbenos a espacios@amigo.edu.co para recuperar tu acceso.")}>¿Olvidaste tu contraseña?</button></div><button className="btn btn-primary auth-button" disabled={enviando}>{enviando ? "Ingresando..." : "Iniciar sesión →"}</button></form><div className="auth-demo"><span>Acceso rápido para probar la plataforma</span><button type="button" onClick={enterDemo} disabled={enviando}>Entrar con cuenta demo →</button><small>demo@universidad.edu.co · Demo123!</small></div><p className="auth-footer">¿Aún no tienes una cuenta? <Link to="/Register">Crea tu cuenta</Link></p><Link className="back-home" to="/">← Volver al inicio</Link></div></div></div>;
}

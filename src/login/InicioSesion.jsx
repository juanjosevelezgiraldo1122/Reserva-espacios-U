import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { demoUsers, useAuth } from "../context/AuthContext";
import "../styles/InicioSesion.css";

export default function InicioSesion() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState({ correo: "", contrasena: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [googleSending, setGoogleSending] = useState(false);
  const change = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  const enterDemo = async (demo) => {
    setError("");
    setEnviando(true);
    try { await login(demo.correo, "Demo123!"); navigate("/app/dashboard"); } catch (loginError) { setError(loginError.message || "No fue posible abrir la cuenta de prueba."); } finally { setEnviando(false); }
  };
  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (!datos.correo || !datos.contrasena) { setError("Completa tu correo y contraseña para continuar."); return; }
    setEnviando(true);
    try { await login(datos.correo, datos.contrasena); navigate("/app/dashboard"); } catch (loginError) { setError(loginError.message || "No encontramos una cuenta con estos datos."); } finally { setEnviando(false); }
  };
  const enterWithGoogle = async () => {
    setError("");
    setGoogleSending(true);
    try { await loginWithGoogle(); navigate("/app/dashboard"); } catch (loginError) { setError(loginError.message || "No fue posible iniciar sesión con Google."); } finally { setGoogleSending(false); }
  };
  return <div className="auth-page"><div className="auth-aside"><Link to="/" className="auth-brand"><span>R</span>Reserva<span>Espacios</span></Link><div><span className="eyebrow">Tu campus, más cerca</span><h2>Todo empieza<br />con un <em>espacio.</em></h2><p>Encuentra el lugar perfecto para estudiar, crear y compartir.</p></div><small>© 2026 ReservaEspacios</small></div><div className="auth-content"><div className="auth-card"><Link to="/" className="mobile-brand">Reserva<span>Espacios</span></Link><span className="eyebrow">Bienvenido de nuevo</span><h1>Inicia sesión</h1><p className="auth-description">Ingresa para gestionar tus reservas y descubrir nuevos espacios.</p>{error && <div className="auth-error" role="alert">{error}</div>}<form onSubmit={submit} noValidate><label>Correo institucional o cédula<input name="correo" type="text" placeholder="tu.correo@amigo.edu.co o tu cédula" value={datos.correo} onChange={change} autoComplete="username" /></label><label>Contraseña<input name="contrasena" type="password" placeholder="Ingresa tu contraseña" value={datos.contrasena} onChange={change} autoComplete="current-password" /></label><div className="form-options"><label className="check-label"><input type="checkbox" /> Recordarme</label><Link to="/RecuperarContrasena" className="forgot">¿Olvidaste tu contraseña?</Link></div><button className="btn btn-primary auth-button" disabled={enviando || googleSending}>{enviando ? "Ingresando..." : "Iniciar sesión →"}</button></form><div className="auth-divider"><span>o continúa con</span></div><button type="button" className="google-button" onClick={enterWithGoogle} disabled={googleSending || enviando}><span className="google-mark" aria-hidden="true">G</span>{googleSending ? "Conectando con Google…" : "Continuar con Google"}</button><div className="auth-demo"><span>Cuentas de prueba</span><small>Selecciona un rol para ingresar:</small><div className="demo-accounts">{[demoUsers.estudiante, demoUsers.administrador].map((demo) => <div className="demo-account" key={demo.id}><div><b>{demo.rol}</b><small>{demo.correo}</small></div><button type="button" onClick={() => enterDemo(demo)} disabled={enviando || googleSending}>Probar →</button></div>)}</div><small>Contraseña para ambas cuentas: <b>Demo123!</b></small></div><p className="auth-footer">¿Aún no tienes una cuenta? <Link to="/Register">Crea tu cuenta</Link></p><Link className="back-home" to="/">← Volver al inicio</Link></div></div></div>;
}

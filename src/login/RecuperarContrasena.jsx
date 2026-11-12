import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/InicioSesion.css";

export default function RecuperarContrasena() {
  const { recoverPassword } = useAuth();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!correo.trim()) {
      setError("Escribe el correo asociado a tu cuenta.");
      return;
    }
    if (!/^[^\s@]+@amigo\.edu\.co$/i.test(correo.trim())) {
      setError("Por ahora solo puedes recuperar cuentas con correo @amigo.edu.co.");
      return;
    }
    setSending(true);
    try {
      await recoverPassword(correo);
      setSuccess(true);
    } catch (recoveryError) {
      setError(recoveryError.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-aside">
        <Link to="/" className="auth-brand"><span>R</span>Reserva<span>Espacios</span></Link>
        <div><span className="eyebrow">Recupera tu acceso</span><h2>Volver a<br />tu <em>espacio.</em></h2><p>Te enviaremos un enlace para crear una contraseña nueva.</p></div>
        <small>© 2026 ReservaEspacios</small>
      </div>
      <div className="auth-content">
        <div className="auth-card recovery-card">
          <Link to="/" className="mobile-brand">Reserva<span>Espacios</span></Link>
          <span className="eyebrow">Seguridad de la cuenta</span>
          <h1>Recuperar contraseña</h1>
          <p className="auth-description">Ingresa tu correo y, si está vinculado a una cuenta, recibirás un enlace para restablecer la contraseña.</p>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {success ? (
            <div className="recovery-success" role="status">
              <strong>Revisa tu correo</strong>
              <p>Si hay una cuenta asociada a esa dirección, te enviaremos un enlace para restablecer la contraseña. Revisa también la carpeta de spam.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label>Correo institucional<input name="correo" type="email" placeholder="tu.correo@amigo.edu.co" value={correo} onChange={(event) => setCorreo(event.target.value)} autoComplete="email" /></label>
              <button className="btn btn-primary auth-button" disabled={sending}>{sending ? "Enviando…" : "Enviar enlace de recuperación →"}</button>
            </form>
          )}
          <p className="auth-footer">¿Recordaste tu contraseña? <Link to="/InicioSesion">Inicia sesión</Link></p>
          <Link className="back-home" to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

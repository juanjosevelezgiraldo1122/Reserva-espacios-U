import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

export default function Profile() {
  const { user } = useAuth();
  const initials = (user?.nombres?.[0] || "U") + (user?.apellidos?.[0] || "");
  return <div className="profile-page"><div className="page-heading"><div><span className="eyebrow">Cuenta personal</span><h1>Mi perfil</h1><p>Administra tus datos y preferencias de reserva.</p></div></div><div className="profile-grid"><section className="profile-hero panel"><div className="large-avatar">{initials}</div><h2>{user?.nombres} {user?.apellidos}</h2><span className="profile-role">{user?.rol}</span><p>{user?.programa}</p><button className="btn btn-secondary">Editar perfil</button></section><section className="profile-form panel"><div className="section-title"><h2>Información personal</h2><span className="verified">✓ Cuenta verificada</span></div><div className="profile-fields"><label>Nombre completo<input value={(user?.nombres || "") + " " + (user?.apellidos || "")} readOnly /></label><label>Correo institucional<input value={user?.correo || ""} readOnly /></label><label>Teléfono<input value={user?.telefono || "No registrado"} readOnly /></label><label>Programa académico<input value={user?.programa || ""} readOnly /></label></div><div className="profile-security"><span>⌑</span><div><strong>Tu información está protegida</strong><p>Usamos tus datos únicamente para gestionar tus reservas.</p></div></div></section></div></div>;
}

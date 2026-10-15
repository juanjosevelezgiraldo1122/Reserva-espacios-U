import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AppShell.css";

const navItems = [
  { to: "/app/dashboard", label: "Resumen", icon: "⌂" },
  { to: "/app/reservar", label: "Reservar espacio", icon: "+" },
  { to: "/app/reservas", label: "Mis reservas", icon: "▤" },
];

export default function LayoutPrivado() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = (user?.nombres?.[0] || "U") + (user?.apellidos?.[0] || "");
  const salir = () => { logout(); navigate("/"); };
  const pageName = location.pathname.includes("reservar") ? "Reservar espacio" : location.pathname.includes("reservas") ? "Mis reservas" : location.pathname.includes("perfil") ? "Mi perfil" : location.pathname.includes("ayuda") ? "Centro de ayuda" : "Resumen";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/app/dashboard" className="brand"><span className="brand-mark">R</span><span>Reserva<span className="brand-accent">Espacios</span></span></NavLink>
        <div className="sidebar-label">MENÚ PRINCIPAL</div>
        <nav className="side-nav">{navItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "side-link active" : "side-link"}><span className="side-icon">{item.icon}</span>{item.label}</NavLink>)}</nav>
        <div className="sidebar-label">RECURSOS</div>
        <nav className="side-nav">
          <NavLink to="/app/perfil" className={({ isActive }) => isActive ? "side-link active" : "side-link"}><span className="side-icon">◎</span>Mi perfil</NavLink>
          <NavLink to="/app/ayuda" className={({ isActive }) => isActive ? "side-link active" : "side-link"}><span className="side-icon">?</span>Centro de ayuda</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><span>✦</span><strong>¿Necesitas ayuda?</strong><small>Estamos aquí para orientarte.</small><NavLink to="/app/ayuda">Ver centro de ayuda →</NavLink></div>
          <button className="logout-button" onClick={salir}><span>↪</span>Cerrar sesión</button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="breadcrumb"><span>ReservaEspacios</span><b>/</b><strong>{pageName}</strong></div>
          <div className="topbar-actions"><button className="notification" aria-label="Notificaciones">♧<i /></button><button className="profile-chip" onClick={() => navigate("/app/perfil")}><span className="avatar">{initials}</span><span className="profile-name"><b>{user?.nombres}</b><small>{user?.rol}</small></span><span className="chevron">⌄</span></button></div>
        </header>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}

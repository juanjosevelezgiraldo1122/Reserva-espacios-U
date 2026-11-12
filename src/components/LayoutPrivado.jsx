import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearNotifications, markNotificationsRead, readNotifications, startReservationReminders, subscribeNotifications } from "../utils/notifications";
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
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const initials = (user?.nombres?.[0] || "U") + (user?.apellidos?.[0] || "");
  const visibleNavItems = user?.rol === "Administrador"
    ? [...navItems.filter((item) => item.to !== "/app/reservar"), { to: "/app/reportes", label: "Reportes", icon: "▥" }, { to: "/app/usuarios", label: "Usuarios", icon: "♙" }]
    : navItems;
  const salir = () => { logout(); navigate("/"); };
  const pageName = location.pathname.includes("usuarios") ? "Usuarios y roles" : location.pathname.includes("reportes") ? "Reportes agregados" : location.pathname.includes("reservar") ? "Reservar espacio" : location.pathname.includes("reservas") ? (user?.rol === "Administrador" ? "Gestionar reservas" : "Mis reservas") : location.pathname.includes("perfil") ? "Mi perfil" : location.pathname.includes("ayuda") ? "Centro de ayuda" : "Resumen";

  useEffect(() => {
    const email = user?.correo;
    if (!email) {
      setNotifications([]);
      return undefined;
    }
    setNotifications(readNotifications(email));
    const unsubscribe = subscribeNotifications(email, () => setNotifications(readNotifications(email)));
    const stopReminders = user?.rol === "Administrador" ? () => {} : startReservationReminders(email);
    return () => {
      unsubscribe();
      stopReminders();
    };
  }, [user?.correo, user?.rol]);

  const toggleNotifications = () => {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }
    if (user?.correo) markNotificationsRead(user.correo);
    setNotifications(user?.correo ? readNotifications(user.correo).map((item) => ({ ...item, read: true })) : []);
    setNotificationsOpen(true);
  };

  const clearAllNotifications = () => {
    if (user?.correo) clearNotifications(user.correo);
    setNotifications([]);
  };
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/app/dashboard" className="brand"><span className="brand-mark">R</span><span>Reserva<span className="brand-accent">Espacios</span></span></NavLink>
        <div className="sidebar-label">MENÚ PRINCIPAL</div>
        <nav className="side-nav">{visibleNavItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "side-link active" : "side-link"}><span className="side-icon">{item.icon}</span>{user?.rol === "Administrador" && item.to === "/app/reservas" ? "Gestionar reservas" : item.label}</NavLink>)}</nav>
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
          <div className="topbar-actions"><div className="notification-wrapper"><button className="notification" aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ""}`} aria-expanded={notificationsOpen} onClick={toggleNotifications}>♧{unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>{notificationsOpen && <section className="notification-popover" aria-label="Notificaciones de reservas"><div className="notification-popover-header"><div><strong>Notificaciones</strong><small>Recordatorios de tus reservas</small></div><button type="button" onClick={clearAllNotifications} disabled={!notifications.length}>Limpiar</button></div>{notifications.length ? <div className="notification-list">{notifications.map((item) => <article className={item.read ? "notification-item read" : "notification-item"} key={item.id}><div className="notification-item-heading"><strong>{item.title}</strong><time>{new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" }).format(new Date(item.time))}</time></div><p>{item.message}</p>{item.details?.length > 0 && <dl className="notification-details">{item.details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>}<Link to="/app/reservas" onClick={() => setNotificationsOpen(false)}>{item.actionLabel || "Ver reserva →"}</Link></article>)}</div> : <p className="notification-empty">Aún no tienes notificaciones.</p>}</section>}</div><button className="profile-chip" onClick={() => navigate("/app/perfil")}><span className="avatar">{initials}</span><span className="profile-name"><b>{user?.nombres}</b><small>{user?.rol}</small></span><span className="chevron">⌄</span></button></div>
        </header>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}

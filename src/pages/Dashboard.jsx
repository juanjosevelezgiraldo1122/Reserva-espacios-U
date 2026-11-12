import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { spaces } from "../data/spaces";
import { readReservations, subscribeReservations } from "../utils/reservations";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "Administrador";
  const [allReservations, setAllReservations] = useState(readReservations);
  useEffect(() => subscribeReservations(() => setAllReservations(readReservations())), []);
  const reservations = allReservations.filter((item) => (isAdmin || item.user === user?.correo) && item.status !== "Cancelada");
  const pendingApprovals = allReservations.filter((item) => item.status.startsWith("Pendiente")).length;
  const activeCount = reservations.length;
  const nextReservation = reservations[0];

  return (
    <div className="dashboard">
      <div className="page-heading dashboard-heading"><div><span className="eyebrow">{isAdmin ? "Administración" : "Panel personal"}</span><h1>Hola, {user?.nombres || "comunidad"} <span className="wave">✦</span></h1><p>{isAdmin ? "Supervisa las reservas y solicitudes de la comunidad universitaria." : "Todo lo que necesitas para aprovechar tus espacios, en un solo lugar."}</p></div>{isAdmin ? <Link to="/app/reservas" className="btn btn-primary">Revisar solicitudes · {pendingApprovals}</Link> : <Link to="/app/reservar" className="btn btn-primary">+ Nueva reserva</Link>}</div>
      <section className="welcome-card"><div><span className="welcome-tag">{isAdmin ? "GESTIÓN EN TIEMPO REAL" : "TU CAMPUS, A TU RITMO"}</span><h2>{isAdmin ? <>Cada espacio,<br />bien coordinado.</> : <>Encuentra el espacio ideal<br />para cada momento.</>}</h2><p>{isAdmin ? "Gestiona solicitudes de aprobación y consulta la actividad de reservas." : "Consulta disponibilidad en tiempo real y reserva en menos de dos minutos."}</p><Link to={isAdmin ? "/app/reservas" : "/app/reservar"} className="welcome-link">{isAdmin ? "Gestionar reservas" : "Explorar espacios"} <span>→</span></Link></div><div className="welcome-art"><div className="art-circle circle-one" /><div className="art-circle circle-two" /><div className="art-building">▦</div></div></section>
      <div className="stat-grid"><div className="stat-card"><span className="stat-icon orange">▤</span><div><small>Reservas activas</small><strong>{activeCount}</strong><em className="positive">{isAdmin ? "En toda la comunidad" : "Tus espacios guardados"}</em></div></div><div className="stat-card"><span className="stat-icon green">◷</span><div><small>{isAdmin ? "Por aprobar" : "Horas reservadas"}</small><strong>{isAdmin ? pendingApprovals : activeCount * 2}</strong><em>{isAdmin ? "Solicitudes pendientes" : "Este mes"}</em></div></div><div className="stat-card"><span className="stat-icon blue">⌖</span><div><small>Espacios disponibles</small><strong>{spaces.length}</strong><em>Para tu comunidad</em></div></div></div>
      <div className="dashboard-columns"><section><div className="section-title"><h2>{isAdmin ? "Actividad reciente" : "Tu próxima reserva"}</h2><Link to="/app/reservas">Ver todas</Link></div>{nextReservation ? <div className="next-reservation panel"><div className="reservation-date"><strong>{new Date(nextReservation.date + "T12:00:00").getDate()}</strong><span>{new Intl.DateTimeFormat("es-CO", { month: "short" }).format(new Date(nextReservation.date + "T12:00:00")).replace(".", "")}</span></div><div className="reservation-info"><div><h3>{nextReservation.spaceName}</h3><p>{nextReservation.time} · {nextReservation.duration || "2 horas"} · {nextReservation.floor}{isAdmin ? " · " + nextReservation.user : ""}</p></div><span className={nextReservation.status === "Confirmada" ? "status-pill confirmed" : "status-pill pending"}>{nextReservation.status}</span></div><Link to="/app/reservas" className="reservation-arrow">→</Link></div> : <div className="panel empty-state"><div className="empty-state-icon">⌖</div><strong>{isAdmin ? "No hay reservas activas" : "Aún no tienes reservas"}</strong><p>{isAdmin ? "Las reservas de la comunidad aparecerán aquí." : "Encuentra un espacio para comenzar."}</p>{!isAdmin && <Link to="/app/reservar" className="btn btn-secondary" style={{ marginTop: 16 }}>Buscar espacios</Link>}</div>}</section><section><div className="section-title"><h2>Espacios destacados</h2>{!isAdmin && <Link to="/app/reservar">Explorar todos</Link>}</div><div className="featured-list">{spaces.slice(0, 3).map((space) => <div className="featured-space panel" key={space.id}><span className="space-thumb" style={{ background: space.color }}>{space.icon}</span><span><strong>{space.name}</strong><small>{space.capacity} personas · {space.floor}</small></span></div>)}</div></section></div>
    </div>
  );
}

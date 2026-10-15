import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { spaces } from "../data/spaces";
import { readReservations } from "../utils/reservations";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const reservations = readReservations().filter((item) => item.user === user?.correo && item.status !== "Cancelada");
  const activeCount = reservations.length;
  const nextReservation = reservations[0];

  return (
    <div className="dashboard">
      <div className="page-heading dashboard-heading"><div><span className="eyebrow">Panel personal</span><h1>Hola, {user?.nombres || "comunidad"} <span className="wave">✦</span></h1><p>Todo lo que necesitas para aprovechar tus espacios, en un solo lugar.</p></div><Link to="/app/reservar" className="btn btn-primary">+ Nueva reserva</Link></div>
      <section className="welcome-card"><div><span className="welcome-tag">TU CAMPUS, A TU RITMO</span><h2>Encuentra el espacio ideal<br />para cada momento.</h2><p>Consulta disponibilidad en tiempo real y reserva en menos de dos minutos.</p><Link to="/app/reservar" className="welcome-link">Explorar espacios <span>→</span></Link></div><div className="welcome-art"><div className="art-circle circle-one" /><div className="art-circle circle-two" /><div className="art-building">▦</div></div></section>
      <div className="stat-grid"><div className="stat-card"><span className="stat-icon orange">▤</span><div><small>Reservas activas</small><strong>{activeCount}</strong><em className="positive">Tus espacios guardados</em></div></div><div className="stat-card"><span className="stat-icon green">◷</span><div><small>Horas reservadas</small><strong>{activeCount * 2}</strong><em>Este mes</em></div></div><div className="stat-card"><span className="stat-icon blue">⌖</span><div><small>Espacios disponibles</small><strong>{spaces.length}</strong><em>Para tu comunidad</em></div></div></div>
      <div className="dashboard-columns"><section><div className="section-title"><h2>Tu próxima reserva</h2><Link to="/app/reservas">Ver todas</Link></div>{nextReservation ? <div className="next-reservation panel"><div className="reservation-date"><strong>{new Date(nextReservation.date + "T12:00:00").getDate()}</strong><span>{new Intl.DateTimeFormat("es-CO", { month: "short" }).format(new Date(nextReservation.date + "T12:00:00")).replace(".", "")}</span></div><div className="reservation-info"><div><h3>{nextReservation.spaceName}</h3><p>{nextReservation.time} · {nextReservation.duration || "2 horas"} · {nextReservation.floor}</p></div><span className={nextReservation.status === "Confirmada" ? "status-pill confirmed" : "status-pill pending"}>{nextReservation.status}</span></div><Link to="/app/reservas" className="reservation-arrow">→</Link></div> : <div className="panel empty-state"><div className="empty-state-icon">⌖</div><strong>Aún no tienes reservas</strong><p>Encuentra un espacio para comenzar.</p><Link to="/app/reservar" className="btn btn-secondary" style={{ marginTop: 16 }}>Buscar espacios</Link></div>}</section><section><div className="section-title"><h2>Espacios destacados</h2><Link to="/app/reservar">Explorar todos</Link></div><div className="featured-list">{spaces.slice(0, 3).map((space) => <Link to={"/app/reservar?space=" + space.id} className="featured-space panel" key={space.id}><span className="space-thumb" style={{ background: space.color }}>{space.icon}</span><span><strong>{space.name}</strong><small>{space.capacity} personas · {space.floor}</small></span><b>→</b></Link>)}</div></section></div>
    </div>
  );
}

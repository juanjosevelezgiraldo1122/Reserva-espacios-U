import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDaysUntil } from "../data/spaces";
import { cancelReservation, confirmReservation, readReservations } from "../utils/reservations";
import "../styles/Reservations.css";

const tabs = [
  { key: "Todas", label: "Todas", matches: () => true },
  { key: "Pendientes", label: "Pendientes", matches: (item) => item.status.startsWith("Pendiente") },
  { key: "Confirmada", label: "Confirmadas", matches: (item) => item.status === "Confirmada" },
  { key: "Cancelada", label: "Canceladas", matches: (item) => item.status === "Cancelada" },
];

function canCancel(item) {
  const start = item.startTime || String(item.time || "").split(" ")[0];
  const startDate = new Date(item.date + "T" + (start || "00:00") + ":00");
  return startDate.getTime() - Date.now() >= 5 * 60 * 1000;
}

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState(() => readReservations().filter((item) => item.user === user?.correo));
  const [filter, setFilter] = useState("Todas");
  const [notice, setNotice] = useState("");
  const currentTab = tabs.find((tab) => tab.key === filter) || tabs[0];
  const filtered = reservations.filter(currentTab.matches);
  const countFor = (tab) => reservations.filter(tab.matches).length;

  const cancel = (item) => {
    if (!canCancel(item)) { setNotice("Esta reserva ya no puede cancelarse porque faltan menos de 5 minutos."); return; }
    if (window.confirm("¿Quieres cancelar esta reserva? No tendrá ninguna penalidad.")) setReservations(cancelReservation(item.id));
  };

  const confirm = (item) => {
    if (getDaysUntil(item.date) < 1) { setNotice("La confirmación debe realizarse con mínimo un día de anticipación."); return; }
    setReservations(confirmReservation(item.id));
  };

  return (
    <div className="reservations-page">
      <div className="page-heading"><div><span className="eyebrow">Tu actividad</span><h1>Mis reservas</h1><p>Consulta, confirma y administra tus espacios reservados.</p></div><Link to="/app/reservar" className="btn btn-primary">+ Nueva reserva</Link></div>
      <div className="reservation-tabs">{tabs.map((tab) => <button key={tab.key} className={filter === tab.key ? "active" : ""} onClick={() => setFilter(tab.key)}>{tab.label}<span>{countFor(tab)}</span></button>)}</div>
      <div className="reservation-table panel"><div className="table-header"><span>ESPACIO</span><span>FECHA Y HORA</span><span>MOTIVO</span><span>ESTADO</span><span /></div>{filtered.length ? filtered.map((item) => <div className="reservation-row" key={item.id}><div className="table-space"><span className="table-icon">▦</span><div><strong>{item.spaceName}</strong><small>{item.floor} · {item.attendees || 1} personas</small></div></div><div><strong>{new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.date + "T12:00:00"))}</strong><small>{item.time} · {item.duration}</small></div><div className="reason-cell">{item.reason}{item.cost ? " · COP " + item.cost : ""}</div><div><span className={item.status === "Confirmada" ? "status-pill confirmed" : item.status === "Cancelada" ? "status-pill cancelled" : "status-pill pending"}>{item.status}</span></div><div className="row-actions">{item.status === "Pendiente de confirmación" && <button className="row-action confirm-action" onClick={() => confirm(item)} disabled={getDaysUntil(item.date) < 1}>Confirmar</button>}{item.status === "Pendiente de aprobación" && <small className="approval-state">En revisión</small>}{item.status !== "Cancelada" && <button className="row-action cancel-action" onClick={() => cancel(item)} disabled={!canCancel(item)}>Cancelar</button>}</div></div>) : <div className="empty-state"><div className="empty-state-icon">▤</div><strong>No hay reservas en esta categoría</strong><p>Cuando reserves un espacio, aparecerá aquí.</p><Link className="btn btn-secondary" to="/app/reservar">Explorar espacios</Link></div>}</div>
      {notice && <div className="toast">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <div className="reservation-policy"><span>ⓘ</span><p><strong>Reglas de reserva:</strong> campus abierto de 6:00 a. m. a 8:00 p. m.; puedes cancelar hasta 5 minutos antes sin penalidad. Auditorios y sala de cómputo requieren aprobación.</p></div>
    </div>
  );
}

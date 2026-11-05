import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDaysUntil } from "../data/spaces";
import { cancelReservation, confirmReservation, readReservations, subscribeReservations } from "../utils/reservations";
import { notifyReservationApproved } from "../utils/notifications";
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
  const isAdmin = user?.rol === "Administrador";
  const [allReservations, setAllReservations] = useState(readReservations);
  const reservations = isAdmin ? allReservations : allReservations.filter((item) => item.user === user?.correo);
  const [filter, setFilter] = useState("Todas");
  const [notice, setNotice] = useState("");
  const currentTab = tabs.find((tab) => tab.key === filter) || tabs[0];
  const filtered = reservations.filter(currentTab.matches);
  const countFor = (tab) => reservations.filter(tab.matches).length;

  useEffect(() => subscribeReservations(() => setAllReservations(readReservations())), []);

  const cancel = (item) => {
    if (!isAdmin && !canCancel(item)) { setNotice("Esta reserva ya no puede cancelarse porque faltan menos de 5 minutos."); return; }
    if (window.confirm("¿Quieres cancelar esta reserva? No tendrá ninguna penalidad.")) cancelReservation(item.id);
  };

  const confirm = (item) => {
    if (isAdmin) {
      const updated = confirmReservation(item.id);
      const approved = updated.find((reservation) => reservation.id === item.id);
      notifyReservationApproved(approved);
      return;
    }
    if (getDaysUntil(item.date) < 1) { setNotice("La confirmación debe realizarse con mínimo un día de anticipación."); return; }
    confirmReservation(item.id);
  };

  return (
    <div className="reservations-page">
      <div className="page-heading"><div><span className="eyebrow">{isAdmin ? "Gestión de espacios" : "Tu actividad"}</span><h1>{isAdmin ? "Reservas de la comunidad" : "Mis reservas"}</h1><p>{isAdmin ? "Revisa solicitudes y administra todas las reservas." : "Consulta, confirma y administra tus espacios reservados."}</p></div>{!isAdmin && <Link to="/app/reservar" className="btn btn-primary">+ Nueva reserva</Link>}</div>
      <div className="reservation-tabs">{tabs.map((tab) => <button key={tab.key} className={filter === tab.key ? "active" : ""} onClick={() => setFilter(tab.key)}>{tab.label}<span>{countFor(tab)}</span></button>)}</div>
      <div className="reservation-table panel"><div className="table-header"><span>ESPACIO</span><span>FECHA Y HORA</span><span>MOTIVO</span><span>ESTADO</span><span>ACCIONES</span></div>{filtered.length ? filtered.map((item) => <div className="reservation-row" key={item.id}><div className="table-space"><span className="table-icon">▦</span><div><strong>{item.spaceName}</strong><small>{item.floor} · {item.attendees || 1} personas</small>{isAdmin && <small>Solicitante: {item.user}</small>}</div></div><div><strong>{new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.date + "T12:00:00"))}</strong><small>{item.time} · {item.duration}</small></div><div className="reason-cell">{item.reason}{item.cost ? " · COP " + item.cost : ""}</div><div><span className={item.status === "Confirmada" ? "status-pill confirmed" : item.status === "Cancelada" ? "status-pill cancelled" : "status-pill pending"}>{item.status}</span></div><div className="row-actions">{isAdmin && item.status.startsWith("Pendiente") && <button className="row-action confirm-action" onClick={() => confirm(item)}>Aprobar</button>}{item.status === "Pendiente de confirmación" && !isAdmin && <button className="row-action confirm-action" onClick={() => confirm(item)} disabled={getDaysUntil(item.date) < 1}>Confirmar</button>}{item.status.startsWith("Pendiente") && !isAdmin && <small className="approval-state">En revisión</small>}{item.status !== "Cancelada" && <button className="row-action cancel-action" onClick={() => cancel(item)} disabled={!isAdmin && !canCancel(item)}>Cancelar</button>}</div></div>) : <div className="empty-state"><div className="empty-state-icon">▤</div><strong>No hay reservas en esta categoría</strong><p>{isAdmin ? "Las solicitudes de la comunidad aparecerán aquí." : "Cuando reserves un espacio, aparecerá aquí."}</p>{!isAdmin && <Link className="btn btn-secondary" to="/app/reservar">Explorar espacios</Link>}</div>}</div>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <div className="reservation-policy"><span>ⓘ</span><p><strong>{isAdmin ? "Panel sincronizado:" : "Reglas de reserva:"}</strong> {isAdmin ? "Las solicitudes se actualizan automáticamente al cambiar en otra pestaña." : "Todas las solicitudes quedan pendientes hasta que un administrador las revise y apruebe. Puedes cancelar hasta 5 minutos antes de la hora de inicio."}</p></div>
    </div>
  );
}

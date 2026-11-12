import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDaysUntil, spaces } from "../data/spaces";
import { cancelReservation, confirmReservation, readReservations, subscribeReservations } from "../utils/reservations";
import { notifyReservationApproved } from "../utils/notifications";
import { notifySpecialPermitDecision } from "../utils/notifications";
import { readSpecialPermits, resolveSpecialPermit, subscribeSpecialPermits } from "../utils/specialPermits";
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
  const [specialPermits, setSpecialPermits] = useState(readSpecialPermits);
  const reservations = isAdmin ? allReservations : allReservations.filter((item) => item.user === user?.correo);
  const [filter, setFilter] = useState("Todas");
  const [historyFilters, setHistoryFilters] = useState({ space: "Todos", program: "Todos", month: "Todos", role: "Todos" });
  const [notice, setNotice] = useState("");
  const currentTab = tabs.find((tab) => tab.key === filter) || tabs[0];
  const spaceTypeById = new Map(spaces.map((space) => [space.id, space.type]));
  const spaceOptions = [...new Set(reservations.map((item) => item.spaceName).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const programOptions = [...new Set(reservations.map((item) => item.program || "Sin programa"))].sort((a, b) => a.localeCompare(b, "es"));
  const monthOptions = [...new Set(reservations.map((item) => item.date?.slice(0, 7)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const matchesHistoryFilters = (item) =>
    (historyFilters.space === "Todos" || item.spaceName === historyFilters.space) &&
    (historyFilters.program === "Todos" || (item.program || "Sin programa") === historyFilters.program) &&
    (historyFilters.month === "Todos" || item.date?.startsWith(historyFilters.month)) &&
    (historyFilters.role === "Todos" || (item.userRole || "Estudiante") === historyFilters.role);
  const historyFiltered = reservations.filter(matchesHistoryFilters);
  const filtered = historyFiltered.filter(currentTab.matches);
  const countFor = (tab) => historyFiltered.filter(tab.matches).length;
  const filtersActive = Object.values(historyFilters).some((value) => value !== "Todos");

  useEffect(() => subscribeReservations(() => setAllReservations(readReservations())), []);
  useEffect(() => subscribeSpecialPermits(() => setSpecialPermits(readSpecialPermits())), []);

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

  const reviewPermit = (permit, approved) => {
    const decision = approved ? "aprobar" : "rechazar";
    if (!window.confirm(`¿Deseas ${decision} el permiso especial solicitado por ${permit.userName || permit.user}?`)) return;
    const updated = resolveSpecialPermit(permit.id, approved, user);
    if (updated) notifySpecialPermitDecision(updated, approved);
    setSpecialPermits(readSpecialPermits());
  };

  return (
    <div className="reservations-page">
      <div className="page-heading"><div><span className="eyebrow">{isAdmin ? "Gestión de espacios" : "Tu actividad"}</span><h1>{isAdmin ? "Reservas de la comunidad" : "Mis reservas"}</h1><p>{isAdmin ? "Revisa solicitudes y administra todas las reservas." : "Consulta, confirma y administra tus espacios reservados."}</p></div>{!isAdmin && <Link to="/app/reservar" className="btn btn-primary">+ Nueva reserva</Link>}</div>
      <section className="history-filter-panel" aria-label="Filtros del historial">
        <div className="history-filter-heading"><div><strong>Filtrar historial</strong><small>Reduce los resultados por espacio, programa, mes o rol.</small></div>{filtersActive && <button type="button" onClick={() => setHistoryFilters({ space: "Todos", program: "Todos", month: "Todos", role: "Todos" })}>Limpiar filtros</button>}</div>
        <div className="history-filter-controls">
          <label><span>Espacio</span><select value={historyFilters.space} onChange={(event) => setHistoryFilters({ ...historyFilters, space: event.target.value })}><option>Todos</option>{spaceOptions.map((space) => <option key={space}>{space}</option>)}</select></label>
          <label><span>Programa académico</span><select value={historyFilters.program} onChange={(event) => setHistoryFilters({ ...historyFilters, program: event.target.value })}><option>Todos</option>{programOptions.map((program) => <option key={program}>{program}</option>)}</select></label>
          <label><span>Mes</span><select value={historyFilters.month} onChange={(event) => setHistoryFilters({ ...historyFilters, month: event.target.value })}><option value="Todos">Todos</option>{monthOptions.map((month) => <option key={month} value={month}>{new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00`))}</option>)}</select></label>
          {isAdmin && <label><span>Rol del usuario</span><select value={historyFilters.role} onChange={(event) => setHistoryFilters({ ...historyFilters, role: event.target.value })}><option>Todos</option><option>Estudiante</option><option>Administrador</option></select></label>}
        </div>
      </section>
      <div className="reservation-tabs">{tabs.map((tab) => <button key={tab.key} className={filter === tab.key ? "active" : ""} onClick={() => setFilter(tab.key)}>{tab.label}<span>{countFor(tab)}</span></button>)}</div>
      <div className="reservation-table panel"><div className="table-header"><span>ESPACIO</span><span>FECHA Y HORA</span><span>MOTIVO</span><span>ESTADO</span><span>ACCIONES</span></div>{filtered.length ? filtered.map((item) => <div className="reservation-row" key={item.id}><div className="table-space"><span className="table-icon">▦</span><div><strong>{item.spaceName}</strong><small>{spaceTypeById.get(item.spaceId) || "Espacio"} · {item.floor} · {item.attendees || 1} personas</small>{isAdmin && <small>Solicitante: {item.user} · {item.program || "Sin programa"} · {item.userRole || "Estudiante"}</small>}</div></div><div><strong>{new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.date + "T12:00:00"))}</strong><small>{item.time} · {item.duration}</small></div><div className="reason-cell">{item.reason}{item.cost ? " · COP " + item.cost : ""}</div><div><span className={item.status === "Confirmada" ? "status-pill confirmed" : item.status === "Cancelada" ? "status-pill cancelled" : "status-pill pending"}>{item.status}</span></div><div className="row-actions">{isAdmin && item.status.startsWith("Pendiente") && <button className="row-action confirm-action" onClick={() => confirm(item)}>Aprobar</button>}{item.status === "Pendiente de confirmación" && !isAdmin && <button className="row-action confirm-action" onClick={() => confirm(item)} disabled={getDaysUntil(item.date) < 1}>Confirmar</button>}{item.status.startsWith("Pendiente") && !isAdmin && <small className="approval-state">En revisión</small>}{item.status !== "Cancelada" && <button className="row-action cancel-action" onClick={() => cancel(item)} disabled={!isAdmin && !canCancel(item)}>Cancelar</button>}</div></div>) : <div className="empty-state"><div className="empty-state-icon">▤</div><strong>{filtersActive ? "No hay reservas que coincidan" : "No hay reservas en esta categoría"}</strong><p>{filtersActive ? "Prueba con otros filtros o límpialos para ver el historial completo." : isAdmin ? "Las solicitudes de la comunidad aparecerán aquí." : "Cuando reserves un espacio, aparecerá aquí."}</p>{filtersActive && <button type="button" className="btn btn-secondary" onClick={() => setHistoryFilters({ space: "Todos", program: "Todos", month: "Todos", role: "Todos" })}>Limpiar filtros</button>}{!isAdmin && !filtersActive && <Link className="btn btn-secondary" to="/app/reservar">Explorar espacios</Link>}</div>}</div>
      {isAdmin && <section className="special-permits-panel panel"><div className="special-permits-heading"><div><span className="eyebrow">Excepciones</span><h2>Permisos especiales</h2><p>Solicitudes para superar el límite de reservas activas.</p></div><span className="special-permits-count">{specialPermits.filter((item) => item.status === "Pendiente de aprobación").length} pendientes</span></div>{specialPermits.length ? <div className="special-permits-list">{specialPermits.map((permit) => <article className="special-permit-row" key={permit.id}><div className="special-permit-person"><strong>{permit.userName || permit.user}</strong><small>{permit.user} · {permit.program || "Sin programa"}</small></div><div className="special-permit-request"><strong>{permit.requestedSpaceName}</strong><small>{new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${permit.date}T12:00:00`))} · {permit.time} · {permit.attendees || 1} personas</small><small>Motivo: {permit.reason}</small></div><span className={`status-pill ${permit.status === "Aprobado" ? "confirmed" : permit.status === "Rechazado" ? "cancelled" : "pending"}`}>{permit.status}</span><div className="special-permit-actions">{permit.status === "Pendiente de aprobación" ? <><button className="row-action confirm-action" onClick={() => reviewPermit(permit, true)}>Aprobar permiso</button><button className="row-action cancel-action" onClick={() => reviewPermit(permit, false)}>Rechazar</button></> : <small>{permit.reviewedByName ? `Revisado por ${permit.reviewedByName}` : permit.status === "Usado" ? "Permiso utilizado" : "Resuelto"}</small>}</div></article>)}</div> : <div className="empty-state"><strong>No hay solicitudes de permiso especial</strong><p>Cuando alguien alcance el límite, su solicitud aparecerá aquí.</p></div>}</section>}
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <div className="reservation-policy"><span>ⓘ</span><p><strong>{isAdmin ? "Panel sincronizado:" : "Reglas de reserva:"}</strong> {isAdmin ? "Las solicitudes se actualizan automáticamente al cambiar en otra pestaña." : "Todas las solicitudes quedan pendientes hasta que un administrador las revise y apruebe. Puedes cancelar hasta 5 minutos antes de la hora de inicio."}</p></div>
    </div>
  );
}

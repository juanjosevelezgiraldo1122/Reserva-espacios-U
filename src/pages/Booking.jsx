import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDateLabel, getEndTime, getToday, spaces, timeSlots } from "../data/spaces";
import { addReservation, readReservations } from "../utils/reservations";
import "../styles/Booking.css";

const MAX_ACTIVE_RESERVATIONS = 3;

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function Booking() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ date: getToday(), category: "Todos", capacity: "Cualquier capacidad" });
  const [selectedSpace, setSelectedSpace] = useState(spaces.find((space) => space.id === params.get("space")) || null);
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [reason, setReason] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [extras, setExtras] = useState("");
  const [notice, setNotice] = useState("");

  const categories = ["Todos", ...new Set(spaces.map((space) => space.type))];
  const filteredSpaces = useMemo(() => spaces.filter((space) => {
    const categoryMatch = filters.category === "Todos" || space.type === filters.category;
    const capacityMatch = filters.capacity === "Cualquier capacidad" || space.capacity >= Number(filters.capacity);
    return categoryMatch && capacityMatch;
  }), [filters]);

  const durationOptions = selectedTime
    ? [1, 2, 3, 4].filter((hours) => timeToMinutes(getEndTime(selectedTime, hours)) <= timeToMinutes("20:00"))
    : [1, 2, 3, 4];

  const occupied = (space, time) => {
    const stored = readReservations().some((item) => {
      if (item.spaceId !== space.id || item.date !== filters.date || item.status === "Cancelada") return false;
      const storedStart = item.startTime || String(item.time || "").split(" ")[0];
      return storedStart === time;
    });
    const demoBusySlot = (space.id.length + Number(time.replace(":", ""))) % 7 === 0;
    return stored || demoBusySlot;
  };

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  };

  const confirm = () => {
    const activeReservations = readReservations().filter((item) => item.user === user?.correo && item.status !== "Cancelada");
    const endTime = getEndTime(selectedTime, duration);
    if (!selectedSpace || !selectedTime || !reason.trim()) {
      showNotice("Selecciona un espacio, horario y motivo para continuar.");
      return;
    }
    if (Number(attendees) < 1 || Number(attendees) > selectedSpace.capacity) {
      showNotice("La cantidad de personas no puede superar la capacidad del espacio.");
      return;
    }
    if (activeReservations.length >= MAX_ACTIVE_RESERVATIONS) {
      showNotice("Alcanzaste el límite de 3 reservas activas. Solicita un permiso especial al administrador.");
      return;
    }
    if (occupied(selectedSpace, selectedTime)) {
      showNotice("Ese horario acaba de ser ocupado. Selecciona otro.");
      return;
    }
    const hasCrossingReservation = activeReservations.some((item) => item.date === filters.date && item.startTime === selectedTime);
    if (hasCrossingReservation) {
      showNotice("Ya tienes otra reserva en ese horario. No es posible cruzarlas.");
      return;
    }
    const cost = selectedSpace.costPerHour * Number(duration);
    addReservation({
      spaceId: selectedSpace.id,
      spaceName: selectedSpace.name,
      floor: selectedSpace.floor,
      date: filters.date,
      startTime: selectedTime,
      endTime,
      time: selectedTime + " - " + endTime,
      duration: duration + (Number(duration) === 1 ? " hora" : " horas"),
      reason: reason.trim(),
      extras: extras.trim(),
      attendees: Number(attendees),
      capacity: selectedSpace.capacity,
      cost,
      requiresApproval: selectedSpace.requiresApproval,
      user: user?.correo,
      program: user?.programa,
    });
    showNotice(selectedSpace.requiresApproval ? "Solicitud enviada. Quedará pendiente de aprobación." : "Reserva creada. Confírmala desde Mis reservas con un día de anticipación.");
    setSelectedTime("");
    setReason("");
    setExtras("");
  };

  return (
    <div className="booking-page">
      <div className="page-heading"><div><span className="eyebrow">Disponibilidad en tiempo real</span><h1>Reserva un espacio</h1><p>Horario institucional: 6:00 a. m. a 8:00 p. m.</p></div></div>
      <div className="booking-layout">
        <section className="booking-main">
          <div className="filter-bar panel"><label><span>Fecha</span><input type="date" min={getToday()} value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} /></label><label><span>Tipo de espacio</span><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Capacidad mínima</span><select value={filters.capacity} onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}><option>Cualquier capacidad</option><option value="8">8 personas</option><option value="15">15 personas</option><option value="20">20 personas</option><option value="100">100 personas</option><option value="200">200 personas</option></select></label></div>
          <div className="results-heading"><div><h2>{filteredSpaces.length} espacios encontrados</h2><p>{getDateLabel(filters.date)}</p></div><span className="availability-key"><i className="available-dot" /> Disponible</span></div>
          <div className="space-list">{filteredSpaces.map((space) => <article key={space.id} className={selectedSpace?.id === space.id ? "space-card selected" : "space-card"} onClick={() => { setSelectedSpace(space); setSelectedTime(""); }}><div className="space-visual" style={{ background: space.color }}><span>{space.icon}</span><small className={space.requiresApproval ? "approval-label" : ""}>{space.availability}</small></div><div className="space-details"><div className="space-card-title"><div><h3>{space.name}</h3><p>{space.type} · {space.floor}</p></div><span className="capacity">♙ {space.capacity}</span></div><div className="equipment">{space.equipment.map((item) => <span key={item}>{item}</span>)}</div><div className="space-times"><span>Horarios disponibles</span><div>{timeSlots.slice(0, 4).map((time) => <button type="button" key={time} className={selectedSpace?.id === space.id && selectedTime === time ? "time-chip chosen" : "time-chip"} disabled={occupied(space, time)} onClick={(e) => { e.stopPropagation(); setSelectedSpace(space); setSelectedTime(time); }}>{time}</button>)}</div></div></div></article>)}</div>
        </section>
        <aside className="booking-summary panel"><div className="summary-heading"><span className="summary-icon">✦</span><div><h2>Detalle de reserva</h2><p>Completa la información requerida</p></div></div>{selectedSpace ? <><div className="summary-space"><span style={{ background: selectedSpace.color }}>{selectedSpace.icon}</span><div><strong>{selectedSpace.name}</strong><small>{selectedSpace.floor} · Capacidad {selectedSpace.capacity}</small></div><button onClick={() => setSelectedSpace(null)} aria-label="Quitar espacio">×</button></div><div className="summary-fields"><label>Hora de inicio<select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}><option value="">Selecciona un horario</option>{timeSlots.map((time) => <option key={time} value={time} disabled={occupied(selectedSpace, time)}>{time}{occupied(selectedSpace, time) ? " · Ocupado" : ""}</option>)}</select></label><label>Duración<select value={duration} onChange={(e) => setDuration(e.target.value)}>{durationOptions.map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hora" : "horas"} · termina {selectedTime ? getEndTime(selectedTime, hours) : "--:--"}</option>)}</select></label><label>Personas<input type="number" min="1" max={selectedSpace.capacity} value={attendees} onChange={(e) => setAttendees(e.target.value)} /></label><label>Elementos adicionales <span className="optional">(opcional)</span><input placeholder="Ej. marcadores, micrófono..." value={extras} onChange={(e) => setExtras(e.target.value)} /></label><label>Motivo de la reserva<textarea rows="3" placeholder="Ej. Reunión de proyecto..." value={reason} onChange={(e) => setReason(e.target.value)} /></label></div><div className="summary-total"><span>{getDateLabel(filters.date)} · {selectedTime ? selectedTime + " - " + getEndTime(selectedTime, duration) : "Selecciona un horario"}</span>{selectedSpace.costPerHour ? <strong>Costo estimado total: COP {selectedSpace.costPerHour * Number(duration)}</strong> : <strong>Sin costo</strong>}</div>{selectedSpace.requiresApproval && <p className="approval-note">Este espacio requiere aprobación del administrador. Tu solicitud quedará pendiente.</p>}<button className="btn btn-primary confirm-button" onClick={confirm}>{selectedSpace.requiresApproval ? "Solicitar aprobación" : "Crear reserva"} <span>→</span></button><p className="summary-note">La reserva debe confirmarse con mínimo un día de anticipación.</p></> : <div className="summary-empty"><div>⌖</div><strong>Selecciona un espacio</strong><p>Elige una tarjeta para continuar con tu reserva.</p></div>}</aside>
      </div>
      {notice && <div className="toast success-toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <Link to="/app/ayuda" className="booking-help">¿Tienes dudas sobre las reservas? <b>Consulta la guía →</b></Link>
    </div>
  );
}

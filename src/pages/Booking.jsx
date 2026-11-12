import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDateLabel, getEndTime, getToday, spaces, timeSlots } from "../data/spaces";
import { addReservation, readReservations, subscribeReservations } from "../utils/reservations";
import { notifyReservationCreated } from "../utils/notifications";
import { consumeSpecialPermit, readSpecialPermits, requestSpecialPermit, subscribeSpecialPermits } from "../utils/specialPermits";
import "../styles/Booking.css";

const MAX_ACTIVE_RESERVATIONS = 3;

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function Booking() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ date: getToday(), category: "Todos", capacity: "Cualquier capacidad", time: "" });
  const [selectedSpace, setSelectedSpace] = useState(spaces.find((space) => space.id === params.get("space")) || null);
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [reason, setReason] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [extras, setExtras] = useState("");
  const [notice, setNotice] = useState("");
  const [, setReservationVersion] = useState(0);
  const [permits, setPermits] = useState(readSpecialPermits);

  useEffect(() => subscribeReservations(() => setReservationVersion((version) => version + 1)), []);
  useEffect(() => subscribeSpecialPermits(() => setPermits(readSpecialPermits())), []);

  const categories = ["Todos", "Espacio común", "Sala de cómputo", "Sala de conferencias", "Trabajo libre", "Auditorio"];
  const filteredSpaces = useMemo(() => spaces.filter((space) => {
    const categoryMatch = filters.category === "Todos" || space.type === filters.category;
    const capacityMatch = filters.capacity === "Cualquier capacidad" || space.capacity >= Number(filters.capacity);
    return categoryMatch && capacityMatch;
  }), [filters]);

  const durationOptions = selectedTime
    ? [1, 2, 3, 4].filter((hours) => timeToMinutes(getEndTime(selectedTime, hours)) <= timeToMinutes("20:00"))
    : [1, 2, 3, 4];

  function occupied(space, time) {
    return readReservations().some((item) => {
      if (item.spaceId !== space.id || item.date !== filters.date || item.status === "Cancelada") return false;
      const storedStart = item.startTime || String(item.time || "").split(" ")[0];
      const storedEnd = item.endTime || getEndTime(storedStart, Number.parseInt(item.duration, 10) || 1);
      return timeToMinutes(time) < timeToMinutes(storedEnd) && timeToMinutes(getEndTime(time, 1)) > timeToMinutes(storedStart);
    });
  }

  const unavailableAtSelectedTime = filters.time
    ? filteredSpaces.filter((space) => occupied(space, filters.time)).length
    : 0;
  const visibleTimeSlots = filters.time ? [filters.time] : timeSlots.slice(0, 4);
  const activeReservations = readReservations().filter((item) => item.user === user?.correo && item.status !== "Cancelada");
  const availablePermit = permits.find((item) => item.user === user?.correo && item.status === "Aprobado" && (item.remainingUses ?? 1) > 0) || null;
  const pendingPermit = permits.find((item) => item.user === user?.correo && item.status === "Pendiente de aprobación") || null;
  const canUsePermitForSelection = availablePermit && availablePermit.requestedSpaceId === selectedSpace?.id && availablePermit.date === filters.date && availablePermit.startTime === selectedTime && availablePermit.duration === Number(duration) && availablePermit.attendees === Number(attendees) && availablePermit.reason === reason.trim();

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  };

  const confirm = () => {
    const endTime = getEndTime(selectedTime, duration);
    if (!selectedSpace || !selectedTime || !reason.trim()) {
      showNotice("Selecciona un espacio, horario y motivo para continuar.");
      return;
    }
    if (Number(attendees) < 1 || Number(attendees) > selectedSpace.capacity) {
      showNotice("La cantidad de personas no puede superar la capacidad del espacio.");
      return;
    }
    if (activeReservations.length >= MAX_ACTIVE_RESERVATIONS && !canUsePermitForSelection) {
      showNotice(availablePermit ? "El permiso aprobado es para otro espacio, fecha u horario. Selecciona la solicitud aprobada." : "Alcanzaste el límite de 3 reservas activas. Solicita un permiso especial al administrador.");
      return;
    }
    if (occupied(selectedSpace, selectedTime)) {
      showNotice("Ese horario acaba de ser ocupado. Selecciona otro.");
      return;
    }
    const hasCrossingReservation = activeReservations.some((item) => {
      if (item.date !== filters.date) return false;
      const existingStart = item.startTime || String(item.time || "").split(" ")[0];
      const existingEnd = item.endTime || getEndTime(existingStart, Number.parseInt(item.duration, 10) || 1);
      return timeToMinutes(selectedTime) < timeToMinutes(existingEnd) && timeToMinutes(endTime) > timeToMinutes(existingStart);
    });
    if (hasCrossingReservation) {
      showNotice("Ya tienes otra reserva en ese horario. No es posible cruzarlas.");
      return;
    }
    const cost = selectedSpace.costPerHour * Number(duration);
    const reservation = addReservation({
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
      userRole: user?.rol || "Estudiante",
    });
    if (canUsePermitForSelection) consumeSpecialPermit(availablePermit.id, reservation.id);
    notifyReservationCreated(reservation);
    showNotice("Solicitud enviada. Quedará pendiente hasta que un administrador la revise y apruebe.");
    setSelectedTime("");
    setReason("");
    setExtras("");
  };

  const requestPermit = () => {
    if (!selectedSpace || !selectedTime || !reason.trim()) {
      showNotice("Selecciona espacio, fecha, horario e indica el motivo para solicitar el permiso.");
      return;
    }
    if (occupied(selectedSpace, selectedTime)) {
      showNotice("Ese horario está ocupado. Selecciona una franja disponible antes de solicitar el permiso.");
      return;
    }
    if (Number(attendees) < 1 || Number(attendees) > selectedSpace.capacity) {
      showNotice("La cantidad de personas no puede superar la capacidad del espacio.");
      return;
    }
    try {
      requestSpecialPermit({
        user: user?.correo,
        userName: `${user?.nombres || ""} ${user?.apellidos || ""}`.trim(),
        program: user?.programa || "Sin programa",
        requestedSpaceId: selectedSpace.id,
        requestedSpaceName: selectedSpace.name,
        date: filters.date,
        startTime: selectedTime,
        time: `${selectedTime} - ${getEndTime(selectedTime, duration)}`,
        duration: Number(duration),
        reason: reason.trim(),
        attendees: Number(attendees),
      });
      setPermits(readSpecialPermits());
      showNotice("Solicitud de permiso especial enviada. Quedará pendiente de aprobación.");
    } catch (error) {
      showNotice(error.message);
    }
  };

  return (
    <div className="booking-page">
      <div className="page-heading"><div><span className="eyebrow">Disponibilidad en tiempo real</span><h1>Reserva un espacio</h1><p>Horario institucional: 6:00 a. m. a 8:00 p. m. · Todas las solicitudes requieren aprobación del administrador.</p></div></div>
      <div className="booking-layout">
        <section className="booking-main">
          <div className="filter-bar panel">
            <label><span>Fecha</span><input type="date" min={getToday()} value={filters.date} onChange={(event) => { setFilters({ ...filters, date: event.target.value }); setSelectedTime(""); }} /></label>
            <label><span>Tipo de espacio</span><select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label><span>Franja horaria</span><select value={filters.time} onChange={(event) => { const time = event.target.value; setFilters({ ...filters, time }); setSelectedTime(time && selectedSpace && !occupied(selectedSpace, time) ? time : ""); }}><option value="">Todas las franjas</option>{timeSlots.map((time) => <option key={time} value={time}>{time} – {getEndTime(time, 1)}</option>)}</select></label>
            <label><span>Capacidad mínima</span><select value={filters.capacity} onChange={(event) => setFilters({ ...filters, capacity: event.target.value })}><option>Cualquier capacidad</option><option value="8">8 personas</option><option value="15">15 personas</option><option value="20">20 personas</option><option value="100">100 personas</option><option value="200">200 personas</option></select></label>
          </div>
          <div className="results-heading"><div><h2>{filters.time ? `${filteredSpaces.length - unavailableAtSelectedTime} disponibles · ${unavailableAtSelectedTime} ocupados` : `${filteredSpaces.length} espacios encontrados`}</h2><p>{getDateLabel(filters.date)}{filters.time ? ` · Franja ${filters.time}–${getEndTime(filters.time, 1)}` : ""}</p></div><span className="availability-key"><i className="available-dot" /> Disponible{filters.time && <><i className="unavailable-dot" /> Ocupado</>}</span></div>
          <div className="space-list">{filteredSpaces.map((space) => {
            const unavailable = Boolean(filters.time && occupied(space, filters.time));
            return <article key={space.id} className={`space-card${selectedSpace?.id === space.id ? " selected" : ""}${unavailable ? " unavailable" : ""}`} onClick={() => { if (unavailable) return; setSelectedSpace(space); setSelectedTime(filters.time || ""); }} aria-disabled={unavailable}>
              <div className="space-visual" style={{ background: space.color }}><span>{space.icon}</span><small className={unavailable ? "unavailable-label" : space.requiresApproval ? "approval-label" : ""}>{unavailable ? `Ocupado · ${filters.time}` : space.availability}</small></div>
              <div className="space-details"><div className="space-card-title"><div><h3>{space.name}</h3><p>{space.type} · {space.floor}</p></div><span className="capacity">♙ {space.capacity} personas</span></div>
                <div className="equipment">{space.equipment.map((item) => <span key={item}>{item}</span>)}</div>
                <div className="space-times"><span>{filters.time ? "Disponibilidad en esa franja" : "Horarios disponibles"}</span><div>{visibleTimeSlots.map((time) => {
                  const slotOccupied = occupied(space, time);
                  return <button type="button" key={time} title={slotOccupied ? `No disponible a las ${time}` : `Seleccionar ${time}`} aria-label={`${time}${slotOccupied ? ", no disponible" : ", disponible"}`} className={selectedSpace?.id === space.id && selectedTime === time ? "time-chip chosen" : "time-chip"} disabled={slotOccupied} onClick={(event) => { event.stopPropagation(); setSelectedSpace(space); setSelectedTime(time); }}>{time}{slotOccupied && <span className="time-chip-state">Ocupado</span>}</button>;
                })}</div></div>
              </div>
            </article>;
          })}</div>
        </section>
        <aside className="booking-summary panel"><div className="summary-heading"><span className="summary-icon">✦</span><div><h2>Detalle de reserva</h2><p>Completa la información requerida</p></div></div>{selectedSpace ? <><div className="summary-space"><span style={{ background: selectedSpace.color }}>{selectedSpace.icon}</span><div><strong>{selectedSpace.name}</strong><small>{selectedSpace.floor} · Capacidad {selectedSpace.capacity} personas</small></div><button onClick={() => setSelectedSpace(null)} aria-label="Quitar espacio">×</button></div><div className="summary-fields"><label>Hora de inicio<select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}><option value="">Selecciona un horario</option>{timeSlots.map((time) => <option key={time} value={time} disabled={occupied(selectedSpace, time)}>{time}{occupied(selectedSpace, time) ? " · Ocupado" : ""}</option>)}</select></label><label>Duración<select value={duration} onChange={(e) => setDuration(e.target.value)}>{durationOptions.map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hora" : "horas"} · termina {selectedTime ? getEndTime(selectedTime, hours) : "--:--"}</option>)}</select></label><label>Personas<input type="number" min="1" max={selectedSpace.capacity} value={attendees} onChange={(e) => setAttendees(e.target.value)} /></label><label>Elementos adicionales <span className="optional">(opcional)</span><input placeholder="Ej. marcadores, micrófono..." value={extras} onChange={(e) => setExtras(e.target.value)} /></label><label>Motivo de la reserva<textarea rows="3" placeholder="Ej. Reunión de proyecto..." value={reason} onChange={(e) => setReason(e.target.value)} /></label></div><div className="summary-total"><span>{getDateLabel(filters.date)} · {selectedTime ? selectedTime + " - " + getEndTime(selectedTime, duration) : "Selecciona un horario"}</span>{selectedSpace.costPerHour ? <strong>Costo estimado total: COP {selectedSpace.costPerHour * Number(duration)}</strong> : <strong>Sin costo</strong>}</div>{activeReservations.length >= MAX_ACTIVE_RESERVATIONS ? <div className="limit-notice"><strong>Alcanzaste el límite de {MAX_ACTIVE_RESERVATIONS} reservas activas</strong>{canUsePermitForSelection ? <p>Permiso aprobado para este espacio y horario. Puedes enviar la solicitud adicional.</p> : availablePermit ? <p>Tu permiso está aprobado para {availablePermit.requestedSpaceName}, el {availablePermit.date} a las {availablePermit.startTime}.</p> : pendingPermit ? <p>Tu solicitud de permiso especial está pendiente de revisión por un administrador.</p> : <p>Solicita una excepción para este espacio, fecha y horario. La reserva solo se podrá enviar si el administrador la aprueba.</p>}{!availablePermit && !pendingPermit && <button type="button" className="btn btn-secondary permit-request-button" onClick={requestPermit}>Solicitar permiso especial</button>}</div> : <p className="approval-note">Tu solicitud quedará pendiente hasta que un administrador la revise y apruebe.</p>}{activeReservations.length < MAX_ACTIVE_RESERVATIONS || canUsePermitForSelection ? <button className="btn btn-primary confirm-button" onClick={confirm}>Enviar solicitud <span>→</span></button> : null}<p className="summary-note">Recibirás una notificación cuando se tome una decisión.</p></> : <div className="summary-empty"><div>⌖</div><strong>Selecciona un espacio</strong><p>Elige una tarjeta para continuar con tu reserva.</p></div>}</aside>
      </div>
      {notice && <div className="toast success-toast" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <Link to="/app/ayuda" className="booking-help">¿Tienes dudas sobre las reservas? <b>Consulta la guía →</b></Link>
    </div>
  );
}

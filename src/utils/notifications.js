import { readReservations } from "./reservations";

const STORAGE_PREFIX = "reserva-espacios-notificaciones-";
const CHANGE_EVENT = "reservation-notifications-changed";
const REMINDER_MS = 5 * 60 * 1000;
const COMPLETION_GRACE_MS = 60 * 60 * 1000;

function storageKey(email) {
  return STORAGE_PREFIX + encodeURIComponent(email || "anonimo");
}

export function readNotifications(email) {
  try { return JSON.parse(localStorage.getItem(storageKey(email))) || []; } catch { return []; }
}

function saveNotifications(email, notifications) {
  localStorage.setItem(storageKey(email), JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { email } }));
}

export function subscribeNotifications(email, callback) {
  const onLocalChange = (event) => {
    if (event.detail?.email === email) callback();
  };
  const onStorageChange = (event) => {
    if (event.key === storageKey(email)) callback();
  };
  window.addEventListener(CHANGE_EVENT, onLocalChange);
  window.addEventListener("storage", onStorageChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLocalChange);
    window.removeEventListener("storage", onStorageChange);
  };
}

export function markNotificationsRead(email) {
  const notifications = readNotifications(email);
  if (!notifications.some((item) => !item.read)) return;
  saveNotifications(email, notifications.map((item) => ({ ...item, read: true })));
}

export function clearNotifications(email) {
  saveNotifications(email, []);
}

function reservationTime(date, time) {
  if (!date || !time) return Number.NaN;
  return new Date(`${date}T${time}:00-05:00`).getTime();
}

function makeNotification(reservation, type, message, at) {
  return {
    id: `${reservation.id}:${type}`,
    reservationId: reservation.id,
    type,
    title: type === "completed" ? "Reserva finalizada" : "Recordatorio de reserva",
    message,
    time: at,
    read: false,
  };
}

function addIfMissing(email, notifications, notification) {
  if (notifications.some((item) => item.id === notification.id)) return notifications;
  const next = [notification, ...notifications].slice(0, 100);
  saveNotifications(email, next);
  return next;
}

export function notifyReservationCreated(reservation) {
  if (!reservation?.user) return;
  const type = "approval-requested";
  const details = [
    { label: "Espacio", value: reservation.spaceName },
    ...(reservation.floor ? [{ label: "Ubicación", value: reservation.floor }] : []),
    { label: "Fecha", value: reservation.date ? new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${reservation.date}T12:00:00`)) : "Sin fecha" },
    { label: "Horario", value: `${reservation.time || "Sin horario"}${reservation.duration ? ` · ${reservation.duration}` : ""}` },
    { label: "Personas", value: String(reservation.attendees || 1) },
    { label: "Motivo", value: reservation.reason || "No especificado" },
    ...(reservation.program ? [{ label: "Programa", value: reservation.program }] : []),
    ...(reservation.extras ? [{ label: "Elementos adicionales", value: reservation.extras }] : []),
    ...(reservation.cost ? [{ label: "Costo estimado", value: `COP ${Number(reservation.cost).toLocaleString("es-CO")}` }] : []),
    { label: "Estado", value: reservation.status },
  ];
  const extrasReminder = reservation.extras ? ` Recuerda llevar: ${reservation.extras}.` : "";
  const message = `Tu solicitud quedó pendiente. Un administrador debe revisarla y aprobarla antes de que la reserva quede confirmada.${extrasReminder}`;
  const notifications = readNotifications(reservation.user);
  addIfMissing(reservation.user, notifications, {
    id: `${reservation.id}:${type}`,
    reservationId: reservation.id,
    type,
    title: "Solicitud pendiente de aprobación",
    message,
    details,
    actionLabel: "Ver solicitud →",
    time: Date.now(),
    read: false,
  });
}

export function notifyReservationApproved(reservation) {
  if (!reservation?.user) return;
  const notifications = readNotifications(reservation.user);
  addIfMissing(reservation.user, notifications, {
    id: `${reservation.id}:approved`,
    reservationId: reservation.id,
    type: "approved",
    title: "Reserva aprobada",
    message: `El administrador aprobó tu reserva de ${reservation.spaceName} para ${reservation.date} · ${reservation.time}.`,
    actionLabel: "Ver reserva →",
    time: Date.now(),
    read: false,
  });
}

export function checkReservationReminders(email) {
  if (!email) return;
  const now = Date.now();
  let notifications = readNotifications(email);
  const reservations = readReservations().filter((item) => item.user === email && item.status === "Confirmada");

  reservations.forEach((reservation) => {
    const [legacyStart, legacyEnd] = String(reservation.time || "").split(/\s+-\s+/);
    const start = reservationTime(reservation.date, reservation.startTime || legacyStart);
    const end = reservationTime(reservation.date, reservation.endTime || legacyEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;

    if (now >= start - REMINDER_MS && now < start) {
      notifications = addIfMissing(email, notifications, makeNotification(
        reservation,
        "start-soon",
        `Tu reserva de ${reservation.spaceName} comienza en menos de 5 minutos.`,
        now,
      ));
    }
    if (now >= end - REMINDER_MS && now < end) {
      notifications = addIfMissing(email, notifications, makeNotification(
        reservation,
        "end-soon",
        `Tu reserva de ${reservation.spaceName} termina en menos de 5 minutos.`,
        now,
      ));
    }
    if (now >= end && now - end <= COMPLETION_GRACE_MS) {
      notifications = addIfMissing(email, notifications, makeNotification(
        reservation,
        "completed",
        `Tu reserva de ${reservation.spaceName} ha finalizado.`,
        now,
      ));
    }
  });
}

export function startReservationReminders(email) {
  if (!email) return () => {};
  const check = () => checkReservationReminders(email);
  check();
  const intervalId = window.setInterval(check, 10_000);
  window.addEventListener("focus", check);
  document.addEventListener("visibilitychange", check);
  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener("focus", check);
    document.removeEventListener("visibilitychange", check);
  };
}

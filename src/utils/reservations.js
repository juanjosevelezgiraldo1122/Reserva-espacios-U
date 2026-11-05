const KEY = "reserva-espacios-reservas";
const CHANGE_EVENT = "reservations-changed";

export function readReservations() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function saveReservations(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeReservations(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function addReservation(item) {
  const next = {
    ...item,
    id: "res-" + Date.now(),
    status: item.status || "Pendiente de aprobación",
    createdAt: new Date().toISOString(),
  };
  saveReservations([next, ...readReservations()]);
  return next;
}

export function confirmReservation(id) {
  const next = readReservations().map((item) => item.id === id ? { ...item, status: "Confirmada", confirmedAt: new Date().toISOString() } : item);
  saveReservations(next);
  return next;
}

export function cancelReservation(id) {
  const next = readReservations().map((item) => item.id === id ? { ...item, status: "Cancelada" } : item);
  saveReservations(next);
  return next;
}

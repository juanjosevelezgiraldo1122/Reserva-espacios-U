const KEY = "reserva-espacios-reservas";

export function readReservations() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function saveReservations(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addReservation(item) {
  const next = {
    ...item,
    id: "res-" + Date.now(),
    status: item.status || (item.requiresApproval ? "Pendiente de aprobación" : "Pendiente de confirmación"),
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

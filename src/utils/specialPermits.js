const KEY = "reserva-espacios-permisos-especiales";
const CHANGE_EVENT = "special-permits-changed";

export function readSpecialPermits() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function saveSpecialPermits(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeSpecialPermits(callback) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getAvailablePermit(email) {
  return readSpecialPermits().find((item) => item.user === email && item.status === "Aprobado" && (item.remainingUses ?? 1) > 0) || null;
}

export function requestSpecialPermit(payload) {
  const permits = readSpecialPermits();
  if (permits.some((item) => item.user === payload.user && (item.status === "Pendiente de aprobación" || (item.status === "Aprobado" && (item.remainingUses ?? 1) > 0)))) {
    throw new Error("Ya tienes un permiso especial pendiente o aprobado sin utilizar.");
  }
  const next = {
    ...payload,
    id: `permit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "Pendiente de aprobación",
    requestedAt: new Date().toISOString(),
  };
  saveSpecialPermits([next, ...permits]);
  return next;
}

export function resolveSpecialPermit(id, approved, administrator) {
  const permits = readSpecialPermits();
  let resolved = null;
  const updated = permits.map((item) => {
    if (item.id !== id || item.status !== "Pendiente de aprobación") return item;
    resolved = {
      ...item,
      status: approved ? "Aprobado" : "Rechazado",
      remainingUses: approved ? 1 : 0,
      reviewedAt: new Date().toISOString(),
      reviewedBy: administrator?.correo || "Administrador",
      reviewedByName: `${administrator?.nombres || ""} ${administrator?.apellidos || ""}`.trim() || administrator?.correo || "Administrador",
    };
    return resolved;
  });
  if (resolved) saveSpecialPermits(updated);
  return resolved;
}

export function consumeSpecialPermit(id, reservationId) {
  const permits = readSpecialPermits();
  const updated = permits.map((item) => {
    if (item.id !== id || item.status !== "Aprobado" || (item.remainingUses ?? 1) < 1) return item;
    return { ...item, status: "Usado", remainingUses: 0, usedAt: new Date().toISOString(), reservationId };
  });
  saveSpecialPermits(updated);
}

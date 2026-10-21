const commonRooms = Array.from({ length: 10 }, (_, index) => ({
  id: "espacio-comun-" + String(index + 1).padStart(2, "0"),
  name: "Espacio común " + String(index + 1).padStart(2, "0"),
  type: "Espacio común",
  capacity: 100,
  floor: index < 5 ? "Edificio A · Piso 1" : "Edificio A · Piso 2",
  color: index % 2 ? "#e9f5ef" : "#ffe8dd",
  icon: "▦",
  equipment: ["Proyector", "Pizarra", "Wi-Fi"],
  availability: "Disponible",
  requiresApproval: false,
  costPerHour: 0,
}));

const freeWorkspaces = Array.from({ length: 10 }, (_, index) => ({
  id: "trabajo-libre-" + String(index + 1).padStart(2, "0"),
  name: "Trabajo libre " + String(index + 1).padStart(2, "0"),
  type: "Trabajo libre",
  capacity: 15,
  floor: "Biblioteca · Piso 1",
  color: index % 2 ? "#f0e8fb" : "#fff2d8",
  icon: "◈",
  equipment: ["Wi-Fi", "Tomas eléctricas", "Zona silenciosa"],
  availability: "Disponible",
  requiresApproval: false,
  costPerHour: 0,
}));

export const spaces = [
  ...commonRooms,
  {
    id: "sala-computo-01",
    name: "Sala de cómputo 01",
    type: "Sala de cómputo",
    capacity: 20,
    floor: "Edificio C · Piso 2",
    color: "#e7ecfb",
    icon: "⌘",
    equipment: ["20 equipos", "Software especializado", "Wi-Fi"],
    availability: "Requiere aprobación",
    requiresApproval: true,
    costPerHour: 0,
  },
  {
    id: "sala-conferencias-01",
    name: "Sala de conferencias 01",
    type: "Sala de conferencias",
    capacity: 20,
    floor: "Edificio B · Piso 3",
    color: "#fce6ef",
    icon: "✦",
    equipment: ["Videoconferencia", "Pizarra", "HDMI"],
    availability: "Disponible",
    requiresApproval: false,
    costPerHour: 0,
  },
  ...freeWorkspaces,
  {
    id: "auditorio-a",
    name: "Auditorio A",
    type: "Auditorio",
    capacity: 100,
    floor: "Edificio central · Piso 1",
    color: "#ffe1d3",
    icon: "▤",
    equipment: ["Audio profesional", "Proyector", "Tarima"],
    availability: "Requiere aprobación",
    requiresApproval: true,
    costPerHour: 100,
  },
  {
    id: "auditorio-b",
    name: "Auditorio B",
    type: "Auditorio",
    capacity: 200,
    floor: "Edificio central · Piso 1",
    color: "#e7ecfb",
    icon: "▤",
    equipment: ["Audio profesional", "Proyector", "Tarima"],
    availability: "Requiere aprobación",
    requiresApproval: true,
    costPerHour: 100,
  },
  {
    id: "auditorio-c",
    name: "Auditorio C",
    type: "Auditorio",
    capacity: 300,
    floor: "Edificio central · Piso 2",
    color: "#f0e8fb",
    icon: "▤",
    equipment: ["Audio profesional", "Proyector", "Tarima"],
    availability: "Requiere aprobación",
    requiresApproval: true,
    costPerHour: 100,
  },
];

export const timeSlots = ["06:00", "07:30", "09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:00"];

export function getDateLabel(date) {
  return new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" }).format(new Date(date + "T12:00:00"));
}

export function getToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

export function getEndTime(startTime, durationHours) {
  if (!startTime) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  const end = hours + Number(durationHours);
  return String(end).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

export function getDaysUntil(date) {
  const today = new Date(getToday() + "T00:00:00");
  const target = new Date(date + "T00:00:00");
  return Math.ceil((target - today) / 86400000);
}

import { useEffect, useMemo, useState } from "react";
import { spaces } from "../data/spaces";
import { readReservations, subscribeReservations } from "../utils/reservations";
import "../styles/Reports.css";

function groupCount(items, getKey) {
  const counts = new Map();
  items.forEach((item) => {
    const label = getKey(item) || "Sin dato";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()].map(([label, count]) => ({ label, count }));
}

function BarReport({ title, description, rows, emptyMessage }) {
  const maxCount = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="report-panel">
      <div className="report-panel-heading"><div><h2>{title}</h2><p>{description}</p></div><span className="report-total">{rows.reduce((sum, row) => sum + row.count, 0)}</span></div>
      {rows.length ? (
        <div className="report-bars" role="list" aria-label={title}>
          {rows.map((row) => (
            <div className="report-bar-row" role="listitem" key={row.label}>
              <span className="report-bar-label" title={row.label}>{row.label}</span>
              <span className="report-bar-track"><span className="report-bar-fill" style={{ width: `${Math.max(4, (row.count / maxCount) * 100)}%` }} /></span>
              <strong className="report-bar-count">{row.count}</strong>
            </div>
          ))}
        </div>
      ) : <div className="report-empty">{emptyMessage}</div>}
    </section>
  );
}

export default function Reports() {
  const [reservations, setReservations] = useState(readReservations);
  useEffect(() => subscribeReservations(() => setReservations(readReservations())), []);

  const reports = useMemo(() => {
    const validReservations = reservations.filter((item) => item.date);
    const monthly = groupCount(validReservations, (item) => item.date.slice(0, 7))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(-12)
      .map((row) => ({ ...row, label: new Intl.DateTimeFormat("es-CO", { month: "short", year: "numeric" }).format(new Date(`${row.label}-01T12:00:00`)) }));
    const programs = groupCount(reservations, (item) => item.program || "Sin programa").sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    const spaceTypeById = new Map(spaces.map((space) => [space.id, space.type]));
    const spaceTypes = groupCount(reservations, (item) => item.spaceType || spaceTypeById.get(item.spaceId) || "Tipo no disponible").sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return { monthly, programs, spaceTypes };
  }, [reservations]);

  const activeReservations = reservations.filter((item) => item.status !== "Cancelada").length;
  const cancelledReservations = reservations.length - activeReservations;

  return (
    <div className="reports-page">
      <div className="page-heading">
        <div><span className="eyebrow">Administración</span><h1>Reportes agregados</h1><p>Resumen de solicitudes de reserva por mes, programa y tipo de espacio.</p></div>
        <span className="live-report-tag"><i /> Actualización en tiempo real</span>
      </div>

      <div className="report-summary-grid">
        <div className="report-summary-card"><small>Total de solicitudes</small><strong>{reservations.length}</strong><span>Incluye todo el historial</span></div>
        <div className="report-summary-card"><small>Reservas activas</small><strong>{activeReservations}</strong><span>Sin contar cancelaciones</span></div>
        <div className="report-summary-card"><small>Canceladas</small><strong>{cancelledReservations}</strong><span>En el historial completo</span></div>
      </div>

      <div className="reports-grid">
        <BarReport title="Reservas por mes" description="Últimos 12 meses con actividad" rows={reports.monthly} emptyMessage="Todavía no hay reservas con fecha registrada." />
        <BarReport title="Reservas por programa" description="Programa asociado a cada solicitud" rows={reports.programs} emptyMessage="Todavía no hay reservas registradas." />
        <BarReport title="Reservas por tipo de espacio" description="Categoría del espacio solicitado" rows={reports.spaceTypes} emptyMessage="Todavía no hay reservas registradas." />
      </div>
      <p className="reports-footnote">Los reportes incluyen solicitudes pendientes y canceladas. Los cambios se reflejan al instante cuando se actualizan las reservas.</p>
    </div>
  );
}

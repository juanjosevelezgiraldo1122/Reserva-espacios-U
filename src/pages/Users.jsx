import { useEffect, useMemo, useState } from "react";
import { getAdminUsers, getRoleAudit, subscribeAdminUserData, useAuth } from "../context/AuthContext";
import "../styles/Users.css";

const roleOptions = ["Estudiante", "Administrador"];

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export default function Users() {
  const { user, updateUserRole } = useAuth();
  const [users, setUsers] = useState(getAdminUsers);
  const [audit, setAudit] = useState(getRoleAudit);
  const [roleDrafts, setRoleDrafts] = useState(() => Object.fromEntries(getAdminUsers().map((item) => [item.id, item.rol])));
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const refresh = () => {
      const currentUsers = getAdminUsers();
      setUsers(currentUsers);
      setRoleDrafts(Object.fromEntries(currentUsers.map((item) => [item.id, item.rol])));
      setAudit(getRoleAudit());
    };
    return subscribeAdminUserData(refresh);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((item) => `${item.nombres} ${item.apellidos} ${item.correo} ${item.programa}`.toLowerCase().includes(query));
  }, [users, search]);

  const saveRole = (target) => {
    const nextRole = roleDrafts[target.id] || target.rol;
    if (nextRole === target.rol) return;
    if (nextRole === "Administrador" && !window.confirm(`¿Asignar el rol de administrador a ${target.nombres} ${target.apellidos}? Tendrá acceso a reportes y gestión de solicitudes.`)) return;
    try {
      updateUserRole(target.id, nextRole);
      setFeedback({ type: "success", text: `Rol actualizado para ${target.nombres} ${target.apellidos}.` });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  };

  const administratorCount = users.filter((item) => item.rol === "Administrador").length;
  const studentCount = users.filter((item) => item.rol === "Estudiante").length;

  return (
    <div className="users-page">
      <div className="page-heading">
        <div><span className="eyebrow">Administración</span><h1>Usuarios y roles</h1><p>Consulta las cuentas y administra sus permisos de acceso.</p></div>
        <span className="users-live-badge"><i /> Actualización inmediata</span>
      </div>

      <div className="users-summary">
        <div className="users-summary-card"><span className="users-summary-icon">♙</span><div><small>Usuarios registrados</small><strong>{users.length}</strong></div></div>
        <div className="users-summary-card"><span className="users-summary-icon student">◎</span><div><small>Estudiantes</small><strong>{studentCount}</strong></div></div>
        <div className="users-summary-card"><span className="users-summary-icon admin">♧</span><div><small>Administradores</small><strong>{administratorCount}</strong></div></div>
      </div>

      {feedback && <div className={`users-feedback ${feedback.type}`} role="status">{feedback.text}<button type="button" aria-label="Cerrar mensaje" onClick={() => setFeedback(null)}>×</button></div>}

      <section className="users-panel">
        <div className="users-panel-heading">
          <div><h2>Listado de usuarios</h2><p>Los cambios de rol quedan registrados en la trazabilidad.</p></div>
          <label className="users-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo o programa" /></label>
        </div>
        <div className="users-table-scroll">
          <table className="users-table">
            <thead><tr><th>USUARIO</th><th>PROGRAMA</th><th>ROL ACTUAL</th><th>EDITAR ROL</th><th /></tr></thead>
            <tbody>
              {filteredUsers.map((item) => {
                const isCurrentUser = item.id === user?.id || item.correo === user?.correo;
                const changed = roleDrafts[item.id] !== item.rol;
                return (
                  <tr key={item.id}>
                    <td><div className="users-person"><span className="users-avatar">{(item.nombres?.[0] || "U") + (item.apellidos?.[0] || "")}</span><span><strong>{item.nombres} {item.apellidos}</strong><small>{item.correo}{item.esCuentaPrueba && <em>Prueba</em>}</small></span></div></td>
                    <td className="users-program">{item.programa || "Comunidad universitaria"}</td>
                    <td><span className={`users-role-pill ${item.rol === "Administrador" ? "admin" : "student"}`}>{item.rol}</span></td>
                    <td><select aria-label={`Cambiar rol de ${item.nombres} ${item.apellidos}`} value={roleDrafts[item.id] || item.rol} onChange={(event) => setRoleDrafts((current) => ({ ...current, [item.id]: event.target.value }))} disabled={isCurrentUser}><option value="Estudiante">Estudiante</option><option value="Administrador">Administrador</option></select></td>
                    <td><button className="users-save-button" type="button" onClick={() => saveRole(item)} disabled={!changed || isCurrentUser}>Guardar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filteredUsers.length && <div className="users-empty">{users.length ? "No encontramos usuarios con esa búsqueda." : "Todavía no hay usuarios registrados."}</div>}
        </div>
        <p className="users-own-role-note">Por seguridad, no puedes editar el rol de tu propia cuenta.</p>
      </section>

      <section className="users-panel audit-panel">
        <div className="users-panel-heading audit-heading"><div><span className="eyebrow">Trazabilidad</span><h2>Historial de cambios de rol</h2><p>Registro de quién hizo cada cambio y cuándo ocurrió.</p></div><span className="audit-count">{audit.length} cambios</span></div>
        {audit.length ? (
          <div className="audit-list">
            {audit.map((entry) => <article className="audit-row" key={entry.id}>
              <span className="audit-icon">↗</span>
              <div className="audit-user"><strong>{entry.userName}</strong><small>{entry.userEmail}</small></div>
              <div className="audit-change"><span className={`users-role-pill ${entry.previousRole === "Administrador" ? "admin" : "student"}`}>{entry.previousRole}</span><b>→</b><span className={`users-role-pill ${entry.newRole === "Administrador" ? "admin" : "student"}`}>{entry.newRole}</span></div>
              <div className="audit-actor"><small>Cambiado por</small><strong>{entry.changedByName}</strong><small>{entry.changedByEmail}</small></div>
              <time>{formatDate(entry.changedAt)}</time>
            </article>)}
          </div>
        ) : <div className="users-empty audit-empty">Aún no se han realizado cambios de rol.</div>}
      </section>
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const USER_KEY = "reserva-espacios-user";
const USERS_KEY = "reserva-espacios-users";

const demoUser = {
  id: "demo-user",
  nombres: "Valentina",
  apellidos: "Gómez",
  correo: "demo@universidad.edu.co",
  telefono: "300 555 0198",
  rol: "Estudiante",
  programa: "Ingeniería de Sistemas",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const login = (correo, contrasena) => {
    const normalizedEmail = correo.trim().toLowerCase();
    let users = [];
    try { users = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { users = []; }
    const found = users.find((item) => (item.correo === normalizedEmail || item.documento === correo.trim()) && item.contrasena === contrasena);
    const isDemo = normalizedEmail === demoUser.correo && contrasena === "Demo123!";
    if (!found && !isDemo) throw new Error("Credenciales inválidas");
    const nextUser = found ? { ...found, contrasena: undefined } : demoUser;
    setUser(nextUser);
    return nextUser;
  };

  const register = (payload) => {
    const normalizedEmail = payload.correo.trim().toLowerCase();
    let users = [];
    try { users = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { users = []; }
    if (normalizedEmail === demoUser.correo || users.some((item) => item.correo === normalizedEmail || item.documento === payload.documento.trim())) {
      throw new Error("Este correo ya está registrado");
    }
    const nextUser = {
      id: "user-" + Date.now(),
      ...payload,
      correo: normalizedEmail,
      rol: payload.idRol === 1 ? "Estudiante" : payload.idRol === 2 ? "Docente" : "Administrativo",
      programa: payload.programa || "Comunidad universitaria",
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...nextUser, contrasena: payload.contrasena }]));
    const safeUser = { ...nextUser, contrasena: undefined };
    setUser(safeUser);
    return safeUser;
  };

  const logout = () => setUser(null);
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, register, logout, demoUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
}

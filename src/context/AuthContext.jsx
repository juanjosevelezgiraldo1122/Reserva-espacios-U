import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth, firebaseConfigured } from "../firebase";

const AuthContext = createContext(null);
const USER_KEY = "reserva-espacios-user";
const USERS_KEY = "reserva-espacios-users";
const ROLE_AUDIT_KEY = "reserva-espacios-role-audit";
const USER_DATA_EVENT = "reservation-users-changed";

export const demoUsers = {
  estudiante: {
    id: "demo-student",
    nombres: "Valentina",
    apellidos: "Gómez",
    correo: "estudiante@universidad.edu.co",
    telefono: "300 555 0198",
    rol: "Estudiante",
    programa: "Ingeniería de Sistemas",
  },
  administrador: {
    id: "demo-admin",
    nombres: "Andrés",
    apellidos: "Administrador",
    correo: "admin@universidad.edu.co",
    telefono: "",
    rol: "Administrador",
    programa: "Administración de espacios",
  },
};

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}

export function getAdminUsers() {
  const savedUsers = readUsers();
  const demoProfiles = Object.values(demoUsers).map((demoUser) => ({
    ...demoUser,
    ...savedUsers.find((item) => item.id === demoUser.id),
    esCuentaPrueba: true,
  }));
  const registeredUsers = savedUsers.filter((item) => !Object.values(demoUsers).some((demoUser) => demoUser.id === item.id));
  return [...demoProfiles, ...registeredUsers].sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`, "es"));
}

export function getRoleAudit() {
  try { return JSON.parse(localStorage.getItem(ROLE_AUDIT_KEY)) || []; } catch { return []; }
}

export function subscribeAdminUserData(callback) {
  window.addEventListener(USER_DATA_EVENT, callback);
  const onStorage = (event) => {
    if ([USERS_KEY, ROLE_AUDIT_KEY].includes(event.key)) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(USER_DATA_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function saveProfile(profile) {
  const profiles = readUsers().filter((item) => item.correo !== profile.correo);
  profiles.push(profile);
  localStorage.setItem(USERS_KEY, JSON.stringify(profiles));
}

function profileFor(firebaseUser) {
  const email = firebaseUser.email?.toLowerCase() || "";
  const storedProfile = readUsers().find((item) => item.correo?.toLowerCase() === email) || {};
  const [firstName = "", ...lastNames] = (firebaseUser.displayName || "").split(" ");
  const profile = {
    id: firebaseUser.uid,
    nombres: storedProfile.nombres || firstName || email.split("@")[0],
    apellidos: storedProfile.apellidos || lastNames.join(" "),
    correo: email,
    documento: storedProfile.documento || "",
    anioNacimiento: storedProfile.anioNacimiento || "",
    telefono: storedProfile.telefono || "",
    rol: storedProfile.rol || "Estudiante",
    programa: storedProfile.programa || "Comunidad universitaria",
  };
  saveProfile(profile);
  return profile;
}

function cleanAuthError(error) {
  if (error?.code === "auth/email-already-in-use") return new Error("Este correo ya tiene una cuenta.");
  if (error?.code === "auth/invalid-email") return new Error("El correo no tiene un formato válido.");
  if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(error?.code)) {
    return new Error("No encontramos una cuenta con esos datos.");
  }
  if (error?.code === "auth/weak-password") return new Error("La contraseña debe tener al menos 6 caracteres.");
  if (error?.code === "auth/too-many-requests") return new Error("Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.");
  if (error?.code === "auth/operation-not-allowed") return new Error("Activa el proveedor de acceso correspondiente en Firebase Authentication.");
  if (error?.code === "auth/popup-closed-by-user") return new Error("Se cerró la ventana de Google antes de completar el acceso.");
  if (error?.code === "auth/popup-blocked") return new Error("El navegador bloqueó la ventana de Google. Permite las ventanas emergentes e inténtalo de nuevo.");
  if (error?.code === "auth/unauthorized-domain") return new Error("Agrega el dominio de esta aplicación en los dominios autorizados de Firebase.");
  if (error?.code === "auth/network-request-failed") return new Error("No se pudo conectar con Firebase. Revisa tu conexión a internet.");
  return error instanceof Error ? error : new Error("No fue posible completar la solicitud.");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
  });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setAuthReady(true);
      return undefined;
    }
    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) setUser(profileFor(firebaseUser));
      else {
        setUser((current) => current?.id?.startsWith("demo-") ? current : null);
      }
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const syncCurrentRole = () => {
      const profile = readUsers().find((item) => item.id === user.id || item.correo?.toLowerCase() === user.correo?.toLowerCase());
      if (profile && profile.rol !== user.rol) {
        setUser((current) => current?.id === user.id ? { ...current, rol: profile.rol } : current);
      }
    };
    const onStorage = (event) => {
      if (event.key === USERS_KEY) syncCurrentRole();
    };
    window.addEventListener(USER_DATA_EVENT, syncCurrentRole);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(USER_DATA_EVENT, syncCurrentRole);
      window.removeEventListener("storage", onStorage);
    };
  }, [user?.id, user?.correo, user?.rol]);

  const login = async (correo, contrasena) => {
    const input = correo.trim();
    const normalizedEmail = input.toLowerCase();
    const demoUser = Object.values(demoUsers).find((item) => item.correo === normalizedEmail);
    if (demoUser && contrasena === "Demo123!") {
      if (firebaseConfigured) await signOut(firebaseAuth).catch(() => {});
      const nextDemoUser = { ...demoUser, ...readUsers().find((item) => item.id === demoUser.id) };
      setUser(nextDemoUser);
      return nextDemoUser;
    }
    if (!firebaseConfigured) throw new Error("Firebase aún no está configurado. Las cuentas de prueba siguen disponibles.");

    const previousUsers = readUsers();
    const legacyUser = previousUsers.find((item) =>
      item.correo?.toLowerCase() === normalizedEmail || item.documento === input,
    );
    const email = legacyUser?.correo || normalizedEmail;
    let credential;
    try {
      credential = await signInWithEmailAndPassword(firebaseAuth, email, contrasena);
    } catch (signInError) {
      const isLegacyPassword = legacyUser?.contrasena === contrasena;
      if (!isLegacyPassword || !["auth/user-not-found", "auth/invalid-credential"].includes(signInError.code)) {
        throw cleanAuthError(signInError);
      }
      try {
        credential = await createUserWithEmailAndPassword(firebaseAuth, email, contrasena);
      } catch (migrationError) {
        throw cleanAuthError(migrationError);
      }
    }

    const nextUser = profileFor(credential.user);
    setUser(nextUser);
    return nextUser;
  };

  const loginWithGoogle = async () => {
    if (!firebaseConfigured) throw new Error("Firebase aún no está configurado.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const credential = await signInWithPopup(firebaseAuth, provider);
      const email = credential.user.email?.toLowerCase() || "";
      if (!email.endsWith("@amigo.edu.co")) {
        const isNewUser = getAdditionalUserInfo(credential)?.isNewUser;
        if (isNewUser) await deleteUser(credential.user).catch(() => signOut(firebaseAuth));
        else await signOut(firebaseAuth);
        throw new Error("Usa tu cuenta institucional @amigo.edu.co para continuar.");
      }
      const nextUser = profileFor(credential.user);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw error.message?.includes("@amigo.edu.co") ? error : cleanAuthError(error);
    }
  };

  const register = async (payload) => {
    if (!firebaseConfigured) throw new Error("Firebase aún no está configurado.");
    const normalizedEmail = payload.correo.trim().toLowerCase();
    const users = readUsers();
    if (Object.values(demoUsers).some((item) => item.correo === normalizedEmail) || users.some((item) => item.correo?.toLowerCase() === normalizedEmail || item.documento === payload.documento.trim())) {
      throw new Error("Este correo o documento ya está registrado.");
    }

    let credential;
    try {
      credential = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, payload.contrasena);
      await updateProfile(credential.user, { displayName: `${payload.nombres.trim()} ${payload.apellidos.trim()}`.trim() });
    } catch (error) {
      throw cleanAuthError(error);
    }

    const nextUser = {
      id: credential.user.uid,
      nombres: payload.nombres.trim(),
      apellidos: payload.apellidos.trim(),
      correo: normalizedEmail,
      documento: payload.documento.trim(),
      anioNacimiento: String(payload.anioNacimiento),
      telefono: payload.telefono || "",
      rol: "Estudiante",
      programa: payload.programa || "Comunidad universitaria",
    };
    saveProfile(nextUser);
    setUser(nextUser);
    return nextUser;
  };

  const recoverPassword = async (correo) => {
    const normalizedEmail = correo.trim().toLowerCase();
    if (Object.values(demoUsers).some((item) => item.correo === normalizedEmail)) return;
    if (!firebaseConfigured) throw new Error("Firebase aún no está configurado.");
    firebaseAuth.languageCode = "es";
    const legacyAccount = readUsers().find((item) => item.correo?.toLowerCase() === normalizedEmail && item.contrasena);
    if (legacyAccount && !firebaseAuth.currentUser) {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, legacyAccount.contrasena);
        await updateProfile(credential.user, { displayName: `${legacyAccount.nombres || ""} ${legacyAccount.apellidos || ""}`.trim() });
        profileFor(credential.user);
        await signOut(firebaseAuth);
      } catch (migrationError) {
        if (migrationError.code !== "auth/email-already-in-use") throw cleanAuthError(migrationError);
      }
    }
    try {
      await sendPasswordResetEmail(firebaseAuth, normalizedEmail);
    } catch (error) {
      if (["auth/user-not-found", "auth/invalid-credential"].includes(error.code)) return;
      if (error.code === "auth/invalid-email") throw new Error("Ingresa un correo válido.");
      if (error.code === "auth/too-many-requests") throw new Error("Se solicitaron muchos enlaces. Espera un momento e inténtalo de nuevo.");
      throw cleanAuthError(error);
    }
  };

  const updateUserRole = (userId, newRole) => {
    if (user?.rol !== "Administrador") throw new Error("Solo un administrador puede editar roles.");
    if (!["Estudiante", "Administrador"].includes(newRole)) throw new Error("Selecciona un rol válido.");
    const target = getAdminUsers().find((item) => item.id === userId);
    if (!target) throw new Error("No encontramos ese usuario.");
    if (target.id === user.id || target.correo === user.correo) throw new Error("No puedes cambiar el rol de tu propia cuenta.");
    if (target.rol === newRole) return;

    const safeTarget = { ...target };
    delete safeTarget.contrasena;
    delete safeTarget.esCuentaPrueba;
    saveProfile({ ...safeTarget, rol: newRole });
    const audit = getRoleAudit();
    audit.unshift({
      id: `role-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: target.id,
      userName: `${target.nombres || ""} ${target.apellidos || ""}`.trim() || target.correo,
      userEmail: target.correo,
      previousRole: target.rol,
      newRole,
      changedById: user.id,
      changedByName: `${user.nombres || ""} ${user.apellidos || ""}`.trim() || user.correo,
      changedByEmail: user.correo,
      changedAt: new Date().toISOString(),
    });
    localStorage.setItem(ROLE_AUDIT_KEY, JSON.stringify(audit.slice(0, 500)));
    window.dispatchEvent(new Event(USER_DATA_EVENT));
  };

  const logout = async () => {
    setUser(null);
    if (firebaseConfigured) await signOut(firebaseAuth).catch(() => {});
  };
  const value = useMemo(() => ({ user, authReady, isAuthenticated: Boolean(user), login, loginWithGoogle, register, recoverPassword, updateUserRole, logout, demoUsers }), [user, authReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
}

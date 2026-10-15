import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Register from "./login/Register";
import InicioSesion from "./login/InicioSesion";
import LayoutPrivado from "./components/LayoutPrivado";
import { AuthProvider, useAuth } from "./context/AuthContext";

function RutaProtegida() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <LayoutPrivado /> : <Navigate to="/InicioSesion" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/InicioSesion" element={<InicioSesion />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/app" element={<RutaProtegida />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reservar" element={<Booking />} />
        <Route path="reservas" element={<Reservations />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="ayuda" element={<Help />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

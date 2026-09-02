import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; 
import { AuthProvider } from "./context/AuthContext"; 
import Register from "./login/Register";
import InicioSesion from "./login/InicioSesion";

function AppRoutes() { 

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/InicioSesion" element={<InicioSesion />} />
      <Route path="/Register" element={<Register />} />
    </Routes>
  )
}

function App() {
  

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
   
    );
};

export default App

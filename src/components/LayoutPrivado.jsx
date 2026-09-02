import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeaderInt from '../components/HeaderInt';

function LayoutPrivado() {
  const { empresa } = useAuth(); /* CORREGIR */ 

  return (
    <div className="layout-privado">
      {/* Header específico para usuarios autenticados */}
      <HeaderInt empresaData={empresa} /> {/* CORREGIR*/}
      
      <main className="main-content-privado">
        <Outlet />  {/* Aquí se renderizan las páginas privadas */}
      </main>
    </div>
  );
}

export default LayoutPrivado;
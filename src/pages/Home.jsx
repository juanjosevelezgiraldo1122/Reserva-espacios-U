import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { spaces } from "../data/spaces";
import Footer from "../components/Footer";
import "../styles/Home.css";

const steps = [
  ["01", "Elige tu espacio", "Explora salas, aulas, laboratorios y auditorios según lo que necesitas."],
  ["02", "Revisa disponibilidad", "Selecciona una fecha y encuentra horarios libres en tiempo real."],
  ["03", "Confirma tu reserva", "Cuéntanos el motivo y recibe la confirmación al instante."],
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  return <div className="landing">
    <header className="landing-nav"><Link to="/" className="landing-brand"><span>R</span>Reserva<span>Espacios</span></Link><nav><a href="#espacios">Espacios</a><a href="#como-funciona">Cómo funciona</a><a href="#ayuda">Ayuda</a></nav><div className="landing-actions">{isAuthenticated ? <Link className="btn btn-primary" to="/app/dashboard">Ir a mi panel →</Link> : <><Link to="/InicioSesion" className="login-link">Iniciar sesión</Link><Link to="/Register" className="btn btn-primary">Crear cuenta</Link></>}</div></header>
    <main>
      <section className="landing-hero"><div className="hero-copy"><div className="hero-kicker"><span /> Espacios que se adaptan a ti</div><h1>Tu próximo gran<br /><em>momento</em> empieza aquí.</h1><p>Reserva aulas, salas y auditorios de tu universidad de forma simple, rápida y sin cruces de horarios.</p><div className="hero-actions"><Link className="btn btn-primary" to={isAuthenticated ? "/app/reservar" : "/Register"}>Reserva un espacio <span>→</span></Link><a className="text-link" href="#como-funciona">Conoce cómo funciona <span>↓</span></a></div><div className="hero-proof"><div className="proof-avatars"><span>VG</span><span>MR</span><span>AL</span><b>+</b></div><p><strong>+2.400</strong> personas ya reservan<br />sus espacios con nosotros.</p></div></div><div className="hero-visual"><div className="visual-glow" /><div className="visual-card card-back" /><div className="visual-card card-front"><div className="visual-top"><span>Disponibilidad hoy</span><b>● En vivo</b></div><div className="visual-date"><strong>24</strong><span>OCT<br /><small>2026</small></span><i>›</i></div><div className="mini-space"><span className="mini-icon">▦</span><div><strong>Aula flexible 204</strong><small>Edificio A · Piso 2</small></div><b>✓</b></div><div className="mini-space second"><span className="mini-icon green">◈</span><div><strong>Coworking central</strong><small>Biblioteca · Piso 1</small></div><b>✓</b></div><div className="visual-footer"><span>8 espacios disponibles</span><Link to={isAuthenticated ? "/app/reservar" : "/Register"}>Ver disponibilidad →</Link></div></div><div className="float-tag tag-one">⌖ <span><b>300+</b><small>espacios</small></span></div><div className="float-tag tag-two">✦ <span><b>Fácil</b><small>y rápido</small></span></div></div></section>
      <section className="trust-strip"><span>Diseñado para la comunidad universitaria</span><div><b>●</b> Estudiantes <b>●</b> Docentes <b>●</b> Administrativos <b>●</b> Invitados</div></section>
      <section id="espacios" className="landing-section spaces-section"><div className="section-intro"><span className="eyebrow">Todo en un mismo lugar</span><h2>Un espacio para<br /><em>cada idea.</em></h2><p>Desde una sesión de estudio hasta el evento más importante del semestre.</p><Link className="text-link" to={isAuthenticated ? "/app/reservar" : "/Register"}>Explorar todos los espacios →</Link></div><div className="home-space-grid">{spaces.slice(0, 4).map((space) => <Link to={isAuthenticated ? "/app/reservar?space=" + space.id : "/Register"} className="home-space-card" key={space.id}><div className="home-space-art" style={{ background: space.color }}><span>{space.icon}</span><small>{space.type}</small></div><div className="home-space-info"><div><h3>{space.name}</h3><p>Hasta {space.capacity} personas</p></div><b>↗</b></div></Link>)}</div></section>
      <section id="como-funciona" className="landing-section process-section"><div className="process-heading"><span className="eyebrow">Tan simple como debería ser</span><h2>Reserva en <em>tres pasos.</em></h2></div><div className="steps-grid">{steps.map(([number, title, detail]) => <div className="step" key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></div>)}</div></section>
      <section id="ayuda" className="cta-section"><div><span className="eyebrow">¿Listo para empezar?</span><h2>Haz espacio para<br /><em>lo que importa.</em></h2><p>Tu siguiente idea necesita un lugar. Nosotros te ayudamos a encontrarlo.</p><Link to={isAuthenticated ? "/app/reservar" : "/Register"} className="btn btn-primary">Comenzar ahora →</Link></div><div className="cta-symbol">R<span>✦</span></div></section>
    </main>
    <Footer />
  </div>;
}

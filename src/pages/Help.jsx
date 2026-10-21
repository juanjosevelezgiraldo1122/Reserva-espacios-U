import { useState } from "react";
import "../styles/Help.css";

const questions = [
  ["¿Con cuánto tiempo puedo hacer una reserva?", "Puedes reservar desde hoy y hasta 30 días en adelante, según la disponibilidad de cada espacio."],
  ["¿Puedo cancelar una reserva?", "Sí. Ve a Mis reservas y usa el menú de la reserva que deseas cancelar. Recuerda hacerlo al menos 30 minutos antes."],
  ["¿Qué pasa si llego tarde?", "Debes activar tu reserva en los primeros 15 minutos. Después de ese tiempo el espacio puede liberarse para otra persona."],
  ["¿Qué espacios requieren aprobación?", "El Auditorio Norte y las reservas de más de 40 personas requieren validación del equipo de Servicios Generales."],
];

export default function Help() {
  const [open, setOpen] = useState(0);
  return <div className="help-page"><div className="page-heading"><div><span className="eyebrow">Estamos para ayudarte</span><h1>Centro de ayuda</h1><p>Resuelve tus dudas y aprovecha mejor los espacios de la universidad.</p></div></div><div className="help-grid"><section className="help-intro panel"><span className="help-icon">?</span><h2>¿Cómo podemos ayudarte?</h2><p>Consulta las preguntas frecuentes o escríbenos si necesitas una orientación personalizada.</p><a href="mailto:espacios@universidad.edu.co" className="btn btn-primary">Contactar soporte</a></section><section className="faq-list">{questions.map(([question, answer], index) => <div className={open === index ? "faq-item open" : "faq-item"} key={question}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><b>{open === index ? "−" : "+"}</b></button>{open === index && <p>{answer}</p>}</div>)}</section></div></div>;
}

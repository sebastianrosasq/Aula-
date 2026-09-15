"use client";

import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ClipboardPenLine,
  Clock3,
  FileText,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { TeacherDashboard } from "@/components/prototype/teacher-dashboard";
import { VotingSection } from "@/components/sections/voting-section";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, features, problems, timeline, users } from "@/data/content";
import { useAulaEnlaceTools } from "@/hooks/use-webmcp";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="hero-label">
            <span /> Innovación educativa en validación
          </p>
          <h1>
            Menos tiempo en tareas repetitivas, <em>más tiempo para enseñar.</em>
          </h1>
          <p className="hero-description">
            AulaEnlace explora una forma más simple de organizar el registro académico, preparar
            conclusiones y mantener informadas a las familias.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#demostracion">
              Explorar la demostración <ArrowRight />
            </a>
            <a className="secondary-button" href="#participar">
              Compartir mi experiencia
            </a>
          </div>
          <p className="hero-disclaimer">
            <ShieldCheck />
            Las funciones mostradas son propuestas por validar, no un producto terminado.
          </p>
        </motion.div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          <div className="hero-window">
            <div className="window-top">
              <span />
              <span />
              <span />
              <b>Resumen docente</b>
            </div>
            <div className="hero-window-body">
              <div className="window-greeting">
                <div>
                  <small>Martes, 15 de septiembre</small>
                  <strong>Lo importante, en un solo lugar</strong>
                </div>
                <span>5.º B</span>
              </div>
              <div className="hero-metrics">
                <span>
                  <b>28</b>estudiantes
                </span>
                <span>
                  <b>93%</b>asistencia
                </span>
                <span>
                  <b>4</b>pendientes
                </span>
              </div>
              <div className="hero-workflow">
                <div className="workflow-card">
                  <ClipboardPenLine />
                  <span>
                    <b>Registro del aula</b>
                    <small>Información organizada</small>
                  </span>
                  <CheckCircle2 />
                </div>
                <div className="workflow-line">
                  <ArrowDown />
                </div>
                <div className="workflow-card accent">
                  <Sparkles />
                  <span>
                    <b>Borrador descriptivo</b>
                    <small>Listo para revisar</small>
                  </span>
                  <ArrowRight />
                </div>
              </div>
            </div>
          </div>
          <div className="floating-chip chip-left">
            <Clock3 />
            <span>
              <b>Una sola captura</b>
              <small>para varias tareas</small>
            </span>
          </div>
          <div className="floating-chip chip-right">
            <MessageSquareText />
            <span>
              <b>Mensajes claros</b>
              <small>antes de enviar</small>
            </span>
          </div>
        </motion.div>
      </div>
      <a href="#problema" className="scroll-cue" aria-label="Ir a la sección del problema">
        <ArrowDown />
      </a>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="section problem-section" id="problema">
      <div className="container">
        <SectionHeading
          eyebrow="El punto de partida"
          title="La enseñanza convive con una carga administrativa fragmentada"
          description="El reto no es la falta de compromiso, sino la repetición de tareas y la dispersión de información durante la jornada docente."
        />
        <div className="problem-grid">
          {problems.map((problem, index) => (
            <motion.article
              key={problem.title}
              className="problem-card"
              {...reveal}
              transition={{ delay: index * 0.08 }}
            >
              <span className="card-number">0{index + 1}</span>
              <span className="problem-icon">
                <problem.icon />
              </span>
              <h3>{problem.title}</h3>
              <p>{problem.text}</p>
            </motion.article>
          ))}
        </div>
        <div className="problem-flow" aria-label="Flujo actual que genera trabajo repetido">
          <span>Cuaderno</span>
          <ArrowRight />
          <span>Hoja de cálculo</span>
          <ArrowRight />
          <span>Plataforma</span>
          <ArrowRight />
          <span>Mensaje a familias</span>
          <b>
            <FileText />
            Una misma información, varios registros
          </b>
        </div>
      </div>
    </section>
  );
}

function UsersSection() {
  return (
    <section className="section users-section">
      <div className="container users-layout">
        <div className="users-intro">
          <p className="eyebrow">Personas involucradas</p>
          <h2>Una solución útil debe entender a todo el ecosistema escolar</h2>
          <p>
            La validación observará cómo se conectan las necesidades del aula, el hogar y la gestión
            educativa.
          </p>
        </div>
        <div className="users-list">
          {users.map((user, index) => (
            <motion.article key={user.role} {...reveal} transition={{ delay: index * 0.08 }}>
              <span>
                <user.icon />
              </span>
              <div>
                <small>Usuario 0{index + 1}</small>
                <h3>{user.role}</h3>
                <p>{user.need}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="section solution-section" id="solucion">
      <div className="container">
        <SectionHeading
          eyebrow="Propuesta de solución"
          title="Un punto de encuentro para las tareas que hoy están separadas"
          description="Estas funciones son hipótesis iniciales. La investigación con docentes y familias determinará cuáles aportan valor real."
          action={
            <span className="validation-badge">
              <Search />
              En validación
            </span>
          }
        />
        <div className="feature-grid">
          {features.map((feature, index) => (
            <motion.article
              key={feature.id}
              className="feature-card"
              {...reveal}
              transition={{ delay: index * 0.06 }}
            >
              <span className="feature-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="feature-status">Hipótesis por contrastar</span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrototypeSection() {
  return (
    <section className="section prototype-section" id="demostracion">
      <div className="container">
        <SectionHeading
          eyebrow="Simulación del futuro aplicativo"
          title="Así podría sentirse una jornada más ordenada"
          description="Explora las pestañas del panel. Esta demostración no requiere iniciar sesión, no registra cambios y utiliza datos completamente ficticios."
        />
        <motion.div {...reveal}>
          <TeacherDashboard />
        </motion.div>
        <p className="prototype-footnote">
          <ShieldCheck />
          Prototipo conceptual: no guarda información académica ni representa un sistema
          implementado.
        </p>
      </div>
    </section>
  );
}

function FeedbackSection() {
  return (
    <section className="section feedback-section">
      <div className="container feedback-layout">
        <div className="feedback-copy">
          <SectionHeading
            eyebrow="Escuchar antes de construir"
            title="Cuéntanos qué parte del trabajo escolar necesita simplificarse"
            description="Tu experiencia puede revelar necesidades que la propuesta todavía no contempla y ayudar a orientar las próximas entrevistas."
          />
          <div className="feedback-points">
            <p>
              <span>01</span>Describe tu dificultad principal
            </p>
            <p>
              <span>02</span>Prioriza una función útil
            </p>
            <p>
              <span>03</span>Indica si deseas conversar
            </p>
          </div>
        </div>
        <FeedbackForm />
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="section process-section" id="proceso">
      <div className="container">
        <SectionHeading
          eyebrow="Proceso de Design Thinking"
          title="Avanzar con evidencia, no con supuestos"
          description="La propuesta se ajustará en cada etapa a partir de lo aprendido con la comunidad educativa."
        />
        <div className="timeline">
          {timeline.map((item, index) => (
            <motion.article
              key={item.step}
              {...reveal}
              transition={{ delay: index * 0.06 }}
              className={index === 0 ? "current" : ""}
            >
              <div className="timeline-marker">
                <span>{item.step}</span>
              </div>
              <div>
                <span className="timeline-status">{item.status}</span>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="section faq-section">
      <div className="container faq-layout">
        <div>
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2>Claridad sobre esta primera etapa</h2>
          <p>La web existe para aprender antes de invertir en el desarrollo completo.</p>
        </div>
        <Accordion className="faq-list" type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function LandingPage() {
  useAulaEnlaceTools();
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <UsersSection />
        <SolutionSection />
        <PrototypeSection />
        <VotingSection />
        <FeedbackSection />
        <ProcessSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}

"use client";

import {
  BarChart3,
  Bell,
  CalendarCheck2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  MoreHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { attendance, communications, evaluations, students } from "@/data/prototype";

function Summary() {
  return (
    <div className="dashboard-summary">
      <div className="summary-intro">
        <div>
          <p className="dashboard-kicker">Buenos días, profesora Elena</p>
          <h3>Resumen de 5.º B</h3>
        </div>
        <span className="fictitious-tag">Datos ficticios</span>
      </div>
      <div className="metric-grid">
        <article className="metric-card">
          <span className="metric-icon">
            <Users />
          </span>
          <div>
            <strong>28</strong>
            <span>Estudiantes</span>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon turquoise">
            <CalendarCheck2 />
          </span>
          <div>
            <strong>93%</strong>
            <span>Asistencia hoy</span>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon orange">
            <ClipboardCheck />
          </span>
          <div>
            <strong>4</strong>
            <span>Pendientes</span>
          </div>
        </article>
      </div>
      <div className="dashboard-two-col">
        <article className="panel-card">
          <div className="panel-title">
            <div>
              <p>Avance del aula</p>
              <span>Resumen por área</span>
            </div>
            <BarChart3 />
          </div>
          <div className="mini-chart" aria-label="Gráfico simulado de avance por área">
            {[62, 78, 56, 84, 71, 89, 74, 81].map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="chart-legend">
            <span>Inicio del periodo</span>
            <span>Avance actual</span>
          </div>
        </article>
        <article className="panel-card action-card">
          <div className="panel-title">
            <div>
              <p>Próximas acciones</p>
              <span>Prioridad de hoy</span>
            </div>
            <Clock3 />
          </div>
          <ul>
            <li>
              <span className="action-dot" />
              Revisar 3 evidencias <ChevronRight />
            </li>
            <li>
              <span className="action-dot turquoise" />
              Completar asistencia <ChevronRight />
            </li>
            <li>
              <span className="action-dot orange" />
              Preparar 2 mensajes <ChevronRight />
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}

function StudentsView() {
  return (
    <div className="data-panel">
      <div className="data-panel-head">
        <div>
          <h3>Estudiantes</h3>
          <p>Seguimiento resumido del aula</p>
        </div>
        <span>28 registros</span>
      </div>
      <div className="student-list">
        {students.map((student) => (
          <article key={student.name}>
            <span className="avatar">{student.initials}</span>
            <div>
              <strong>{student.name}</strong>
              <p>{student.note}</p>
            </div>
            <span className={`level-pill ${student.level === "En proceso" ? "warning" : ""}`}>
              {student.level}
            </span>
            <button type="button" aria-label={`Más opciones para ${student.name}`}>
              <MoreHorizontal />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function AttendanceView() {
  return (
    <div className="data-panel">
      <div className="data-panel-head">
        <div>
          <h3>Asistencia de hoy</h3>
          <p>Martes, 15 de septiembre</p>
        </div>
        <span className="success-text">26 presentes</span>
      </div>
      <div className="attendance-grid">
        {attendance.map((entry) => (
          <article key={entry.name}>
            <span className={`attendance-check ${entry.status.toLowerCase()}`}>
              <Check />
            </span>
            <div>
              <strong>{entry.name}</strong>
              <p>{entry.status}</p>
            </div>
            <button type="button" aria-label={`Cambiar asistencia de ${entry.name}`}>
              Cambiar
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function EvaluationsView() {
  return (
    <div className="data-panel">
      <div className="data-panel-head">
        <div>
          <h3>Evaluaciones</h3>
          <p>Vista consolidada del periodo</p>
        </div>
        <span>3 áreas</span>
      </div>
      <div className="evaluation-list">
        {evaluations.map((evaluation) => (
          <article key={evaluation.area}>
            <div>
              <strong>{evaluation.area}</strong>
              <span>{evaluation.label}</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${evaluation.progress}%` }} />
            </div>
            <b>{evaluation.progress}%</b>
          </article>
        ))}
      </div>
      <div className="prototype-insight">
        <Sparkles />
        <p>
          <strong>Posible apoyo</strong>
          <span>Preparar un borrador de conclusiones a partir de los registros seleccionados.</span>
        </p>
        <button type="button">Ver ejemplo</button>
      </div>
    </div>
  );
}

function CommunicationsView() {
  return (
    <div className="data-panel">
      <div className="data-panel-head">
        <div>
          <h3>Comunicaciones</h3>
          <p>Mensajes preparados para revisión docente</p>
        </div>
        <button type="button">Nuevo borrador</button>
      </div>
      <div className="message-list">
        {communications.map((message) => (
          <article key={message.family}>
            <span className="message-icon">
              <MessageSquareText />
            </span>
            <div>
              <strong>{message.family}</strong>
              <p>{message.subject}</p>
            </div>
            <span>{message.state}</span>
            <ChevronRight />
          </article>
        ))}
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="dashboard-logo">
          <span>A</span>
          <strong>AulaEnlace</strong>
        </div>
        <div className="dashboard-school">
          <span>I.E. Pública 3042</span>
          <button type="button" aria-label="Notificaciones">
            <Bell />
          </button>
          <span className="teacher-avatar">EP</span>
        </div>
      </div>
      <Tabs defaultValue="resumen" className="dashboard-tabs">
        <TabsList aria-label="Módulos del prototipo">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="comunicacion">Comunicación</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen">
          <Summary />
        </TabsContent>
        <TabsContent value="estudiantes">
          <StudentsView />
        </TabsContent>
        <TabsContent value="asistencia">
          <AttendanceView />
        </TabsContent>
        <TabsContent value="evaluaciones">
          <EvaluationsView />
        </TabsContent>
        <TabsContent value="comunicacion">
          <CommunicationsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

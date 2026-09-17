import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import {
  getAdminOverview,
  getFamilyOverview,
  getStudentOverview,
  getTeacherContext,
} from "@/db/queries";

export const dynamic = "force-dynamic";

function DatabaseUnavailable() {
  return (
    <main className="database-notice">
      <div>
        <AlertCircle size={30} />
        <p className="eyebrow">Configuración pendiente</p>
        <h1>Conecta MySQL para iniciar Aula+.</h1>
        <p>
          Crea un archivo <code>.env.local</code> a partir de <code>.env.example</code>, aplica las
          migraciones y vuelve a iniciar sesión.
        </p>
      </div>
    </main>
  );
}

function Welcome({ user }: { user: SessionUser }) {
  const firstName = user.firstName;
  const greeting: Record<SessionUser["role"], string> = {
    docente: "Revisa tu jornada y atiende las acciones pendientes de tus aulas.",
    padre: "Consulta el avance, asistencia y comunicaciones de tus hijos.",
    estudiante: "Consulta tus avances, asistencia y comunicaciones de tu aula.",
    admin: "Supervisa la actividad académica de la institución.",
  };
  return (
    <header className="dashboard-welcome">
      <p className="eyebrow">
        Panel de{" "}
        {user.role === "docente"
          ? "docencia"
          : user.role === "padre"
            ? "familia"
            : user.role === "estudiante"
              ? "estudiante"
              : "administración"}
      </p>
      <h1>Hola, {firstName}.</h1>
      <p>{greeting[user.role]}</p>
    </header>
  );
}

function TeacherDashboard({ user }: { user: SessionUser }) {
  return <TeacherDashboardData user={user} />;
}

async function TeacherDashboardData({ user }: { user: SessionUser }) {
  const context = await getTeacherContext(user.id);
  const activeClass = context.currentClass || context.nextClass;

  return (
    <>
      <Welcome user={user} />
      <section className="context-card">
        <div className="context-card__icon">
          <Clock3 size={22} />
        </div>
        <div className="context-card__content">
          <p className="eyebrow">{context.currentClass ? "En curso ahora" : "Próxima clase"}</p>
          {activeClass ? (
            <>
              <h2>
                {activeClass.subjectName} · {activeClass.classroomName}
              </h2>
              <p>
                {activeClass.startsAt.slice(0, 5)}–{activeClass.endsAt.slice(0, 5)} ·{" "}
                {activeClass.room || "Aula por definir"}
              </p>
            </>
          ) : (
            <>
              <h2>No tienes clases programadas ahora.</h2>
              <p>Tu jornada de hoy está al día.</p>
            </>
          )}
        </div>
        {activeClass && (
          <Link
            className="app-primary-button"
            href={"/panel/asistencia?classroomId=" + activeClass.classroomId}
          >
            Tomar asistencia <ArrowRight size={17} />
          </Link>
        )}
      </section>

      <section className="dashboard-grid dashboard-grid--teacher">
        <article className="dashboard-card dashboard-card--wide">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Seguimiento</p>
              <h2>Acciones que requieren atención</h2>
            </div>
            <BookOpenCheck size={22} />
          </div>
          <div className="metric-row">
            <div>
              <strong>{context.pendingConclusions}</strong>
              <span>conclusiones por completar</span>
            </div>
            <div>
              <strong>{context.nextClass ? "1" : "0"}</strong>
              <span>próxima clase programada</span>
            </div>
          </div>
          <Link className="text-link" href="/panel/mensajes">
            Abrir comunicación con familias <ArrowRight size={16} />
          </Link>
        </article>
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Siguiente bloque</h2>
            </div>
            <CalendarDays size={22} />
          </div>
          {context.nextClass ? (
            <p className="dashboard-card__body">
              {context.nextClass.subjectName} comienza a las{" "}
              {context.nextClass.startsAt.slice(0, 5)}.
            </p>
          ) : (
            <p className="dashboard-card__body">No quedan más bloques para hoy.</p>
          )}
        </article>
      </section>
    </>
  );
}

async function GuardianDashboard({ user }: { user: SessionUser }) {
  const overview = await getFamilyOverview(user.id);
  return (
    <>
      <Welcome user={user} />
      <section className="dashboard-grid dashboard-grid--family">
        {overview.children.map((child) => (
          <article className="student-summary" key={child.studentId}>
            <div className="student-summary__avatar">{child.firstName.charAt(0)}</div>
            <div>
              <p className="eyebrow">Estudiante</p>
              <h2>
                {child.firstName} {child.lastName}
              </h2>
              <p>{child.classroomName || "Aula sin asignar"}</p>
            </div>
          </article>
        ))}
        {overview.children.length === 0 && (
          <article className="dashboard-card">
            <h2>Aún no hay estudiantes vinculados.</h2>
            <p className="dashboard-card__body">
              La institución puede vincularlos desde administración.
            </p>
          </article>
        )}
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Alertas</p>
              <h2>Seguimiento familiar</h2>
            </div>
            <AlertCircle size={22} />
          </div>
          <strong className="metric-number">{overview.recentAlerts.length}</strong>
          <p className="dashboard-card__body">alertas activas que revisar.</p>
        </article>
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Mensajes</p>
              <h2>Bandeja</h2>
            </div>
            <MessageSquareText size={22} />
          </div>
          <strong className="metric-number">{overview.unreadMessages}</strong>
          <p className="dashboard-card__body">mensajes sin leer.</p>
          <Link className="text-link" href="/panel/mensajes">
            Escribir a un docente <ArrowRight size={16} />
          </Link>
        </article>
      </section>
      <section className="family-details">
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Asistencia</p>
              <h2>Últimos registros</h2>
            </div>
            <CheckCircle2 size={22} />
          </div>
          {overview.recentAttendance.length ? (
            <div className="progress-list">
              {overview.recentAttendance.slice(0, 5).map((record, index) => (
                <div className="progress-item" key={record.studentId + "-" + index}>
                  <span>{record.attendanceDate}</span>
                  <strong>{record.status}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-card__body">Aún no hay asistencia registrada.</p>
          )}
        </article>
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Progreso</p>
              <h2>Competencias recientes</h2>
            </div>
            <BookOpenCheck size={22} />
          </div>
          {overview.recentProgress.length ? (
            <div className="progress-list">
              {overview.recentProgress.slice(0, 5).map((item, index) => (
                <div className="progress-item" key={item.studentId + "-" + index}>
                  <span>{item.subjectName}</span>
                  <strong>{item.level}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-card__body">
              Los avances aparecerán cuando el docente los registre.
            </p>
          )}
        </article>
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Próximas actividades</p>
              <h2>Agenda académica</h2>
            </div>
            <CalendarDays size={22} />
          </div>
          {overview.upcomingActivities.length ? (
            <div className="progress-list">
              {overview.upcomingActivities.slice(0, 5).map((item, index) => (
                <div className="progress-item" key={item.studentId + "-" + index}>
                  <span>
                    {item.title} · {item.subjectName}
                  </span>
                  <strong>{item.evaluationDate}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-card__body">No hay actividades próximas registradas.</p>
          )}
        </article>
      </section>
      {overview.recentAlerts.length ? (
        <section className="dashboard-card family-alerts">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Alertas</p>
              <h2>Casos a revisar</h2>
            </div>
            <AlertCircle size={22} />
          </div>
          <div className="progress-list">
            {overview.recentAlerts.map((alert) => (
              <div className="progress-item" key={alert.id}>
                <span>{alert.title}</span>
                <strong>{alert.level}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

async function StudentDashboard({ user }: { user: SessionUser }) {
  const overview = await getStudentOverview(user.id);
  return (
    <>
      <Welcome user={user} />
      <section className="dashboard-grid dashboard-grid--student">
        <article className="dashboard-card dashboard-card--wide">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Mi aula</p>
              <h2>{overview.student?.classroomName || "Sin aula asignada"}</h2>
            </div>
            <UsersRound size={22} />
          </div>
          <p className="dashboard-card__body">
            Consulta tus avances por competencia y mantente al día con tu clase.
          </p>
        </article>
        <article className="dashboard-card">
          <div className="dashboard-card__heading">
            <div>
              <p className="eyebrow">Asistencia</p>
              <h2>Mi registro</h2>
            </div>
            <CheckCircle2 size={22} />
          </div>
          <strong className="metric-number">
            {overview.recentAttendance.filter((record) => record.status === "presente").length}
          </strong>
          <p className="dashboard-card__body">asistencias registradas.</p>
        </article>
      </section>

      <section className="dashboard-card progress-card">
        <div className="dashboard-card__heading">
          <div>
            <p className="eyebrow">Progreso</p>
            <h2>Competencias recientes</h2>
          </div>
          <BookOpenCheck size={22} />
        </div>
        {overview.progress.length ? (
          <div className="progress-list">
            {overview.progress.map((item, index) => (
              <div className="progress-item" key={item.subjectName + "-" + index}>
                <span>{item.subjectName}</span>
                <strong>{item.level}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="dashboard-card__body">Tu docente aún no ha publicado evaluaciones.</p>
        )}
      </section>
    </>
  );
}

async function AdminDashboard({ user }: { user: SessionUser }) {
  const overview = await getAdminOverview(user.institutionId);
  return (
    <>
      <Welcome user={user} />
      <section className="dashboard-grid dashboard-grid--admin">
        <article className="dashboard-card">
          <p className="eyebrow">Usuarios activos</p>
          <strong className="metric-number">{overview.users}</strong>
          <p className="dashboard-card__body">miembros de la institución.</p>
        </article>
        <article className="dashboard-card">
          <p className="eyebrow">Aulas activas</p>
          <strong className="metric-number">{overview.classrooms}</strong>
          <p className="dashboard-card__body">secciones en funcionamiento.</p>
        </article>
        <article className="dashboard-card">
          <p className="eyebrow">Notificaciones</p>
          <strong className="metric-number">{overview.unreadNotifications}</strong>
          <p className="dashboard-card__body">avisos institucionales sin leer.</p>
        </article>
      </section>
    </>
  );
}

async function PanelContent() {
  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch {
    return <DatabaseUnavailable />;
  }
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      {user.role === "docente" && <TeacherDashboard user={user} />}
      {user.role === "padre" && <GuardianDashboard user={user} />}
      {user.role === "estudiante" && <StudentDashboard user={user} />}
      {user.role === "admin" && <AdminDashboard user={user} />}
    </AppShell>
  );
}

export default function PanelPage() {
  return <PanelContent />;
}

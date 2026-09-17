import { AlertCircle, ClipboardCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { AttendanceBoard } from "@/components/app/attendance-board";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { getAttendanceRoster } from "@/db/queries";
import { getDb } from "@/db";
import { and, eq } from "drizzle-orm";
import { classrooms, teacherAssignments } from "@/db/schema";

export const dynamic = "force-dynamic";

function todayInPeru() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function AttendanceContent({
  user,
  classroomId,
}: {
  user: SessionUser;
  classroomId: string;
}) {
  const db = getDb();
  const permitted =
    user.role === "admin" ||
    Boolean(
      await db
        .select({ id: teacherAssignments.id })
        .from(teacherAssignments)
        .where(
          and(
            eq(teacherAssignments.teacherId, user.id),
            eq(teacherAssignments.classroomId, classroomId),
            eq(teacherAssignments.active, true),
          ),
        )
        .limit(1)
        .then((rows) => rows[0]),
    );
  if (!permitted) {
    return (
      <AppShell user={user}>
        <main className="inline-notice">
          <AlertCircle size={22} />
          <p>No tienes permiso para registrar asistencia en esta aula.</p>
        </main>
      </AppShell>
    );
  }
  const classroom = await db
    .select({ name: classrooms.name })
    .from(classrooms)
    .where(eq(classrooms.id, classroomId))
    .limit(1);
  if (!classroom[0])
    return (
      <AppShell user={user}>
        <main className="inline-notice">
          <AlertCircle size={22} />
          <p>El aula solicitada no existe.</p>
        </main>
      </AppShell>
    );

  const date = todayInPeru();
  const roster = await getAttendanceRoster(classroomId, date);
  return (
    <AppShell user={user}>
      <header className="dashboard-welcome dashboard-welcome--compact">
        <p className="eyebrow">Asistencia rápida</p>
        <h1>{classroom[0].name}</h1>
        <p>{date}</p>
      </header>
      <AttendanceBoard
        classroomId={classroomId}
        classroomLabel={classroom[0].name}
        date={date}
        students={roster}
      />
    </AppShell>
  );
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classroomId?: string }>;
}) {
  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch {
    return (
      <main className="database-notice">
        <div>
          <ClipboardCheck size={30} />
          <h1>MySQL aún no está configurado.</h1>
          <p>Configura la conexión antes de usar el registro de asistencia.</p>
        </div>
      </main>
    );
  }
  if (!user) redirect("/login");
  if (user.role !== "docente" && user.role !== "admin") redirect("/panel");
  const parameters = await searchParams;
  if (!parameters.classroomId) redirect("/panel");
  return <AttendanceContent user={user} classroomId={parameters.classroomId} />;
}

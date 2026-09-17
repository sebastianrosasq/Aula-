import { BookOpenCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { CourseCatalog } from "@/components/app/course-catalog";
import { TeacherProgressManager } from "@/components/app/teacher-progress-manager";
import { getCourseCatalog, getTeacherProgress } from "@/db/queries";
import { getSessionUser, type SessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch {
    return (
      <main className="database-notice">
        <div>
          <BookOpenCheck size={30} />
          <h1>MySQL aún no está configurado.</h1>
          <p>Configura la conexión antes de consultar los cursos.</p>
        </div>
      </main>
    );
  }
  if (!user) redirect("/login");

  const [courses, teacherProgress] = await Promise.all([
    getCourseCatalog(user),
    user.role === "docente" ? getTeacherProgress(user.id) : Promise.resolve([]),
  ]);
  return (
    <AppShell user={user}>
      <CourseCatalog role={user.role} courses={courses} />
      {user.role === "docente" ? <TeacherProgressManager initialRows={teacherProgress} /> : null}
    </AppShell>
  );
}

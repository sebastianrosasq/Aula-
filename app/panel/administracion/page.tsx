import { Building2 } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminManager } from "@/components/app/admin-manager";
import { AppShell } from "@/components/app/app-shell";
import { getAdminManagement } from "@/db/queries";
import { getSessionUser, type SessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdministrationPage() {
  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch {
    return (
      <main className="database-notice">
        <div>
          <Building2 size={30} />
          <h1>MySQL aún no está configurado.</h1>
          <p>Configura la conexión antes de gestionar la institución.</p>
        </div>
      </main>
    );
  }
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/panel");
  const management = await getAdminManagement(user.institutionId);

  return (
    <AppShell user={user}>
      <header className="dashboard-welcome dashboard-welcome--compact">
        <p className="eyebrow">Administración</p>
        <h1>Gestiona tu institución.</h1>
        <p>Crea cuentas, restablece accesos y actualiza los datos institucionales.</p>
      </header>
      <AdminManager
        institution={management.institution}
        members={management.members}
        classrooms={management.classroomOptions}
        students={management.studentOptions}
        currentUserId={user.id}
      />
    </AppShell>
  );
}

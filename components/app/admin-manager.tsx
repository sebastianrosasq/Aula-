"use client";

import { FormEvent, useMemo, useState } from "react";
import { Building2, KeyRound, Search, UserPlus, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "docente" | "estudiante" | "padre";
  active: boolean;
  lastLoginAt: Date | null;
};

type Institution =
  { id: string; name: string; modularCode: string | null; active: boolean } | undefined;

const roleNames = {
  admin: "Administración",
  docente: "Docente",
  estudiante: "Estudiante",
  padre: "Familia",
};
type Notice = { kind: "success" | "error"; message: string };

export function AdminManager({
  institution,
  members,
  classrooms,
  students,
  currentUserId,
}: {
  institution: Institution;
  members: Member[];
  classrooms: Array<{ id: string; name: string }>;
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    classroomName: string | null;
  }>;
  currentUserId: string;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [newRole, setNewRole] = useState<"docente" | "estudiante" | "padre">("docente");
  const [resetTarget, setResetTarget] = useState<Member | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const visibleMembers = useMemo(() => {
    const query = memberQuery.trim().toLocaleLowerCase("es-PE");
    if (!query) return members.slice(0, 60);
    return members.filter((member) =>
      `${member.firstName} ${member.lastName} ${member.email} ${roleNames[member.role]}`
        .toLocaleLowerCase("es-PE")
        .includes(query),
    );
  }, [memberQuery, members]);

  async function submit(
    endpoint: string,
    method: "POST" | "PATCH",
    payload: unknown,
    successMessage = "Cambios guardados correctamente.",
  ) {
    if (saving) return false;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setNotice({ kind: "error", message: body.error ?? "No se pudo guardar el cambio." });
        return false;
      }
      setNotice({ kind: "success", message: successMessage });
      router.refresh();
      return true;
    } catch {
      setNotice({
        kind: "error",
        message:
          "No se pudo conectar para guardar los cambios. Revisa tu conexión e inténtalo nuevamente.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveInstitution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit("/api/admin/institution", "PATCH", {
      name: data.get("name"),
      modularCode: data.get("modularCode") || null,
    });
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const created = await submit("/api/admin/users", "POST", {
      email: data.get("email"),
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      role: data.get("role"),
      temporaryPassword: data.get("temporaryPassword"),
      classroomId: data.get("classroomId") || undefined,
      linkedStudentId: data.get("linkedStudentId") || undefined,
    });
    if (created) event.currentTarget.reset();
  }

  async function toggleMember(member: Member) {
    await submit("/api/admin/users/" + member.id, "PATCH", { active: !member.active });
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetTarget) return;
    if (temporaryPassword.length < 10) {
      setNotice({
        kind: "error",
        message: "La contraseña temporal debe tener al menos 10 caracteres.",
      });
      return;
    }
    const updated = await submit(
      "/api/admin/users/" + resetTarget.id,
      "PATCH",
      { temporaryPassword },
      `Acceso temporal restablecido para ${resetTarget.firstName} ${resetTarget.lastName}.`,
    );
    if (updated) {
      setTemporaryPassword("");
      setResetTarget(null);
    }
  }

  return (
    <div className="admin-workspace">
      <section className="admin-panel">
        <div className="admin-panel__heading">
          <div>
            <p className="app-eyebrow">Institución</p>
            <h2>Datos generales</h2>
          </div>
          <Building2 />
        </div>
        <form className="admin-form" noValidate onSubmit={saveInstitution}>
          <label>
            Nombre
            <input name="name" defaultValue={institution?.name} required maxLength={180} />
          </label>
          <label>
            Código modular
            <input
              name="modularCode"
              defaultValue={institution?.modularCode ?? ""}
              maxLength={30}
            />
          </label>
          <button className="app-primary-button" disabled={saving} type="submit">
            Guardar institución
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__heading">
          <div>
            <p className="app-eyebrow">Nueva cuenta</p>
            <h2>Crear usuario</h2>
          </div>
          <UserPlus />
        </div>
        <form className="admin-form" noValidate onSubmit={createUser}>
          <div className="admin-form__grid">
            <label>
              Nombres
              <input name="firstName" required maxLength={100} />
            </label>
            <label>
              Apellidos
              <input name="lastName" required maxLength={120} />
            </label>
          </div>
          <label>
            Correo institucional
            <input name="email" type="email" required maxLength={190} />
          </label>
          <label>
            Rol
            <select
              name="role"
              value={newRole}
              onChange={(event) => setNewRole(event.target.value as typeof newRole)}
            >
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
              <option value="padre">Familia</option>
            </select>
          </label>
          {newRole === "estudiante" ? (
            <label>
              Aula y sección
              <select name="classroomId" required defaultValue="">
                <option value="" disabled>
                  Selecciona un aula
                </option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {newRole === "padre" ? (
            <label>
              Estudiante vinculado
              <select name="linkedStudentId" required defaultValue="">
                <option value="" disabled>
                  Selecciona un estudiante
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.lastName}, {student.firstName} · {student.classroomName ?? "Sin aula"}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Contraseña temporal
            <input name="temporaryPassword" type="password" minLength={10} required />
          </label>
          <button className="app-primary-button" disabled={saving} type="submit">
            Crear cuenta
          </button>
        </form>
      </section>

      <section className="admin-panel admin-panel--members">
        <div className="admin-panel__heading">
          <div>
            <p className="app-eyebrow">Cuentas</p>
            <h2>Usuarios de la institución</h2>
          </div>
          <UserRoundCog />
        </div>
        <div className="member-toolbar">
          <label className="app-search">
            <Search aria-hidden="true" />
            <input
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Buscar por nombre, correo o rol"
              aria-label="Buscar usuarios"
            />
          </label>
          <span>
            {memberQuery ? `${visibleMembers.length} encontrados` : `${members.length} cuentas`}
          </span>
        </div>
        {notice ? (
          <p
            className={"attendance-feedback " + notice.kind}
            role={notice.kind === "error" ? "alert" : "status"}
          >
            {notice.message}
          </p>
        ) : null}
        <div className="member-list">
          {visibleMembers.map((member) => (
            <article className="member-row" key={member.id}>
              <div className="member-avatar">
                {member.firstName.charAt(0)}
                {member.lastName.charAt(0)}
              </div>
              <div className="member-info">
                <strong>
                  {member.firstName} {member.lastName}
                </strong>
                <span>
                  {member.email} · {roleNames[member.role]}
                </span>
              </div>
              <span className={member.active ? "member-status active" : "member-status"}>
                {member.active ? "Activo" : "Inactivo"}
              </span>
              <div className="member-actions">
                <button
                  type="button"
                  onClick={() => setResetTarget(member)}
                  aria-label={"Restablecer contraseña de " + member.firstName}
                  aria-haspopup="dialog"
                >
                  <KeyRound size={16} />
                </button>
                {member.id !== currentUserId ? (
                  <button type="button" onClick={() => toggleMember(member)}>
                    {member.active ? "Desactivar" : "Activar"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {!memberQuery && members.length > visibleMembers.length ? (
          <p className="member-list-note">
            Mostrando las primeras {visibleMembers.length} cuentas. Usa el buscador para localizar
            las demás.
          </p>
        ) : null}
        {resetTarget ? (
          <form
            className="password-reset-panel"
            onSubmit={resetPassword}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <div>
              <p className="app-eyebrow">Acceso temporal</p>
              <h3 id="reset-password-title">Restablecer acceso de {resetTarget.firstName}</h3>
              <p>Entrega esta contraseña temporal a la persona por un canal seguro.</p>
            </div>
            <label>
              Nueva contraseña temporal
              <input
                value={temporaryPassword}
                onChange={(event) => setTemporaryPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                required
                autoFocus
              />
            </label>
            <div className="password-reset-panel__actions">
              <button
                className="app-secondary-button"
                type="button"
                onClick={() => setResetTarget(null)}
              >
                Cancelar
              </button>
              <button className="app-primary-button" disabled={saving} type="submit">
                {saving ? "Guardando…" : "Restablecer acceso"}
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}

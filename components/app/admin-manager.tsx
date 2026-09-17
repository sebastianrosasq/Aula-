"use client";

import { FormEvent, useState } from "react";
import { Building2, KeyRound, UserPlus, UserRoundCog } from "lucide-react";

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

export function AdminManager({
  institution,
  members,
  currentUserId,
}: {
  institution: Institution;
  members: Member[];
  currentUserId: string;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(endpoint: string, method: "POST" | "PATCH", payload: unknown) {
    setSaving(true);
    setNotice(null);
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setNotice(body.error ?? "No se pudo guardar el cambio.");
      return false;
    }
    window.location.reload();
    return true;
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
    });
    if (created) event.currentTarget.reset();
  }

  async function updateMember(member: Member, action: "active" | "password") {
    const temporaryPassword =
      action === "password"
        ? window.prompt("Nueva contraseña temporal (mínimo 10 caracteres):")
        : undefined;
    if (action === "password" && !temporaryPassword) return;
    await submit(
      "/api/admin/users/" + member.id,
      "PATCH",
      action === "active" ? { active: !member.active } : { temporaryPassword },
    );
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
        <form className="admin-form" onSubmit={saveInstitution}>
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
        <form className="admin-form" onSubmit={createUser}>
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
            <select name="role" defaultValue="docente">
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
              <option value="padre">Familia</option>
              <option value="admin">Administración</option>
            </select>
          </label>
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
        {notice ? (
          <p className="attendance-feedback error" role="alert">
            {notice}
          </p>
        ) : null}
        <div className="member-list">
          {members.map((member) => (
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
                  onClick={() => updateMember(member, "password")}
                  aria-label={"Restablecer contraseña de " + member.firstName}
                >
                  <KeyRound size={16} />
                </button>
                {member.id !== currentUserId ? (
                  <button type="button" onClick={() => updateMember(member, "active")}>
                    {member.active ? "Desactivar" : "Activar"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

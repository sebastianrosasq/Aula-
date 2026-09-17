import type { AppRole, SessionUser } from "@/lib/auth";

export const roleLabels: Record<AppRole, string> = {
  admin: "Administración",
  docente: "Docente",
  estudiante: "Estudiante",
  padre: "Familia",
};

export function hasRole(user: SessionUser, ...roles: AppRole[]) {
  return roles.includes(user.role);
}

export function canAccessStudent(user: SessionUser, studentId: string) {
  if (user.role === "admin") return true;
  if (user.role === "estudiante") return user.id === studentId;
  return false;
}

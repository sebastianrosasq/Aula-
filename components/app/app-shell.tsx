"use client";

import { useState } from "react";
import { BookOpenCheck, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SchoolMark } from "@/components/brand/school-mark";
import type { SessionUser } from "@/lib/auth";
import { roleLabels } from "@/lib/permissions";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/panel" ? pathname === href : pathname.startsWith(href);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setLogoutError("No se pudo cerrar la sesión. Inténtalo nuevamente.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("No se pudo conectar para cerrar la sesión. Inténtalo nuevamente.");
    } finally {
      setLoggingOut(false);
    }
  }

  const initials = (user.firstName[0] ?? "").concat(user.lastName[0] ?? "").toUpperCase();

  return (
    <div className="app-surface">
      <header className="app-header">
        <Link href="/panel" className="app-brand">
          <span className="brand-mark" aria-hidden="true">
            <SchoolMark />
          </span>
          <strong>Aula+</strong>
        </Link>
        <button
          className="app-menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={"app-nav " + (menuOpen ? "open" : "")} aria-label="Navegación del sistema">
          <Link
            className={isActive("/panel") ? "active" : ""}
            href="/panel"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            className={isActive("/panel/cursos") ? "active" : ""}
            href="/panel/cursos"
            onClick={() => setMenuOpen(false)}
          >
            <BookOpenCheck size={15} /> Cursos
          </Link>
          <Link
            className={isActive("/panel/mensajes") ? "active" : ""}
            href="/panel/mensajes"
            onClick={() => setMenuOpen(false)}
          >
            Mensajes
          </Link>
          {user.role === "admin" ? (
            <Link
              className={isActive("/panel/administracion") ? "active" : ""}
              href="/panel/administracion"
              onClick={() => setMenuOpen(false)}
            >
              Administración
            </Link>
          ) : null}
        </nav>
        <div className="app-user-menu">
          <span className="app-role">{roleLabels[user.role]}</span>
          <span className="app-avatar" aria-hidden="true">
            {initials}
          </span>
          <button className="logout-button" type="button" onClick={logout} disabled={loggingOut}>
            <LogOut /> <span>Salir</span>
          </button>
        </div>
      </header>
      {logoutError ? (
        <p className="app-shell-notice" role="alert">
          {logoutError}
        </p>
      ) : null}
      <main className="app-main">{children}</main>
    </div>
  );
}

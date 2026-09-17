"use client";

import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";
import { roleLabels } from "@/lib/permissions";

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const initials = (user.firstName[0] ?? "").concat(user.lastName[0] ?? "").toUpperCase();

  return (
    <div className="app-surface">
      <header className="app-header">
        <a href="/panel" className="app-brand">
          <span>A</span>
          <strong>AulaEnlace</strong>
        </a>
        <button
          className="app-menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={"app-nav " + (menuOpen ? "open" : "")} aria-label="Navegación del sistema">
          <a href="/panel">Inicio</a>
          <a href="/panel/mensajes">Mensajes</a>
          {user.role === "admin" ? <a href="/panel/administracion">Administración</a> : null}
        </nav>
        <div className="app-user-menu">
          <span className="app-role">{roleLabels[user.role]}</span>
          <span className="app-avatar" aria-hidden="true">
            {initials}
          </span>
          <button className="logout-button" type="button" onClick={logout}>
            <LogOut /> <span>Salir</span>
          </button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

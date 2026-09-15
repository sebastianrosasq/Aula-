"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navigation } from "@/data/content";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="AulaEnlace, ir al inicio">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>
          <span>AulaEnlace</span>
          <span className="brand-tag">Proyecto académico</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="#participar">
          Compartir opinión
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <nav className="mobile-nav" aria-label="Navegación móvil">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href="#participar" onClick={() => setOpen(false)}>
            Compartir opinión
          </a>
        </nav>
      ) : null}
    </header>
  );
}

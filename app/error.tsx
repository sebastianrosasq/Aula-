"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { SchoolMark } from "@/components/brand/school-mark";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="recovery-page">
      <section className="recovery-card">
        <span className="recovery-mark" aria-hidden="true">
          <SchoolMark />
        </span>
        <p className="app-eyebrow">Aula+</p>
        <h1>No pudimos cargar esta sección.</h1>
        <p>
          Tu información no se ha perdido. Intenta cargarla nuevamente; si el problema continúa,
          contacta a la administración.
        </p>
        <button className="app-primary-button" type="button" onClick={reset}>
          <RefreshCw aria-hidden="true" /> Reintentar
        </button>
      </section>
    </main>
  );
}

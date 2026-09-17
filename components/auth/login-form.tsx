"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "No fue posible iniciar sesión.");
      setLoading(false);
      return;
    }
    router.replace("/panel");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="auth-form">
      <div className="auth-field">
        <label htmlFor="email">Correo institucional</label>
        <span className="auth-input"><Mail aria-hidden="true" /><input id="email" name="email" type="email" autoComplete="email" required placeholder="nombre@institucion.edu.pe" /></span>
      </div>
      <div className="auth-field">
        <label htmlFor="password">Contraseña</label>
        <span className="auth-input"><LockKeyhole aria-hidden="true" /><input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required placeholder="Tu contraseña" /></span>
      </div>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button className="app-primary-button" disabled={loading} type="submit">{loading ? "Verificando acceso…" : "Ingresar a AulaEnlace"} <ArrowRight aria-hidden="true" /></button>
      <p className="auth-help">El acceso es asignado por la institución educativa. Si no puedes ingresar, contacta a la administración.</p>
    </form>
  );
}

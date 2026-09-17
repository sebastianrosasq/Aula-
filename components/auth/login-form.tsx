"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

type FieldErrors = { email?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const validation: FieldErrors = {};

    if (!email) validation.email = "Escribe tu correo institucional.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) validation.email = "Revisa el formato del correo.";
    if (!password) validation.password = "Escribe tu contraseña.";
    else if (password.length < 8) validation.password = "La contraseña debe tener al menos 8 caracteres.";

    if (Object.keys(validation).length) {
      setError("Revisa los campos marcados para continuar.");
      setFieldErrors(validation);
      (validation.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "No fue posible iniciar sesión. Inténtalo nuevamente.");
        passwordRef.current?.focus();
        return;
      }
      router.replace("/panel");
      router.refresh();
    } catch {
      setError("No se pudo conectar con Aula+. Revisa tu conexión e inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" noValidate onSubmit={onSubmit} aria-busy={loading}>
      {error ? (
        <p className="auth-error" id="login-error" role="alert">
          <CircleAlert aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <div className="auth-field">
        <label htmlFor="email">Correo institucional</label>
        <span className={"auth-input" + (fieldErrors.email ? " has-error" : "")}>
          <Mail aria-hidden="true" />
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error login-error" : "login-error"}
            onChange={() => clearFieldError("email")}
            placeholder="nombre@institucion.edu.pe"
          />
        </span>
        {fieldErrors.email ? <span className="field-error" id="email-error">{fieldErrors.email}</span> : null}
      </div>
      <div className="auth-field">
        <label htmlFor="password">Contraseña</label>
        <span className={"auth-input" + (fieldErrors.password ? " has-error" : "")}>
          <LockKeyhole aria-hidden="true" />
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error login-error" : "login-error"}
            onChange={() => clearFieldError("password")}
            placeholder="Tu contraseña"
          />
          <button
            className="auth-password-toggle"
            type="button"
            aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </span>
        {fieldErrors.password ? <span className="field-error" id="password-error">{fieldErrors.password}</span> : null}
      </div>
      <button className="app-primary-button" disabled={loading} type="submit">
        {loading ? "Verificando acceso…" : "Ingresar a Aula+"} <ArrowRight aria-hidden="true" />
      </button>
      <p className="auth-help">El acceso es asignado por la institución educativa. Si no puedes ingresar, contacta a la administración.</p>
    </form>
  );
}

import { BookOpenCheck, GraduationCap, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/panel");

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <div className="auth-intro">
          <div className="auth-brand">
            <span className="auth-brand__icon">
              <GraduationCap size={22} />
            </span>
            <span>AulaEnlace</span>
          </div>
          <div className="auth-intro__copy">
            <p className="eyebrow">Espacio institucional</p>
            <h1>Gestión académica, en un solo lugar.</h1>
            <p>
              Accede a tu información, tareas y comunicaciones según tu rol en la comunidad
              educativa.
            </p>
          </div>
          <div className="auth-intro__items" aria-label="Funciones del sistema">
            <span>
              <BookOpenCheck size={18} /> Seguimiento académico
            </span>
            <span>
              <ShieldCheck size={18} /> Acceso protegido
            </span>
          </div>
        </div>
        <section className="auth-card" aria-labelledby="login-title">
          <p className="eyebrow">Iniciar sesión</p>
          <h2 id="login-title">Bienvenido</h2>
          <p className="auth-card__intro">Ingresa con tu correo institucional.</p>
          <LoginForm />
          <p className="auth-security">
            <ShieldCheck size={15} /> Tus datos están protegidos.
          </p>
        </section>
      </section>
    </main>
  );
}

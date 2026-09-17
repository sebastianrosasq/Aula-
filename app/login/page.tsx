import { GraduationCap, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/panel");

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-brand auth-brand--login">
            <span className="auth-brand__icon">
              <GraduationCap size={22} />
            </span>
            <span>Aula+</span>
          </div>
          <p className="eyebrow">Iniciar sesión</p>
          <h1 id="login-title">Bienvenido</h1>
          <p className="auth-card__intro">Ingresa a tu espacio educativo.</p>
          <LoginForm />
          <p className="auth-security">
            <ShieldCheck size={15} /> Tus datos están protegidos.
          </p>
        </section>
      </section>
    </main>
  );
}

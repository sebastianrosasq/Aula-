import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateWithPassword, createSession, sessionCookie } from "@/lib/auth";
import { invalidRequest, requireSameOrigin } from "@/lib/http";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);

  try {
    const user = await authenticateWithPassword(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Correo o contraseña no válidos." }, { status: 401 });
    }

    const session = await createSession(user.id);
    const response = NextResponse.json({ role: user.role });
    const cookie = sessionCookie(session.token, session.expiresAt);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch {
    return NextResponse.json(
      {
        error:
          "No fue posible conectar con la base de datos. Revisa la configuración del servidor.",
      },
      { status: 503 },
    );
  }
}

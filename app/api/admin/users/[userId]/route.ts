import { and, count, eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { forbidden, invalidRequest, requireSameOrigin, unauthorized } from "@/lib/http";

const updateUserSchema = z.object({
  active: z.boolean().optional(),
  temporaryPassword: z.string().min(10).max(128).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  if (!requireSameOrigin(request)) return forbidden();
  const actor = await getSessionUser().catch(() => null);
  if (!actor) return unauthorized();
  if (actor.role !== "admin") return forbidden();

  const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);
  const { userId } = await context.params;
  const db = getDb();
  const [target] = await db
    .select({ id: users.id, role: users.role, active: users.active })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.institutionId, actor.institutionId)))
    .limit(1);
  if (!target) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

  if (parsed.data.active === false && target.role === "admin") {
    const [admins] = await db
      .select({ total: count() })
      .from(users)
      .where(
        and(
          eq(users.institutionId, actor.institutionId),
          eq(users.role, "admin"),
          eq(users.active, true),
        ),
      );
    if ((admins?.total ?? 0) <= 1) {
      return NextResponse.json(
        { error: "La institución debe conservar al menos un administrador activo." },
        { status: 409 },
      );
    }
  }

  const update: { active?: boolean; passwordHash?: string } = {};
  if (parsed.data.active !== undefined) update.active = parsed.data.active;
  if (parsed.data.temporaryPassword)
    update.passwordHash = await hash(parsed.data.temporaryPassword, 12);
  await db.update(users).set(update).where(eq(users.id, target.id));

  return NextResponse.json({ ok: true });
}

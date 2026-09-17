import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { guardianProfiles, studentProfiles, teacherProfiles, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { forbidden, invalidRequest, requireSameOrigin, unauthorized } from "@/lib/http";

const createUserSchema = z.object({
  email: z.string().trim().email().max(190),
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(120),
  role: z.enum(["docente", "estudiante", "padre"]),
  temporaryPassword: z.string().min(10).max(128),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return forbidden();
  const actor = await getSessionUser().catch(() => null);
  if (!actor) return unauthorized();
  if (actor.role !== "admin") return forbidden();

  const parsed = createUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);

  const db = getDb();
  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing)
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });

  const id = randomUUID();
  const passwordHash = await hash(parsed.data.temporaryPassword, 12);

  await db.transaction(async (transaction) => {
    await transaction.insert(users).values({
      id,
      institutionId: actor.institutionId,
      email,
      passwordHash,
      role: parsed.data.role,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      active: true,
    });

    if (parsed.data.role === "docente") {
      await transaction.insert(teacherProfiles).values({ userId: id });
    }
    if (parsed.data.role === "estudiante") {
      await transaction.insert(studentProfiles).values({
        userId: id,
        studentCode: "AE-" + id.slice(0, 8).toUpperCase(),
        active: true,
      });
    }
    if (parsed.data.role === "padre") {
      await transaction.insert(guardianProfiles).values({ userId: id });
    }
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { forbidden, invalidRequest, requireSameOrigin, unauthorized } from "@/lib/http";

const institutionSchema = z.object({
  name: z.string().trim().min(3).max(180),
  modularCode: z.string().trim().max(30).nullable(),
});

export async function PATCH(request: Request) {
  if (!requireSameOrigin(request)) return forbidden();
  const user = await getSessionUser().catch(() => null);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  const parsed = institutionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);

  await getDb()
    .update(institutions)
    .set({
      name: parsed.data.name,
      modularCode: parsed.data.modularCode || null,
    })
    .where(eq(institutions.id, user.institutionId));

  return NextResponse.json({ ok: true });
}

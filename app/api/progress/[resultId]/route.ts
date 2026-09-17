import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { competencyResults, evaluations, teacherAssignments } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { forbidden, invalidRequest, requireSameOrigin, unauthorized } from "@/lib/http";

const payloadSchema = z.object({
  level: z.enum(["AD", "A", "B", "C"]),
  observation: z.string().trim().max(700),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ resultId: string }> }) {
  if (!requireSameOrigin(request)) return forbidden();
  const user = await getSessionUser().catch(() => null);
  if (!user) return unauthorized();
  if (user.role !== "docente") return forbidden();
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);
  const { resultId } = await params;
  const [owned] = await getDb()
    .select({ id: competencyResults.id })
    .from(competencyResults)
    .innerJoin(evaluations, eq(evaluations.id, competencyResults.evaluationId))
    .innerJoin(teacherAssignments, eq(teacherAssignments.id, evaluations.assignmentId))
    .where(and(eq(competencyResults.id, resultId), eq(teacherAssignments.teacherId, user.id)))
    .limit(1);
  if (!owned) return forbidden();
  await getDb().update(competencyResults).set(parsed.data).where(eq(competencyResults.id, resultId));
  return NextResponse.json({ ok: true });
}

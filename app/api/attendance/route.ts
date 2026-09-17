import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { attendanceRecords, teacherAssignments } from "@/db/schema";
import { createAbsenceNotifications } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { forbidden, invalidRequest, requireSameOrigin, unauthorized } from "@/lib/http";

const attendanceSchema = z.object({
  classroomId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: z.enum(["presente", "tardanza", "ausente", "justificado"]),
        note: z.string().trim().max(500).optional(),
      }),
    )
    .min(1)
    .max(80),
});

export async function PUT(request: Request) {
  if (!requireSameOrigin(request)) return forbidden();
  const user = await getSessionUser().catch(() => null);
  if (!user) return unauthorized();
  if (user.role !== "docente" && user.role !== "admin") return forbidden();

  const parsed = attendanceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);

  const { classroomId, date, records } = parsed.data;
  const db = getDb();

  if (user.role === "docente") {
    const [assignment] = await db
      .select({ id: teacherAssignments.id })
      .from(teacherAssignments)
      .where(
        and(
          eq(teacherAssignments.teacherId, user.id),
          eq(teacherAssignments.classroomId, classroomId),
          eq(teacherAssignments.active, true),
        ),
      )
      .limit(1);
    if (!assignment) return forbidden();
  }

  const existing = await db
    .select({ studentId: attendanceRecords.studentId, status: attendanceRecords.status })
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.classroomId, classroomId),
        eq(attendanceRecords.attendanceDate, date),
        inArray(
          attendanceRecords.studentId,
          records.map((record) => record.studentId),
        ),
      ),
    );
  const previousStatus = new Map(existing.map((record) => [record.studentId, record.status]));

  await db.transaction(async (transaction) => {
    for (const record of records) {
      await transaction
        .insert(attendanceRecords)
        .values({
          id: crypto.randomUUID(),
          classroomId,
          studentId: record.studentId,
          recordedById: user.id,
          attendanceDate: date,
          status: record.status,
          note: record.note || null,
        })
        .onDuplicateKeyUpdate({
          set: {
            status: record.status,
            note: record.note || null,
            recordedById: user.id,
            updatedAt: new Date(),
          },
        });
    }
  });

  const newAbsences = records.filter(
    (record) => record.status === "ausente" && previousStatus.get(record.studentId) !== "ausente",
  );
  await Promise.all(
    newAbsences.map((record) => createAbsenceNotifications(record.studentId, user.id, date)),
  );

  return NextResponse.json({ saved: records.length, notificationsCreated: newAbsences.length });
}

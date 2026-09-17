import { config } from "dotenv";
import { hash } from "bcryptjs";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schema";

config({ path: ".env.local" });

if (process.env.NODE_ENV === "production") {
  throw new Error("Las cuentas de demostración no se pueden crear en producción.");
}

const required = ["DATABASE_HOST", "DATABASE_USER", "DATABASE_PASSWORD", "DATABASE_NAME"] as const;
for (const key of required) {
  if (!process.env[key]) throw new Error(key + " no está configurado en .env.local.");
}

const ids = {
  institution: "00000000-0000-4000-8000-000000000001",
  admin: "00000000-0000-4000-8000-000000000010",
  teacher: "00000000-0000-4000-8000-000000000011",
  student: "00000000-0000-4000-8000-000000000012",
  guardian: "00000000-0000-4000-8000-000000000013",
  classroom: "00000000-0000-4000-8000-000000000020",
  subject: "00000000-0000-4000-8000-000000000021",
  assignment: "00000000-0000-4000-8000-000000000022",
  competency: "00000000-0000-4000-8000-000000000023",
  enrollment: "00000000-0000-4000-8000-000000000024",
  guardianStudent: "00000000-0000-4000-8000-000000000025",
  evaluation: "00000000-0000-4000-8000-000000000026",
  result: "00000000-0000-4000-8000-000000000027",
  attendance: "00000000-0000-4000-8000-000000000028",
} as const;

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
const db = drizzle(pool, { schema, mode: "default" });
const passwordHash = await hash("AulaEnlace2026!", 12);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

await db
  .insert(schema.institutions)
  .values({ id: ids.institution, name: "Institución Demo AulaEnlace", modularCode: "DEMO-2026" })
  .onDuplicateKeyUpdate({ set: { name: "Institución Demo AulaEnlace", active: true } });

const demoUsers = [
  {
    id: ids.admin,
    email: "admin@aulaenlace.demo",
    role: "admin" as const,
    firstName: "Andrea",
    lastName: "Ramos",
  },
  {
    id: ids.teacher,
    email: "docente@aulaenlace.demo",
    role: "docente" as const,
    firstName: "Elena",
    lastName: "Paredes",
  },
  {
    id: ids.student,
    email: "estudiante@aulaenlace.demo",
    role: "estudiante" as const,
    firstName: "Mateo",
    lastName: "Torres",
  },
  {
    id: ids.guardian,
    email: "padre@aulaenlace.demo",
    role: "padre" as const,
    firstName: "Lucía",
    lastName: "Torres",
  },
];

for (const user of demoUsers) {
  await db
    .insert(schema.users)
    .values({ ...user, institutionId: ids.institution, passwordHash, active: true })
    .onDuplicateKeyUpdate({
      set: {
        passwordHash,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        active: true,
      },
    });
}

await db
  .insert(schema.teacherProfiles)
  .values({ userId: ids.teacher, specialty: "Comunicación" })
  .onDuplicateKeyUpdate({ set: { specialty: "Comunicación" } });
await db
  .insert(schema.studentProfiles)
  .values({ userId: ids.student, studentCode: "DEMO-EST-001", active: true })
  .onDuplicateKeyUpdate({ set: { active: true } });
await db
  .insert(schema.guardianProfiles)
  .values({ userId: ids.guardian })
  .onDuplicateKeyUpdate({ set: { phone: null } });
await db
  .insert(schema.classrooms)
  .values({
    id: ids.classroom,
    institutionId: ids.institution,
    name: "5.º B",
    grade: "5.º",
    section: "B",
    academicYear: 2026,
    active: true,
  })
  .onDuplicateKeyUpdate({ set: { name: "5.º B", active: true } });
await db
  .insert(schema.subjects)
  .values({
    id: ids.subject,
    institutionId: ids.institution,
    name: "Comunicación",
    color: "#176B63",
    active: true,
  })
  .onDuplicateKeyUpdate({ set: { name: "Comunicación", active: true } });
await db
  .insert(schema.teacherAssignments)
  .values({
    id: ids.assignment,
    teacherId: ids.teacher,
    classroomId: ids.classroom,
    subjectId: ids.subject,
    active: true,
  })
  .onDuplicateKeyUpdate({ set: { active: true } });
await db
  .insert(schema.enrollments)
  .values({ id: ids.enrollment, studentId: ids.student, classroomId: ids.classroom, active: true })
  .onDuplicateKeyUpdate({ set: { active: true } });
await db
  .insert(schema.guardianStudents)
  .values({
    id: ids.guardianStudent,
    guardianId: ids.guardian,
    studentId: ids.student,
    relationship: "Madre",
    primaryContact: true,
  })
  .onDuplicateKeyUpdate({ set: { relationship: "Madre", primaryContact: true } });
await db
  .insert(schema.competencies)
  .values({
    id: ids.competency,
    subjectId: ids.subject,
    name: "Lee diversos tipos de textos escritos",
    active: true,
  })
  .onDuplicateKeyUpdate({ set: { active: true } });
await db
  .insert(schema.evaluations)
  .values({
    id: ids.evaluation,
    assignmentId: ids.assignment,
    competencyId: ids.competency,
    title: "Comprensión lectora",
    evaluationDate: today,
    createdById: ids.teacher,
  })
  .onDuplicateKeyUpdate({ set: { title: "Comprensión lectora", evaluationDate: today } });
await db
  .insert(schema.competencyResults)
  .values({
    id: ids.result,
    evaluationId: ids.evaluation,
    studentId: ids.student,
    level: "A",
    observation: "Demuestra comprensión de ideas principales.",
  })
  .onDuplicateKeyUpdate({
    set: { level: "A", observation: "Demuestra comprensión de ideas principales." },
  });
await db
  .insert(schema.attendanceRecords)
  .values({
    id: ids.attendance,
    classroomId: ids.classroom,
    studentId: ids.student,
    recordedById: ids.teacher,
    attendanceDate: today,
    status: "presente",
  })
  .onDuplicateKeyUpdate({ set: { status: "presente", recordedById: ids.teacher } });

for (let day = 1; day <= 7; day += 1) {
  const slotId = "00000000-0000-4000-8000-0000000000" + String(30 + day);
  await db
    .insert(schema.scheduleSlots)
    .values({
      id: slotId,
      assignmentId: ids.assignment,
      dayOfWeek: day,
      startsAt: "00:00:00",
      endsAt: "23:59:00",
      room: "Aula 5B",
    })
    .onDuplicateKeyUpdate({ set: { startsAt: "00:00:00", endsAt: "23:59:00", room: "Aula 5B" } });
}

await pool.end();
console.log("Cuentas de demostración creadas o actualizadas.");

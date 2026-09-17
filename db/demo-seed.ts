import { config } from "dotenv";
import { hash } from "bcryptjs";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { inArray } from "drizzle-orm";

import * as schema from "./schema";

config({ path: ".env.local" });

if (process.env.NODE_ENV === "production") {
  throw new Error("Las cuentas de demostración no se pueden crear en producción.");
}

for (const key of ["DATABASE_HOST", "DATABASE_USER", "DATABASE_PASSWORD", "DATABASE_NAME"] as const) {
  if (!process.env[key]) throw new Error(`${key} no está configurado en .env.local.`);
}

const root = {
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

const id = (number: number) => `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const password = "AulaEnlace2026!";
const year = 2026;
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});
const db = drizzle(pool, { schema, mode: "default" });
const passwordHash = await hash(password, 12);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Lima",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const subjects = [
  ["comunicacion", "Comunicación", "#176B63", "Se comunica oralmente en su lengua materna", ["primaria", "secundaria"]],
  ["matematica", "Matemática", "#3563B5", "Resuelve problemas de cantidad", ["primaria", "secundaria"]],
  ["ciencia", "Ciencia y Tecnología", "#0E8D7A", "Indaga mediante métodos científicos para construir conocimientos", ["primaria", "secundaria"]],
  ["arte", "Arte y Cultura", "#9B59B6", "Crea proyectos desde los lenguajes artísticos", ["primaria", "secundaria"]],
  ["fisica", "Educación Física", "#D16B28", "Asume una vida saludable", ["primaria", "secundaria"]],
  ["ingles", "Inglés", "#6B50B8", "Se comunica oralmente en inglés como lengua extranjera", ["primaria", "secundaria"]],
  ["religion", "Educación Religiosa", "#A36A13", "Construye su identidad como persona humana, amada por Dios", ["primaria", "secundaria"]],
  ["personal", "Personal Social", "#B14D60", "Construye su identidad", ["primaria"]],
  ["sociales", "Ciencias Sociales", "#B14D60", "Construye interpretaciones históricas", ["secundaria"]],
  ["dpcc", "Desarrollo Personal, Ciudadanía y Cívica", "#A34876", "Convive y participa democráticamente", ["secundaria"]],
  ["trabajo", "Educación para el Trabajo", "#467C53", "Gestiona proyectos de emprendimiento económico o social", ["secundaria"]],
] as const;

const teachers = [
  ["Elena", "Paredes"], ["Ricardo", "Salazar"], ["Carla", "Mendoza"], ["Valeria", "Quispe"],
  ["Jorge", "Vílchez"], ["Paola", "García"], ["María", "Rojas"], ["Diego", "Huamán"],
  ["Natalia", "Cruz"], ["Sofía", "Flores"], ["Luis", "Cáceres"],
] as const;
const names = ["Ana", "Bruno", "Camila", "Diego", "Emilia", "Fabio", "Gabriela", "Hugo", "Isabela", "Joaquín", "Kiara", "Leonardo"];
const surnames = ["Torres", "Chávez", "López", "Mamani", "Ríos", "Gómez", "Paredes", "Soto", "Vargas", "Castillo", "Núñez", "Medina"];
const guardianNames = ["Rosa", "Carlos", "Mónica", "Juan", "Patricia", "Miguel", "Teresa", "Óscar", "Claudia", "Renzo", "Lorena", "Víctor"];

type Classroom = { id: string; stage: "primaria" | "secundaria"; grade: string; section: "A" | "B"; name: string };
const classrooms: Classroom[] = (["primaria", "secundaria"] as const).flatMap((stage) =>
  Array.from({ length: stage === "primaria" ? 6 : 5 }, (_, number) =>
    (["A", "B"] as const).map((section) => {
      const grade = number + 1;
      const existing = stage === "primaria" && grade === 5 && section === "B";
      const index = (stage === "primaria" ? 0 : 12) + number * 2 + (section === "B" ? 1 : 0);
      const label = `${grade}.º ${stage === "primaria" ? "Primaria" : "Secundaria"}`;
      return { id: existing ? root.classroom : id(100 + index), stage, grade: label, section, name: `${label} ${section}` };
    }),
  ).flat(),
);

await db.insert(schema.institutions).values({ id: root.institution, name: "Institución Demo Aula+", modularCode: "DEMO-2026" }).onDuplicateKeyUpdate({ set: { name: "Institución Demo Aula+", active: true } });
const retiredClassroomIds = [id(122), id(123)];
const retiredUserIds = [...Array.from({ length: 6 }, (_, index) => id(5066 + index)), ...Array.from({ length: 6 }, (_, index) => id(6066 + index))];
await db.update(schema.classrooms).set({ active: false }).where(inArray(schema.classrooms.id, retiredClassroomIds));
await db.update(schema.enrollments).set({ active: false }).where(inArray(schema.enrollments.classroomId, retiredClassroomIds));
await db.update(schema.users).set({ active: false }).where(inArray(schema.users.id, retiredUserIds));
await db.insert(schema.users).values({ id: root.admin, institutionId: root.institution, email: "admin@aulaenlace.demo", passwordHash, role: "admin", firstName: "Andrea", lastName: "Ramos", active: true }).onDuplicateKeyUpdate({ set: { passwordHash, active: true } });

const subjectId = new Map<string, string>();
const teacherId = new Map<string, string>();
for (const [index, subject] of subjects.entries()) {
  const [key, subjectName, color, competency] = subject;
  const currentSubjectId = key === "comunicacion" ? root.subject : id(200 + index);
  const currentTeacherId = key === "comunicacion" ? root.teacher : id(300 + index);
  subjectId.set(key, currentSubjectId);
  teacherId.set(key, currentTeacherId);
  const [firstName, lastName] = teachers[index];
  await db.insert(schema.users).values({ id: currentTeacherId, institutionId: root.institution, email: key === "comunicacion" ? "docente@aulaenlace.demo" : `prof.${key}@aulaenlace.demo`, passwordHash, role: "docente", firstName, lastName, active: true }).onDuplicateKeyUpdate({ set: { passwordHash, active: true } });
  await db.insert(schema.teacherProfiles).values({ userId: currentTeacherId, specialty: subjectName }).onDuplicateKeyUpdate({ set: { specialty: subjectName } });
  await db.insert(schema.subjects).values({ id: currentSubjectId, institutionId: root.institution, name: subjectName, color, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
  await db.insert(schema.competencies).values({ id: key === "comunicacion" ? root.competency : id(400 + index), subjectId: currentSubjectId, name: competency, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
}

const assignmentByClassSubject = new Map<string, { id: string; teacherId: string; subjectId: string }>();
for (const [classIndex, classroom] of classrooms.entries()) {
  await db.insert(schema.classrooms).values({ id: classroom.id, institutionId: root.institution, name: classroom.name, grade: classroom.grade, section: classroom.section, academicYear: year, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
  let subjectIndex = 0;
  for (const subject of subjects) {
    const [key, , , , stages] = subject;
    if (!(stages as readonly string[]).includes(classroom.stage)) continue;
    const original = classroom.id === root.classroom && key === "comunicacion";
    const assignmentId = original ? root.assignment : id(1000 + classIndex * 16 + subjectIndex);
    const subjectRef = subjectId.get(key)!;
    const teacherRef = teacherId.get(key)!;
    assignmentByClassSubject.set(`${classroom.id}:${key}`, { id: assignmentId, teacherId: teacherRef, subjectId: subjectRef });
    await db.insert(schema.teacherAssignments).values({ id: assignmentId, teacherId: teacherRef, classroomId: classroom.id, subjectId: subjectRef, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
    if (!original) {
      const lessonDay = (classIndex % 5) + 1;
      const lessonHour = 8 + Math.floor(classIndex / 5);
      const startsAt = `${String(lessonHour).padStart(2, "0")}:00:00`;
      const endsAt = `${String(lessonHour + 1).padStart(2, "0")}:00:00`;
      await db.insert(schema.scheduleSlots).values({ id: id(2000 + classIndex * 16 + subjectIndex), assignmentId, dayOfWeek: lessonDay, startsAt, endsAt, room: `Aula ${classroom.name}` }).onDuplicateKeyUpdate({ set: { dayOfWeek: lessonDay, startsAt, endsAt, room: `Aula ${classroom.name}` } });
    }
    subjectIndex += 1;
  }
}

let studentIndex = 0;
for (const [classIndex, classroom] of classrooms.entries()) {
  const courseSubjects = subjects
    .map((subject, subjectIndex) => ({ subject, subjectIndex }))
    .filter(({ subject }) => (subject[4] as readonly string[]).includes(classroom.stage));
  const assessmentBySubject = new Map<string, { evaluationId: string; assignmentId: string; competencyId: string; teacherId: string; subjectName: string }>();
  for (const { subject, subjectIndex } of courseSubjects) {
    const [key, subjectName] = subject;
    const assignment = assignmentByClassSubject.get(`${classroom.id}:${key}`)!;
    const originalEvaluation = classroom.id === root.classroom && key === "comunicacion";
    const evaluationId = originalEvaluation ? root.evaluation : id(11000 + classIndex * 16 + subjectIndex);
    const competencyId = key === "comunicacion" ? root.competency : id(400 + subjectIndex);
    await db.insert(schema.evaluations).values({ id: evaluationId, assignmentId: assignment.id, competencyId, title: originalEvaluation ? "Comprensión lectora" : `Actividad inicial · ${subjectName}`, evaluationDate: today, createdById: assignment.teacherId }).onDuplicateKeyUpdate({ set: { title: originalEvaluation ? "Comprensión lectora" : `Actividad inicial · ${subjectName}`, evaluationDate: today } });
    assessmentBySubject.set(key, { evaluationId, assignmentId: assignment.id, competencyId, teacherId: assignment.teacherId, subjectName });
  }
  const attendanceCourseKey = classroom.stage === "primaria" ? "comunicacion" : "matematica";
  const attendanceCourse = assessmentBySubject.get(attendanceCourseKey)!;
  const originalClass = classroom.id === root.classroom;
  for (let seat = 0; seat < 3; seat += 1) {
    const original = originalClass && seat === 0;
    const currentStudentId = original ? root.student : id(5000 + studentIndex);
    const currentGuardianId = original ? root.guardian : id(6000 + studentIndex);
    const firstName = original ? "Mateo" : names[studentIndex % names.length];
    const lastName = original ? "Torres" : surnames[(studentIndex * 3 + 1) % surnames.length];
    const guardianFirstName = original ? "Lucía" : guardianNames[studentIndex % guardianNames.length];
    const number = String(studentIndex + 1).padStart(3, "0");
    await db.insert(schema.users).values({ id: currentStudentId, institutionId: root.institution, email: original ? "estudiante@aulaenlace.demo" : `estudiante.${number}@aulaenlace.demo`, passwordHash, role: "estudiante", firstName, lastName, active: true }).onDuplicateKeyUpdate({ set: { passwordHash, active: true } });
    await db.insert(schema.users).values({ id: currentGuardianId, institutionId: root.institution, email: original ? "padre@aulaenlace.demo" : `familia.${number}@aulaenlace.demo`, passwordHash, role: "padre", firstName: guardianFirstName, lastName, active: true }).onDuplicateKeyUpdate({ set: { passwordHash, active: true } });
    await db.insert(schema.studentProfiles).values({ userId: currentStudentId, studentCode: original ? "DEMO-EST-001" : `AULA-2026-${number}`, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
    await db.insert(schema.guardianProfiles).values({ userId: currentGuardianId }).onDuplicateKeyUpdate({ set: { phone: null } });
    await db.insert(schema.enrollments).values({ id: original ? root.enrollment : id(7000 + studentIndex), studentId: currentStudentId, classroomId: classroom.id, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
    await db.insert(schema.guardianStudents).values({ id: original ? root.guardianStudent : id(8000 + studentIndex), guardianId: currentGuardianId, studentId: currentStudentId, relationship: studentIndex % 2 ? "Padre" : "Madre", primaryContact: true }).onDuplicateKeyUpdate({ set: { primaryContact: true } });
    for (const { subject, subjectIndex } of courseSubjects) {
      const [key] = subject;
      const assessment = assessmentBySubject.get(key)!;
      const isOriginalResult = original && key === "comunicacion";
      const resultId = isOriginalResult ? root.result : key === attendanceCourseKey ? id(9000 + studentIndex) : id(12000 + studentIndex * 16 + subjectIndex);
      await db.insert(schema.competencyResults).values({ id: resultId, evaluationId: assessment.evaluationId, studentId: currentStudentId, level: (["AD", "A", "A", "B", "C"] as const)[(studentIndex + subjectIndex) % 5], observation: `Registro de demostración para ${assessment.subjectName}.` }).onDuplicateKeyUpdate({ set: { observation: `Registro de demostración para ${assessment.subjectName}.` } });
    }
    await db.insert(schema.attendanceRecords).values({ id: original ? root.attendance : id(10000 + studentIndex), classroomId: classroom.id, studentId: currentStudentId, recordedById: attendanceCourse.teacherId, attendanceDate: today, status: (["presente", "presente", "tardanza", "presente", "ausente"] as const)[studentIndex % 5] }).onDuplicateKeyUpdate({ set: { status: "presente" } });
    studentIndex += 1;
  }
}

await pool.end();
console.log(`Datos listos: ${classrooms.length} secciones, ${studentIndex} estudiantes, ${studentIndex} familias y ${subjects.length} docentes. Contraseña común: ${password}`);

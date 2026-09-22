"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, MessageSquareText, UsersRound } from "lucide-react";

import type { CourseCatalogItem, CourseRole } from "@/lib/course-types";

type Role = CourseRole;

const roleCopy: Record<Role, { eyebrow: string; title: string; description: string }> = {
  docente: {
    eyebrow: "Docencia",
    title: "Mis cursos",
    description:
      "Cada curso combina una materia con una sección. Filtra para cambiar de grado y aula sin perder contexto.",
  },
  estudiante: {
    eyebrow: "Aprendizaje",
    title: "Mis cursos",
    description:
      "Aquí ves las materias de tu aula, el docente responsable y tu último avance por competencia.",
  },
  padre: {
    eyebrow: "Familia",
    title: "Cursos de mis hijos",
    description:
      "Revisa cada curso con su docente responsable y el avance más reciente de tu estudiante.",
  },
  admin: {
    eyebrow: "Gestión académica",
    title: "Oferta de cursos",
    description:
      "Consulta la distribución real de materias, secciones, docentes y estudiantes activos.",
  },
};

function levelLabel(level: CourseCatalogItem["latestLevel"]) {
  if (!level) return "Aún sin evaluación";
  return `Último avance: ${level}`;
}

export function CourseCatalog({ role, courses }: { role: Role; courses: CourseCatalogItem[] }) {
  const [classroomId, setClassroomId] = useState("all");
  const [studentId, setStudentId] = useState("all");
  const copy = roleCopy[role];
  const classrooms = useMemo(
    () => [...new Map(courses.map((course) => [course.classroomId, course])).values()],
    [courses],
  );
  const students = useMemo(
    () => [
      ...new Map(
        courses
          .filter((course) => course.studentId && course.studentName)
          .map((course) => [course.studentId!, course.studentName!]),
      ).entries(),
    ],
    [courses],
  );
  const visibleCourses = courses.filter(
    (course) =>
      (classroomId === "all" || course.classroomId === classroomId) &&
      (studentId === "all" || course.studentId === studentId),
  );

  return (
    <>
      <header className="dashboard-welcome dashboard-welcome--compact">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>

      <section className="course-toolbar" aria-label="Filtros de cursos">
        {students.length > 1 ? (
          <label>
            Estudiante
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="all">Todos los estudiantes</option>
              {students.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {classrooms.length > 1 ? (
          <label>
            Sección
            <select value={classroomId} onChange={(event) => setClassroomId(event.target.value)}>
              <option value="all">Todas las secciones</option>
              {classrooms.map((course) => (
                <option key={course.classroomId} value={course.classroomId}>
                  {course.classroomName}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <p>
          {visibleCourses.length}{" "}
          {visibleCourses.length === 1 ? "curso visible" : "cursos visibles"}
        </p>
      </section>

      {visibleCourses.length ? (
        <section className="course-grid" aria-label="Cursos">
          {visibleCourses.map((course) => (
            <article
              className="course-card"
              key={`${course.assignmentId}:${course.studentId ?? "institution"}`}
            >
              <span
                className="course-card__color"
                style={{ background: course.subjectColor }}
                aria-hidden="true"
              />
              <div className="course-card__topline">
                <span>{course.subjectName}</span>
                {course.latestLevel ? (
                  <strong className={`course-level course-level--${course.latestLevel}`}>
                    {course.latestLevel}
                  </strong>
                ) : null}
              </div>
              <h2>{course.classroomName}</h2>
              {course.studentName ? (
                <p className="course-card__student">Estudiante: {course.studentName}</p>
              ) : null}
              <dl>
                <div>
                  <dt>Docente responsable</dt>
                  <dd>{course.teacherName}</dd>
                </div>
                {role === "docente" || role === "admin" ? (
                  <div>
                    <dt>Estudiantes activos</dt>
                    <dd>{course.studentsCount}</dd>
                  </div>
                ) : (
                  <div>
                    <dt>Seguimiento</dt>
                    <dd>{levelLabel(course.latestLevel)}</dd>
                  </div>
                )}
              </dl>
              {role === "docente" ? (
                <Link
                  className="course-card__action"
                  href={`/panel/asistencia?classroomId=${course.classroomId}`}
                >
                  <UsersRound size={16} /> Tomar asistencia
                </Link>
              ) : (
                <Link
                  className="course-card__action"
                  href={`/panel/mensajes?recipientId=${course.teacherId}`}
                >
                  <MessageSquareText size={16} /> Escribir al docente
                </Link>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="inline-notice">
          <BookOpenCheck size={22} />
          <p>No hay cursos que coincidan con este filtro.</p>
        </section>
      )}
    </>
  );
}

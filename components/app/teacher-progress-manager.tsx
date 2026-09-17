"use client";

import { useMemo, useState } from "react";
import { Check, Save } from "lucide-react";

type ProgressRow = {
  resultId: string;
  assignmentId: string;
  subjectName: string;
  classroomName: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  evaluationTitle: string;
  level: "AD" | "A" | "B" | "C";
  observation: string | null;
};

export function TeacherProgressManager({ initialRows }: { initialRows: ProgressRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [assignmentId, setAssignmentId] = useState(initialRows[0]?.assignmentId ?? "");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const courses = useMemo(
    () => [...new Map(rows.map((row) => [row.assignmentId, row])).values()],
    [rows],
  );
  const visible = rows.filter((row) => row.assignmentId === assignmentId);

  function updateLocal(resultId: string, field: "level" | "observation", value: string) {
    setRows((current) =>
      current.map((row) => (row.resultId === resultId ? { ...row, [field]: value } : row)),
    );
    setSavedId(null);
  }

  async function save(row: ProgressRow) {
    setSavingId(row.resultId);
    setSavedId(null);
    const response = await fetch(`/api/progress/${row.resultId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: row.level, observation: row.observation ?? "" }),
    }).catch(() => null);
    setSavingId(null);
    if (response?.ok) setSavedId(row.resultId);
  }

  if (!initialRows.length) return null;
  return (
    <section className="progress-manager">
      <div className="progress-manager__heading">
        <div><p className="eyebrow">Evaluación</p><h2>Actualizar desempeño</h2><p>Los cambios se reflejan en los paneles del alumno y su familia.</p></div>
        <label>Curso<select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}>{courses.map((course) => <option value={course.assignmentId} key={course.assignmentId}>{course.subjectName} · {course.classroomName}</option>)}</select></label>
      </div>
      <div className="progress-manager__list">
        {visible.map((row) => (
          <article key={row.resultId}>
            <div className="student-initial">{row.studentFirstName[0]}{row.studentLastName[0]}</div>
            <div className="progress-manager__student"><strong>{row.studentLastName}, {row.studentFirstName}</strong><span>{row.evaluationTitle}</span></div>
            <select aria-label={`Nivel de ${row.studentFirstName}`} value={row.level} onChange={(event) => updateLocal(row.resultId, "level", event.target.value)}><option>AD</option><option>A</option><option>B</option><option>C</option></select>
            <input aria-label={`Observación de ${row.studentFirstName}`} value={row.observation ?? ""} onChange={(event) => updateLocal(row.resultId, "observation", event.target.value)} placeholder="Observación breve" />
            <button type="button" onClick={() => save(row)} disabled={savingId === row.resultId}>{savedId === row.resultId ? <Check /> : <Save />}{savingId === row.resultId ? "Guardando…" : savedId === row.resultId ? "Guardado" : "Guardar"}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Clock3, Save, Search, UserX } from "lucide-react";

type AttendanceStatus = "presente" | "tardanza" | "ausente" | "justificado";
type Student = {
  studentId: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus | null;
  note: string | null;
};

export function AttendanceBoard({
  classroomId,
  classroomLabel,
  date,
  students,
}: {
  classroomId: string;
  classroomLabel: string;
  date: string;
  students: Student[];
}) {
  const [records, setRecords] = useState(
    () => new Map(students.map((student) => [student.studentId, student.status ?? "presente"])),
  );
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const visibleStudents = useMemo(
    () =>
      students.filter((student) =>
        (student.firstName + " " + student.lastName).toLowerCase().includes(query.toLowerCase()),
      ),
    [students, query],
  );
  const counts = useMemo(
    () =>
      Array.from(records.values()).reduce<Record<AttendanceStatus, number>>(
        (summary, status) => ({ ...summary, [status]: summary[status] + 1 }),
        { presente: 0, tardanza: 0, ausente: 0, justificado: 0 },
      ),
    [records],
  );

  function setStatus(studentId: string, status: AttendanceStatus) {
    setRecords((current) => new Map(current).set(studentId, status));
    setFeedback(null);
  }

  async function save() {
    setSaving(true);
    setFeedback(null);
    const response = await fetch("/api/attendance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classroomId,
        date,
        records: students.map((student) => ({
          studentId: student.studentId,
          status: records.get(student.studentId) ?? "presente",
        })),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      saved?: number;
      notificationsCreated?: number;
    };
    setSaving(false);
    setFeedback(
      response.ok
        ? "Asistencia guardada para " +
            body.saved +
            " estudiantes." +
            (body.notificationsCreated
              ? " Se notificó a " + body.notificationsCreated + " familia(s)."
              : "")
        : (body.error ?? "No se pudo guardar la asistencia."),
    );
  }

  return (
    <section className="attendance-workspace">
      <div className="attendance-topline">
        <div>
          <p className="app-eyebrow">Asistencia de clase</p>
          <h1>{classroomLabel}</h1>
          <p>{date}</p>
        </div>
        <div className="attendance-summary">
          <span>
            <Check />
            {counts.presente} presentes
          </span>
          <span>
            <Clock3 />
            {counts.tardanza} tardanzas
          </span>
          <span>
            <UserX />
            {counts.ausente} ausencias
          </span>
        </div>
      </div>
      <div className="attendance-toolbar">
        <label className="app-search">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar estudiante"
            aria-label="Buscar estudiante"
          />
        </label>
        <button className="app-primary-button" type="button" disabled={saving} onClick={save}>
          <Save />
          {saving ? "Guardando…" : "Guardar asistencia"}
        </button>
      </div>
      {feedback ? (
        <p
          className={
            "attendance-feedback " + (feedback.startsWith("Asistencia") ? "success" : "error")
          }
          role="status"
        >
          {feedback}
        </p>
      ) : null}
      <div className="attendance-list">
        {visibleStudents.map((student) => (
          <article key={student.studentId} className="attendance-row">
            <span className="student-initial">
              {(student.firstName[0] ?? "").concat(student.lastName[0] ?? "")}
            </span>
            <strong>
              {student.lastName}, {student.firstName}
            </strong>
            <div
              className="status-controls"
              aria-label={"Asistencia de " + student.firstName + " " + student.lastName}
            >
              {(
                [
                  ["presente", "Presente"],
                  ["tardanza", "Tardanza"],
                  ["ausente", "Ausente"],
                  ["justificado", "Justificado"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    "status-" +
                    value +
                    (records.get(student.studentId) === value ? " selected" : "")
                  }
                  onClick={() => setStatus(student.studentId, value)}
                  aria-pressed={records.get(student.studentId) === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

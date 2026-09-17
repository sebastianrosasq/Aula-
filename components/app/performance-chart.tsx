"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const points = { AD: 4, A: 3, B: 2, C: 1 } as const;
const labels = { 4: "AD · destacado", 3: "A · logrado", 2: "B · en proceso", 1: "C · inicio" } as const;

export function PerformanceChart({
  progress,
}: {
  progress: Array<{ subjectName: string; level: "AD" | "A" | "B" | "C" }>;
}) {
  const bySubject = new Map<string, "AD" | "A" | "B" | "C">();
  progress.forEach((item) => {
    if (!bySubject.has(item.subjectName)) bySubject.set(item.subjectName, item.level);
  });
  const data = [...bySubject.entries()].slice(0, 8).map(([subject, level]) => ({
    subject: subject.length > 15 ? `${subject.slice(0, 14)}…` : subject,
    fullSubject: subject,
    level,
    score: points[level],
  }));
  if (!data.length) return <p className="dashboard-card__body">Aún no hay evaluaciones publicadas.</p>;

  return (
    <div className="performance-chart" role="img" aria-label="Gráfico de desempeño por curso">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 6 }}>
          <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#60737c" }} interval={0} angle={-22} textAnchor="end" height={58} />
          <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tickFormatter={(value) => ["", "C", "B", "A", "AD"][value]} tick={{ fontSize: 11, fill: "#60737c" }} />
          <Tooltip formatter={(value) => labels[value as keyof typeof labels]} labelFormatter={(_, entries) => entries[0]?.payload.fullSubject} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((item) => <Cell key={item.subject} fill={item.score >= 3 ? "#176b63" : item.score === 2 ? "#d29234" : "#b24750"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

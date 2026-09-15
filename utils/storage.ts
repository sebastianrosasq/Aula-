import type { FeedbackEntry, FeatureId } from "@/types";

export const STORAGE_KEYS = {
  votes: "aulaenlace:votes",
  feedback: "aulaenlace:feedback",
} as const;

export const emptyVotes: Record<FeatureId, number> = {
  "registro-unificado": 0,
  conclusiones: 0,
  "asistencia-agil": 0,
  comunicacion: 0,
};

export function saveFeedback(entry: FeedbackEntry) {
  const raw = window.localStorage.getItem(STORAGE_KEYS.feedback);
  const current = raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
  window.localStorage.setItem(STORAGE_KEYS.feedback, JSON.stringify([...current, entry]));
}

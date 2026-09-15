export type FeatureId = "registro-unificado" | "conclusiones" | "asistencia-agil" | "comunicacion";

export interface Feature {
  id: FeatureId;
  title: string;
  description: string;
}

export interface FeedbackEntry {
  id: string;
  createdAt: string;
  userType: string;
  mainDifficulty: string;
  timeConsumingTask: string;
  currentTools: string;
  usefulFunction: string;
  additionalComment?: string;
  interviewAvailable: boolean;
  contact?: string;
}

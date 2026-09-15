import { z } from "zod";

export const feedbackSchema = z
  .object({
    userType: z.string().min(1, "Selecciona tu tipo de usuario."),
    mainDifficulty: z.string().min(1, "Selecciona la principal dificultad."),
    timeConsumingTask: z.string().min(1, "Selecciona la tarea que consume más tiempo."),
    currentTools: z.string().trim().min(2, "Cuéntanos qué herramientas utilizas."),
    usefulFunction: z.string().min(1, "Selecciona una función."),
    additionalComment: z.string().max(600, "Usa 600 caracteres o menos.").optional(),
    interviewAvailable: z.boolean(),
    contact: z.string().trim().max(120, "Usa 120 caracteres o menos.").optional(),
  })
  .refine((data) => !data.interviewAvailable || Boolean(data.contact?.trim()), {
    message: "Incluye un medio de contacto si deseas participar en una entrevista.",
    path: ["contact"],
  });

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

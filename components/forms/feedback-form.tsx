"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LockKeyhole, Send } from "lucide-react";
import { features } from "@/data/content";
import { commonDifficulties, timeTasks, userTypes } from "@/data/form-options";
import { feedbackSchema, type FeedbackFormValues } from "@/schemas/feedback";
import { saveFeedback } from "@/utils/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="field-error" role="alert">
      {message}
    </span>
  ) : null;
}

export function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      userType: "",
      mainDifficulty: "",
      timeConsumingTask: "",
      currentTools: "",
      usefulFunction: "",
      additionalComment: "",
      interviewAvailable: false,
      contact: "",
    },
  });
  const interviewAvailable = useWatch({ control, name: "interviewAvailable" });

  const onSubmit = (values: FeedbackFormValues) => {
    saveFeedback({ ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="form-success" role="status">
        <span>
          <CheckCircle2 />
        </span>
        <p className="eyebrow">Respuesta guardada</p>
        <h3>Gracias por compartir tu experiencia</h3>
        <p>La respuesta se almacenó localmente en este dispositivo para esta demostración.</p>
        <button type="button" className="secondary-button" onClick={() => setSubmitted(false)}>
          Enviar otra respuesta
        </button>
      </div>
    );
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <div className="field-group">
          <label id="user-type-label">Tipo de usuario *</label>
          <Controller
            name="userType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="form-select"
                  aria-labelledby="user-type-label"
                  aria-invalid={Boolean(errors.userType)}
                >
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.userType?.message} />
        </div>
        <div className="field-group">
          <label id="difficulty-label">Principal dificultad *</label>
          <Controller
            name="mainDifficulty"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="form-select"
                  aria-labelledby="difficulty-label"
                  aria-invalid={Boolean(errors.mainDifficulty)}
                >
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {commonDifficulties.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.mainDifficulty?.message} />
        </div>
        <div className="field-group">
          <label id="task-label">Tarea que consume más tiempo *</label>
          <Controller
            name="timeConsumingTask"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="form-select"
                  aria-labelledby="task-label"
                  aria-invalid={Boolean(errors.timeConsumingTask)}
                >
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {timeTasks.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.timeConsumingTask?.message} />
        </div>
        <div className="field-group">
          <label id="function-label">Función que considera más útil *</label>
          <Controller
            name="usefulFunction"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="form-select"
                  aria-labelledby="function-label"
                  aria-invalid={Boolean(errors.usefulFunction)}
                >
                  <SelectValue placeholder="Selecciona una función" />
                </SelectTrigger>
                <SelectContent>
                  {features.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.usefulFunction?.message} />
        </div>
        <div className="field-group field-full">
          <label htmlFor="currentTools">Herramientas que utiliza actualmente *</label>
          <input
            id="currentTools"
            placeholder="Ej.: cuaderno, Excel, plataforma institucional"
            aria-invalid={Boolean(errors.currentTools)}
            {...register("currentTools")}
          />
          <FieldError message={errors.currentTools?.message} />
        </div>
        <div className="field-group field-full">
          <label htmlFor="additionalComment">Comentario adicional</label>
          <textarea
            id="additionalComment"
            rows={4}
            placeholder="Cuéntanos una situación concreta o una necesidad que deberíamos considerar."
            aria-invalid={Boolean(errors.additionalComment)}
            {...register("additionalComment")}
          />
          <FieldError message={errors.additionalComment?.message} />
        </div>
        <div className="field-group field-full interview-field">
          <label className="checkbox-label" htmlFor="interviewAvailable">
            <input id="interviewAvailable" type="checkbox" {...register("interviewAvailable")} />
            <span>
              <strong>Podría participar en una entrevista breve</strong>
              <small>Esta opción nos ayudará a profundizar en las necesidades reales.</small>
            </span>
          </label>
        </div>
        <div className="field-group field-full">
          <label htmlFor="contact">Contacto {interviewAvailable ? "*" : "(opcional)"}</label>
          <input
            id="contact"
            placeholder="Correo o teléfono, solo si deseas que te contactemos"
            aria-invalid={Boolean(errors.contact)}
            {...register("contact")}
          />
          <FieldError message={errors.contact?.message} />
        </div>
      </div>
      <div className="form-footer">
        <p>
          <LockKeyhole />
          No se envía información a ningún servidor en esta versión.
        </p>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <Send />
          Guardar mi respuesta
        </button>
      </div>
    </form>
  );
}

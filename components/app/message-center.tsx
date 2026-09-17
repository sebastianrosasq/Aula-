"use client";

import { useState } from "react";
import { MessageSquareText, Send } from "lucide-react";

type Recipient = { id: string; firstName: string; lastName: string; role: string };
type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

export function MessageCenter({
  currentUserId,
  recipients,
  messages,
}: {
  currentUserId: string;
  recipients: Recipient[];
  messages: Message[];
}) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(formData: FormData) {
    setSending(true);
    setFeedback(null);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: formData.get("recipientId"),
        subject: formData.get("subject"),
        body: formData.get("body"),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSending(false);
    if (!response.ok) {
      setFeedback(body.error ?? "No se pudo enviar el mensaje.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="message-workspace">
      <section className="message-compose">
        <div className="app-section-heading">
          <div>
            <p className="app-eyebrow">Comunicación</p>
            <h1>Nuevo mensaje</h1>
            <p>Envía información relevante a las personas vinculadas con tu aula.</p>
          </div>
        </div>
        {recipients.length ? (
          <form action={onSubmit} className="compose-form">
            <label>
              Destinatario
              <select name="recipientId" required defaultValue="">
                <option value="" disabled>
                  Selecciona una persona
                </option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.lastName}, {recipient.firstName} · {recipient.role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Asunto
              <input name="subject" maxLength={180} required />
            </label>
            <label>
              Mensaje
              <textarea name="body" rows={6} maxLength={3000} required />
            </label>
            {feedback ? (
              <p className="attendance-feedback error" role="alert">
                {feedback}
              </p>
            ) : null}
            <button className="app-primary-button" type="submit" disabled={sending}>
              <Send />
              {sending ? "Enviando…" : "Enviar mensaje"}
            </button>
          </form>
        ) : (
          <div className="empty-state">
            <MessageSquareText />
            <h2>Aún no hay contactos disponibles</h2>
            <p>
              La administración debe vincular estudiantes, familias y docentes para habilitar la
              comunicación.
            </p>
          </div>
        )}
      </section>
      <section className="message-history">
        <div className="app-section-heading">
          <div>
            <p className="app-eyebrow">Historial</p>
            <h2>Conversaciones recientes</h2>
          </div>
        </div>
        {messages.length ? (
          <div className="message-thread">
            {messages.map((message) => (
              <article
                key={message.id}
                className={message.senderId === currentUserId ? "sent" : "received"}
              >
                <span>{message.senderId === currentUserId ? "Enviado" : "Recibido"}</span>
                <strong>{message.subject}</strong>
                <p>{message.body}</p>
                <small>{new Date(message.createdAt).toLocaleString("es-PE")}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <MessageSquareText />
            <p>Todavía no tienes mensajes.</p>
          </div>
        )}
      </section>
    </div>
  );
}

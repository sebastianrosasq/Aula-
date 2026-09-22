"use client";

import { FormEvent, useEffect, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { useRouter } from "next/navigation";

type Recipient = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  context?: string | null;
};
type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
  senderName: string;
  senderLastName: string;
  recipientName: string;
  recipientLastName: string;
};
type Feedback = { kind: "success" | "error"; message: string };

export function MessageCenter({
  currentUserId,
  recipients,
  messages,
  preferredRecipientId,
}: {
  currentUserId: string;
  recipients: Recipient[];
  messages: Message[];
  preferredRecipientId?: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sending, setSending] = useState(false);
  const [recipientId, setRecipientId] = useState(() => preferredRecipientId ?? "");

  useEffect(() => {
    const unreadMessageIds = messages
      .filter((message) => message.recipientId === currentUserId && !message.readAt)
      .map((message) => message.id);
    if (!unreadMessageIds.length) return;

    void fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageIds: unreadMessageIds }),
    }).then((response) => {
      if (response.ok) router.refresh();
    });
  }, [currentUserId, messages, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const subject = String(formData.get("subject") ?? "").trim();
    const bodyText = String(formData.get("body") ?? "").trim();
    if (!formData.get("recipientId") || subject.length < 3 || bodyText.length < 3) {
      setFeedback({
        kind: "error",
        message:
          "Selecciona un destinatario y escribe un asunto y mensaje de al menos 3 caracteres.",
      });
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: formData.get("recipientId"),
          subject,
          body: bodyText,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setFeedback({ kind: "error", message: body.error ?? "No se pudo enviar el mensaje." });
        return;
      }
      form.reset();
      setRecipientId("");
      setFeedback({ kind: "success", message: "Mensaje enviado correctamente." });
      router.refresh();
    } catch {
      setFeedback({
        kind: "error",
        message:
          "No se pudo conectar para enviar el mensaje. Revisa tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setSending(false);
    }
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
          <form className="compose-form" noValidate onSubmit={onSubmit} aria-busy={sending}>
            <label>
              Destinatario
              <select
                name="recipientId"
                required
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
              >
                <option value="" disabled>
                  Selecciona una persona
                </option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.lastName}, {recipient.firstName} ·{" "}
                    {recipient.context || recipient.role}
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
              <p
                className={"attendance-feedback " + feedback.kind}
                role={feedback.kind === "error" ? "alert" : "status"}
              >
                {feedback.message}
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
                className={`${message.senderId === currentUserId ? "sent" : "received"}${
                  message.recipientId === currentUserId && !message.readAt ? " unread" : ""
                }`}
              >
                <span>
                  {message.senderId === currentUserId
                    ? `Para ${message.recipientName} ${message.recipientLastName}`
                    : `De ${message.senderName} ${message.senderLastName}`}
                </span>
                {message.recipientId === currentUserId && !message.readAt ? <em>Nuevo</em> : null}
                <strong>{message.subject}</strong>
                <p>{message.body}</p>
                <small>
                  {new Date(message.createdAt).toLocaleString("es-PE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </small>
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

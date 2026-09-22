import { MessageSquareText } from "lucide-react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { MessageCenter } from "@/components/app/message-center";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { getAllowedMessageRecipients, getMessageCenter } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ recipientId?: string }>;
}) {
  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch {
    return (
      <main className="database-notice">
        <div>
          <MessageSquareText size={30} />
          <h1>MySQL aún no está configurado.</h1>
          <p>Configura la conexión antes de usar mensajería.</p>
        </div>
      </main>
    );
  }
  if (!user) redirect("/login");
  const [messages, recipients] = await Promise.all([
    getMessageCenter(user.id),
    getAllowedMessageRecipients(user),
  ]);
  const { recipientId } = await searchParams;
  const preferredRecipientId = recipients.some((recipient) => recipient.id === recipientId)
    ? recipientId
    : undefined;
  return (
    <AppShell user={user}>
      <header className="dashboard-welcome dashboard-welcome--compact">
        <div>
          <p className="eyebrow">Comunicación</p>
          <h1>Mensajes</h1>
          <p>Conversaciones con los miembros vinculados a tu aula.</p>
        </div>
      </header>
      <MessageCenter
        currentUserId={user.id}
        messages={messages}
        recipients={recipients}
        preferredRecipientId={preferredRecipientId}
      />
    </AppShell>
  );
}

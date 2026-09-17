import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { messages } from "@/db/schema";
import { getAllowedMessageRecipients } from "@/db/queries";
import { getSessionUser } from "@/lib/auth";
import { forbidden, invalidRequest, requireSameOrigin, unauthorized } from "@/lib/http";

const messageSchema = z.object({
  recipientId: z.string().uuid(),
  subject: z.string().trim().min(3, "Escribe un asunto de al menos 3 caracteres.").max(180),
  body: z.string().trim().min(3, "Escribe un mensaje de al menos 3 caracteres.").max(3000),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return forbidden();
  const user = await getSessionUser().catch(() => null);
  if (!user) return unauthorized();

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidRequest(parsed.error.issues[0]?.message);

  const recipients = await getAllowedMessageRecipients(user);
  if (!recipients.some((recipient) => recipient.id === parsed.data.recipientId)) return forbidden();

  await getDb().insert(messages).values({
    id: crypto.randomUUID(),
    institutionId: user.institutionId,
    senderId: user.id,
    recipientId: parsed.data.recipientId,
    subject: parsed.data.subject,
    body: parsed.data.body,
  });

  return NextResponse.json({ ok: true });
}

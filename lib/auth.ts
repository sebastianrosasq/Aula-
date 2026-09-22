import "server-only";

import { compare } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-aulaplus_session" : "aulaenlace_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

export type AppRole = "admin" | "docente" | "estudiante" | "padre";

export type SessionUser = {
  id: string;
  institutionId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticateWithPassword(email: string, password: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email.trim().toLowerCase()), eq(users.active, true)))
    .limit(1);

  if (!user || !(await compare(password, user.passwordHash))) return null;

  return {
    id: user.id,
    institutionId: user.institutionId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  } satisfies SessionUser;
}

export async function createSession(userId: string) {
  const db = getDb();
  const token = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: randomUUID(),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
  return { token, expiresAt };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SESSION_COOKIE)?.value ??
    (SESSION_COOKIE !== "aulaenlace_session"
      ? cookieStore.get("aulaenlace_session")?.value
      : undefined);
  if (!token) return null;

  const db = getDb();
  const [result] = await db
    .select({
      id: users.id,
      institutionId: users.institutionId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.active, true),
      ),
    )
    .limit(1);

  return result ?? null;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(SESSION_COOKIE)?.value ??
    (SESSION_COOKIE !== "aulaenlace_session"
      ? cookieStore.get("aulaenlace_session")?.value
      : undefined);
  if (token) {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
}

export function sessionCookie(token: string, expiresAt: Date) {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      expires: expiresAt,
      priority: "high" as const,
    },
  };
}

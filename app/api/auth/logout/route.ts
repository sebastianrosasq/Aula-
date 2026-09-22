import { NextResponse } from "next/server";
import { revokeCurrentSession, SESSION_COOKIE } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/http";

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  try {
    await revokeCurrentSession();
  } finally {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
    if (SESSION_COOKIE !== "aulaenlace_session") {
      response.cookies.set("aulaenlace_session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    }
    return response;
  }
}

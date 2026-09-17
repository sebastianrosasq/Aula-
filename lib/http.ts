import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "No tienes permiso para esta acción." }, { status: 403 });
}

export function invalidRequest(message = "Datos no válidos.") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  return !origin || !host || new URL(origin).host === host;
}

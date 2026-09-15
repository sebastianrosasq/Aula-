import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AulaEnlace | Innovación educativa en validación",
  description:
    "Propuesta académica para reducir tareas administrativas repetitivas y devolver tiempo a la enseñanza.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}

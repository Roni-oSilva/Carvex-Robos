import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fábrica de E-books", template: "%s · Fábrica de E-books" },
  description: "Plataforma para criar, revisar e publicar e-books com IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

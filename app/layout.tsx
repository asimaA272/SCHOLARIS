import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scholaris — Autonomous Research Collaborator",
  description: "AI-powered academic paper search and synthesis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Plateforme - Correspondance Commerciale",
  description: "Plateforme d'apprentissage pour la correspondance commerciale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="relative z-0">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

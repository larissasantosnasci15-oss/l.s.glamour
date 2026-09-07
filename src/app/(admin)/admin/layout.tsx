import "../../globals.css";
import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Painel administrativo — L.S.GLAMOUR",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-body antialiased bg-bg text-ink">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}

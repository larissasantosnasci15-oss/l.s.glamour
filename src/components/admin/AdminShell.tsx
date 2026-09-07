"use client";

import { usePathname } from "next/navigation";
import AdminNav from "./AdminNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <div className="min-h-screen flex items-center justify-center p-6">{children}</div>;
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <AdminNav />
      <div className="p-5 md:p-8 max-w-5xl">{children}</div>
    </div>
  );
}

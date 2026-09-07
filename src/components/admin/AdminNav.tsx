"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/configuracoes", label: "Configurações da loja" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="bg-ink text-bg md:min-h-screen p-6 flex md:flex-col justify-between">
      <div>
        <Link href="/admin" className="font-display text-2xl block mb-8">
          L.S.GLAMOUR
        </Link>
        <nav className="flex md:flex-col gap-1 flex-wrap">
          {LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                  active ? "bg-white/10 text-white" : "text-bg/70 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="hidden md:block">
        <Link href="/" target="_blank" className="text-xs text-bg/50 hover:text-bg block mb-3">
          Ver site publicado ↗
        </Link>
        <button onClick={handleLogout} className="text-xs text-bg/50 hover:text-bg">
          Sair do painel
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, Settings } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";

export default function HeaderClient({
  settings,
  categories,
}: {
  settings: Settings;
  categories: Category[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { count, open } = useCart();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-line">
      <div className="hairline" />
      <div className="container-wrap flex items-center justify-between gap-4 py-4">
        <button
          className="md:hidden p-2 -ml-2 text-ink"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2 mx-auto md:mx-0" onClick={() => setMenuOpen(false)}>
          <Image
            src={settings.logo_url || "/brand/lsglamour-logo.png"}
            alt={settings.store_name}
            width={44}
            height={44}
            className="rounded-full object-cover bg-blush"
          />
          <span className="font-display text-2xl md:text-3xl tracking-wide text-ink">
            {settings.store_name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-body text-[0.92rem] text-ink/80">
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.id} href={`/produtos?categoria=${cat.slug}`} className="hover:text-primary transition-colors">
              {cat.name}
            </Link>
          ))}
          <Link href="/produtos" className="hover:text-primary transition-colors">
            Ver tudo
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            className="p-2 text-ink hover:text-primary transition-colors"
            aria-label="Buscar produtos"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="relative p-2 text-ink hover:text-primary transition-colors"
            aria-label="Abrir carrinho"
            onClick={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 4h2l1.4 12.4A2 2 0 0 0 8.4 18h9.2a2 2 0 0 0 2-1.7L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="21" r="1.2" />
              <circle cx="18" cy="21" r="1.2" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="container-wrap pb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, categoria ou marca..."
              className="flex-1 border border-line rounded-full px-4 py-2 text-sm bg-bg focus:outline-none focus:border-primary"
            />
            <button type="submit" className="btn-primary rounded-full px-5 py-2 text-sm">
              Buscar
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="md:hidden container-wrap pb-4 flex flex-col gap-3 border-t border-line pt-3 text-sm">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produtos?categoria=${cat.slug}`}
              className="py-1 text-ink/80"
              onClick={() => setMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/produtos" className="py-1 text-primary" onClick={() => setMenuOpen(false)}>
            Ver todos os produtos
          </Link>
        </nav>
      )}

      <CartDrawer settings={settings} />
    </header>
  );
}

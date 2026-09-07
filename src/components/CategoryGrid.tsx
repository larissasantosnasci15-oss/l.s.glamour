import Link from "next/link";
import type { Category } from "@/lib/types";

// Categorias com maior destaque visual na home, conforme identidade da loja.
const FEATURED_SLUGS = ["perfumes", "body-splash", "skincare", "roupas", "semijoias"];

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const featured = categories.filter((c) => FEATURED_SLUGS.includes(c.slug));
  const rest = categories.filter((c) => !FEATURED_SLUGS.includes(c.slug));
  const ordered = [...featured, ...rest].slice(0, 8);

  if (ordered.length === 0) return null;

  return (
    <section className="container-wrap py-14 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-3xl md:text-4xl">Explore por categoria</h2>
        <Link href="/produtos" className="text-sm text-primary-dark hover:underline underline-offset-4 hidden sm:inline">
          Ver todos os produtos
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ordered.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/produtos?categoria=${cat.slug}`}
            className={`relative rounded-2xl border border-line bg-surface flex items-center justify-center text-center px-4 py-10 hover:border-primary transition-colors ${
              i === 0 ? "col-span-2 row-span-2 py-20" : ""
            }`}
          >
            <span className={`font-display ${i === 0 ? "text-2xl md:text-3xl" : "text-lg"}`}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

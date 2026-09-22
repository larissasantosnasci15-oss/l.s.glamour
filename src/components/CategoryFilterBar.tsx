import Link from "next/link";
import type { Category } from "@/lib/types";

const CHIP =
  "flex-shrink-0 text-[11px] font-medium rounded-full border border-line text-ink/70 px-3.5 py-1.5 hover:border-gold hover:text-ink transition-colors";

// "Promoções" e "Lançamentos" vieram como categorias de exemplo, mas na prática
// funcionam como os marcadores "Marcar como promoção/lançamento" do produto —
// por isso apontam para o filtro de flag (?promocao=1 / ?lancamento=1), igual
// ao resto do site, em vez de filtrar por categoria (que ficaria vazio).
function categoryHref(cat: Category) {
  if (cat.slug === "promocoes") return "/produtos?promocao=1";
  if (cat.slug === "lancamentos") return "/produtos?lancamento=1";
  return `/produtos?categoria=${cat.slug}`;
}

export default function CategoryFilterBar({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="border-b border-line bg-surface">
      <div className="container-wrap flex items-center gap-2 py-3 overflow-x-auto">
        <Link href="/produtos" className={CHIP}>
          Todas
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={categoryHref(cat)} className={CHIP}>
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

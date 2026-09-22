"use client";

import type { Category, ProductType } from "@/lib/types";
import type { ClientProductFilters } from "@/lib/clientProducts";

const CHIP =
  "flex-shrink-0 text-xs font-medium rounded-full border px-4 py-2 transition-colors";
const CHIP_ACTIVE = "bg-ink text-white border-ink";
const CHIP_INACTIVE = "border-line bg-surface text-ink/70 hover:border-gold hover:text-ink";

function chipClass(active: boolean) {
  return `${CHIP} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`;
}

// "Promoções" e "Lançamentos" vieram como categorias de exemplo, mas na prática
// funcionam como os marcadores "Marcar como promoção/lançamento" do produto —
// por isso apontam para o filtro de flag (promocao=1 / lancamento=1), igual ao
// resto do site, em vez de filtrar por categoria (que ficaria vazio).
export default function CategoryFilterBar({
  categories,
  types,
  filters,
  onChange,
}: {
  categories: Category[];
  types: ProductType[];
  filters: ClientProductFilters;
  onChange: (patch: Partial<Record<keyof ClientProductFilters, string | null>>) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="container-wrap flex items-center gap-2 py-5 overflow-x-auto">
      <button
        onClick={() => onChange({ categoria: null, tipo: null, promocao: null, lancamento: null })}
        className={chipClass(
          !filters.categoria && !filters.tipo && filters.promocao !== "1" && filters.lancamento !== "1"
        )}
      >
        Todas
      </button>
      {categories.map((cat) => {
        if (cat.slug === "promocoes") {
          return (
            <button
              key={cat.id}
              onClick={() => onChange({ promocao: "1", categoria: null, lancamento: null })}
              className={chipClass(filters.promocao === "1")}
            >
              {cat.name}
            </button>
          );
        }
        if (cat.slug === "lancamentos") {
          return (
            <button
              key={cat.id}
              onClick={() => onChange({ lancamento: "1", categoria: null, promocao: null })}
              className={chipClass(filters.lancamento === "1")}
            >
              {cat.name}
            </button>
          );
        }
        return (
          <button
            key={cat.id}
            onClick={() => onChange({ categoria: cat.slug, promocao: null, lancamento: null })}
            className={chipClass(filters.categoria === cat.slug)}
          >
            {cat.name}
          </button>
        );
      })}
      {types.map((type) => (
        <button
          key={type.id}
          onClick={() => onChange({ tipo: filters.tipo === type.slug ? null : type.slug })}
          className={chipClass(filters.tipo === type.slug)}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
}

"use client";

import type { Category, ProductType } from "@/lib/types";

const CHIP_BASE = "text-xs font-medium rounded-full border px-3.5 py-1.5 transition-colors";
const CHIP_ACTIVE = "bg-ink text-white border-ink";
const CHIP_INACTIVE = "border-line text-ink/70 hover:border-gold hover:text-ink";

function chipClass(active: boolean) {
  return `${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`;
}

export type ProductFiltersState = {
  categoria?: string;
  tipo?: string;
  busca?: string;
  promocao?: string;
  lancamento?: string;
  precoMin?: string;
  precoMax?: string;
};

export default function FiltersBar({
  categories,
  types,
  filters,
  onChange,
}: {
  categories: Category[];
  types: ProductType[];
  filters: ProductFiltersState;
  onChange: (patch: Partial<Record<keyof ProductFiltersState, string | null>>) => void;
}) {
  function handlePriceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = (formData.get("precoMin") as string) || null;
    const max = (formData.get("precoMax") as string) || null;
    onChange({ precoMin: min, precoMax: max });
  }

  return (
    <aside className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      <div className="min-w-[220px] md:min-w-0">
        <p className="text-xs tracking-wide text-ink/45 mb-2 uppercase">Categorias</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ categoria: null, promocao: null, lancamento: null })}
            className={chipClass(!filters.categoria && filters.promocao !== "1" && filters.lancamento !== "1")}
          >
            Todas
          </button>
          {categories.map((cat) => {
            // "Promoções" e "Lançamentos" vieram como categorias de exemplo, mas na
            // prática funcionam como os marcadores "Marcar como promoção/lançamento"
            // do produto (não uma categoria de verdade que precisa ser escolhida no
            // cadastro) — por isso apontam para o mesmo filtro do checkbox "Somente
            // promoções/lançamentos" abaixo, em vez de filtrar por categoria.
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
        </div>
      </div>

      {types.length > 0 && (
        <div className="min-w-[180px] md:min-w-0">
          <p className="text-xs tracking-wide text-ink/45 mb-2 uppercase">Tipo</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onChange({ tipo: null })} className={chipClass(!filters.tipo)}>
              Todos
            </button>
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
        </div>
      )}

      <div className="min-w-[180px] md:min-w-0">
        <p className="text-xs tracking-wide text-ink/45 mb-2 uppercase">Destaques</p>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.promocao === "1"}
              onChange={(e) => onChange({ promocao: e.target.checked ? "1" : null })}
            />
            Somente promoções
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.lancamento === "1"}
              onChange={(e) => onChange({ lancamento: e.target.checked ? "1" : null })}
            />
            Somente lançamentos
          </label>
        </div>
      </div>

      <div className="min-w-[200px] md:min-w-0">
        <p className="text-xs tracking-wide text-ink/45 mb-2 uppercase">Faixa de preço</p>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            name="precoMin"
            type="number"
            min={0}
            placeholder="Mín"
            defaultValue={filters.precoMin}
            key={`min-${filters.precoMin ?? ""}`}
            className="w-full border border-line rounded-lg px-2 py-1.5 text-sm"
          />
          <span className="text-ink/40">–</span>
          <input
            name="precoMax"
            type="number"
            min={0}
            placeholder="Máx"
            defaultValue={filters.precoMax}
            key={`max-${filters.precoMax ?? ""}`}
            className="w-full border border-line rounded-lg px-2 py-1.5 text-sm"
          />
          <button type="submit" className="text-xs text-gold font-medium px-2">
            OK
          </button>
        </form>
      </div>
    </aside>
  );
}

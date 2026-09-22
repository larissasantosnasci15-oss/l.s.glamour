"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category, ProductType } from "@/lib/types";

const CHIP_BASE = "text-[11px] font-medium rounded-full border px-3 py-1.5 transition-colors";
const CHIP_ACTIVE = "bg-ink text-white border-ink";
const CHIP_INACTIVE = "border-line text-ink/70 hover:border-gold hover:text-ink";

function chipClass(active: boolean) {
  return `${CHIP_BASE} ${active ? CHIP_ACTIVE : CHIP_INACTIVE}`;
}

export default function FiltersBar({
  categories,
  types,
  searchParams,
}: {
  categories: Category[];
  types: ProductType[];
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    router.push(`/produtos?${params.toString()}`);
  }

  function handlePriceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get("precoMin") as string;
    const max = formData.get("precoMax") as string;
    const params = new URLSearchParams(currentSearchParams.toString());
    min ? params.set("precoMin", min) : params.delete("precoMin");
    max ? params.set("precoMax", max) : params.delete("precoMax");
    router.push(`/produtos?${params.toString()}`);
  }

  return (
    <aside className="flex md:flex-col gap-6 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      <div className="min-w-[220px] md:min-w-0">
        <p className="text-xs tracking-wide text-ink/45 mb-3 uppercase">Categorias</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/produtos"
            className={chipClass(!searchParams.categoria && searchParams.promocao !== "1" && searchParams.lancamento !== "1")}
          >
            Todas
          </Link>
          {categories.map((cat) => {
            // "Promoções" e "Lançamentos" vieram como categorias de exemplo, mas na
            // prática funcionam como os marcadores "Marcar como promoção/lançamento"
            // do produto (não uma categoria de verdade que precisa ser escolhida no
            // cadastro) — por isso apontam para o mesmo filtro do checkbox "Somente
            // promoções/lançamentos" abaixo, em vez de filtrar por categoria.
            if (cat.slug === "promocoes") {
              return (
                <Link key={cat.id} href="/produtos?promocao=1" className={chipClass(searchParams.promocao === "1")}>
                  {cat.name}
                </Link>
              );
            }
            if (cat.slug === "lancamentos") {
              return (
                <Link key={cat.id} href="/produtos?lancamento=1" className={chipClass(searchParams.lancamento === "1")}>
                  {cat.name}
                </Link>
              );
            }
            return (
              <Link
                key={cat.id}
                href={`/produtos?categoria=${cat.slug}`}
                className={chipClass(searchParams.categoria === cat.slug)}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {types.length > 0 && (
        <div className="min-w-[180px] md:min-w-0">
          <p className="text-xs tracking-wide text-ink/45 mb-3 uppercase">Tipo</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => updateParam("tipo", null)} className={chipClass(!searchParams.tipo)}>
              Todos
            </button>
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => updateParam("tipo", searchParams.tipo === type.slug ? null : type.slug)}
                className={chipClass(searchParams.tipo === type.slug)}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="min-w-[180px] md:min-w-0">
        <p className="text-xs tracking-wide text-ink/45 mb-3 uppercase">Destaques</p>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchParams.promocao === "1"}
              onChange={(e) => updateParam("promocao", e.target.checked ? "1" : null)}
            />
            Somente promoções
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={searchParams.lancamento === "1"}
              onChange={(e) => updateParam("lancamento", e.target.checked ? "1" : null)}
            />
            Somente lançamentos
          </label>
        </div>
      </div>

      <div className="min-w-[200px] md:min-w-0">
        <p className="text-xs tracking-wide text-ink/45 mb-3 uppercase">Faixa de preço</p>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            name="precoMin"
            type="number"
            min={0}
            placeholder="Mín"
            defaultValue={searchParams.precoMin}
            className="w-full border border-line rounded-lg px-2 py-1.5 text-sm"
          />
          <span className="text-ink/40">–</span>
          <input
            name="precoMax"
            type="number"
            min={0}
            placeholder="Máx"
            defaultValue={searchParams.precoMax}
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

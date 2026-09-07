"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

export default function FiltersBar({
  categories,
  searchParams,
}: {
  categories: Category[];
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
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <Link
              href="/produtos"
              className={!searchParams.categoria ? "text-primary font-medium" : "text-ink/70 hover:text-primary"}
            >
              Todas
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/produtos?categoria=${cat.slug}`}
                className={searchParams.categoria === cat.slug ? "text-primary font-medium" : "text-ink/70 hover:text-primary"}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

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
          <button type="submit" className="text-xs text-primary-dark px-2">
            OK
          </button>
        </form>
      </div>
    </aside>
  );
}

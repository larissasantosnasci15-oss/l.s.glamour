"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, ProductType } from "@/lib/types";

type GroupBy = "categoria" | "tipo";
type Mode = "fixo" | "percentual";

export default function AdminPromocaoEmMassaPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("categoria");
  const [selectedId, setSelectedId] = useState("");
  const [mode, setMode] = useState<Mode>("fixo");
  const [value, setValue] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [checkingCount, setCheckingCount] = useState(false);
  const [applying, setApplying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const filterColumn = groupBy === "categoria" ? "category_id" : "type_id";
  const options = groupBy === "categoria" ? categories : types;

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCategories(data ?? []));
    supabase
      .from("product_types")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setTypes(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sempre que trocar o agrupamento ou a opção escolhida, esquece a
  // contagem/resultado anterior e recalcula quantos produtos batem.
  useEffect(() => {
    setSuccess(null);
    setError(null);
    setMatchCount(null);
    if (!selectedId) return;
    setCheckingCount(true);
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq(filterColumn, selectedId)
      .eq("active", true)
      .then(({ count }) => {
        setMatchCount(count ?? 0);
        setCheckingCount(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy, selectedId]);

  const selectedLabel = useMemo(
    () => options.find((o) => o.id === selectedId)?.name ?? "",
    [options, selectedId]
  );

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedId) {
      setError(groupBy === "categoria" ? "Escolha uma categoria." : "Escolha um tipo.");
      return;
    }
    const num = Number(value.replace(",", "."));
    if (!num || num <= 0) {
      setError("Digite um valor maior que zero.");
      return;
    }
    if (mode === "percentual" && num > 90) {
      setError("Digite uma porcentagem até 90%.");
      return;
    }
    if (matchCount === 0) {
      setError(`Nenhum produto ativo encontrado em "${selectedLabel}".`);
      return;
    }
    if (
      !confirm(
        mode === "fixo"
          ? `Colocar todos os ${matchCount} produtos de "${selectedLabel}" em promoção por R$ ${num.toFixed(2).replace(".", ",")} cada?`
          : `Aplicar ${num}% de desconto em todos os ${matchCount} produtos de "${selectedLabel}"?`
      )
    ) {
      return;
    }

    setApplying(true);

    if (mode === "fixo") {
      const { error } = await supabase
        .from("products")
        .update({ is_promo: true, promo_price: num })
        .eq(filterColumn, selectedId)
        .eq("active", true);
      setApplying(false);
      if (error) {
        setError("Não foi possível aplicar a promoção. Tente novamente.");
        return;
      }
      setSuccess(`Pronto! ${matchCount} produto(s) de "${selectedLabel}" agora estão em promoção por R$ ${num.toFixed(2).replace(".", ",")}.`);
    } else {
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, price")
        .eq(filterColumn, selectedId)
        .eq("active", true)
        .gt("price", 0);

      if (fetchError || !products) {
        setApplying(false);
        setError("Não foi possível buscar os produtos. Tente novamente.");
        return;
      }

      const rows = products.map((p) => ({
        id: p.id,
        is_promo: true,
        promo_price: Math.round(p.price * (1 - num / 100) * 100) / 100,
      }));

      const skipped = matchCount != null ? matchCount - rows.length : 0;

      if (rows.length === 0) {
        setApplying(false);
        setError(`Nenhum produto de "${selectedLabel}" tem preço definido para calcular o desconto.`);
        return;
      }

      const { error } = await supabase.from("products").upsert(rows);
      setApplying(false);
      if (error) {
        setError("Não foi possível aplicar a promoção. Tente novamente.");
        return;
      }
      setSuccess(
        `Pronto! ${rows.length} produto(s) de "${selectedLabel}" receberam ${num}% de desconto.` +
          (skipped > 0 ? ` (${skipped} produto(s) sem preço definido foram ignorados.)` : "")
      );
    }

    setValue("");
    setMatchCount(0);
  }

  async function handleRemove() {
    setError(null);
    setSuccess(null);
    if (!selectedId) {
      setError(groupBy === "categoria" ? "Escolha uma categoria." : "Escolha um tipo.");
      return;
    }
    if (!confirm(`Remover a promoção de todos os produtos de "${selectedLabel}"?`)) return;

    setRemoving(true);
    const { error } = await supabase
      .from("products")
      .update({ is_promo: false, promo_price: null })
      .eq(filterColumn, selectedId);
    setRemoving(false);

    if (error) {
      setError("Não foi possível remover a promoção. Tente novamente.");
      return;
    }
    setSuccess(`Promoção removida dos produtos de "${selectedLabel}".`);
    setMatchCount(0);
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Promoção em massa</h1>
      <p className="text-sm text-ink/60 mb-6 max-w-2xl">
        Coloque de uma vez todos os produtos de uma categoria (ex: Miniaturas) ou de um tipo (ex: Kit) em promoção,
        sem precisar editar produto por produto.
      </p>

      <div className="max-w-xl flex flex-col gap-5">
        <div>
          <p className="text-xs text-ink/60 mb-2">Agrupar por</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setGroupBy("categoria");
                setSelectedId("");
              }}
              className={`text-sm px-4 py-2 rounded-full border ${
                groupBy === "categoria" ? "bg-ink text-white border-ink" : "border-line text-ink/70"
              }`}
            >
              Categoria
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupBy("tipo");
                setSelectedId("");
              }}
              className={`text-sm px-4 py-2 rounded-full border ${
                groupBy === "tipo" ? "bg-ink text-white border-ink" : "border-line text-ink/70"
              }`}
            >
              Tipo
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-ink/60 block mb-1">{groupBy === "categoria" ? "Categoria" : "Tipo"}</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecione...</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {selectedId && (
            <p className="text-[11px] text-ink/40 mt-1">
              {checkingCount ? "Contando produtos..." : `${matchCount ?? 0} produto(s) ativo(s) em "${selectedLabel}".`}
            </p>
          )}
        </div>

        <form onSubmit={handleApply} className="flex flex-col gap-3 border border-line rounded-xl p-4">
          <p className="text-xs text-ink/60">Como calcular o preço promocional</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("fixo")}
              className={`text-sm px-4 py-2 rounded-full border ${
                mode === "fixo" ? "bg-primary text-white border-primary" : "border-line text-ink/70"
              }`}
            >
              Valor fixo (R$)
            </button>
            <button
              type="button"
              onClick={() => setMode("percentual")}
              className={`text-sm px-4 py-2 rounded-full border ${
                mode === "percentual" ? "bg-primary text-white border-primary" : "border-line text-ink/70"
              }`}
            >
              Desconto (%)
            </button>
          </div>
          <p className="text-[11px] text-ink/40 -mt-1">
            {mode === "fixo"
              ? "Todos os produtos escolhidos passam a custar esse mesmo valor na promoção."
              : "Cada produto recebe esse desconto em cima do próprio preço dele (produtos sem preço são ignorados)."}
          </p>

          <div className="flex items-center gap-2 max-w-xs">
            {mode === "fixo" && <span className="text-sm text-ink/50">R$</span>}
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === "fixo" ? "Ex: 15,00" : "Ex: 20"}
              className="flex-1 border border-line rounded-lg px-3 py-2 text-sm"
            />
            {mode === "percentual" && <span className="text-sm text-ink/50">%</span>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-primary-dark">{success}</p>}

          <div className="flex gap-3 mt-1">
            <button
              type="submit"
              disabled={applying || !selectedId}
              className="btn-primary rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {applying ? "Aplicando..." : "Aplicar promoção"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing || !selectedId}
              className="text-sm text-red-500 disabled:opacity-40"
            >
              {removing ? "Removendo..." : "Remover promoção desses produtos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

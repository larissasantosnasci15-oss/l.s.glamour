"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/whatsapp";
import type { Coupon } from "@/lib/types";

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newPercent, setNewPercent] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const code = newCode.trim().toUpperCase();
    const percent = Number(newPercent.replace(",", "."));
    const minOrder = newMinOrder.trim() ? Number(newMinOrder.replace(",", ".")) : 0;

    if (!code) {
      setError("Digite um código para o cupom.");
      return;
    }
    if (!percent || percent <= 0 || percent > 100) {
      setError("Digite uma porcentagem de desconto entre 1 e 100.");
      return;
    }
    if (minOrder < 0) {
      setError("O valor mínimo do pedido não pode ser negativo.");
      return;
    }

    const { error } = await supabase.from("coupons").insert({
      code,
      discount_percent: percent,
      min_order_value: minOrder,
    });
    if (error) {
      setError(
        error.message.includes("duplicate") ? "Já existe um cupom com esse código." : "Não foi possível criar o cupom."
      );
      return;
    }
    setNewCode("");
    setNewPercent("");
    setNewMinOrder("");
    load();
  }

  async function toggleActive(coupon: Coupon) {
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
    await supabase.from("coupons").update({ active: !coupon.active }).eq("id", coupon.id);
  }

  function editLocal(coupon: Coupon, patch: Partial<Coupon>) {
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, ...patch } : c)));
  }

  async function saveMinOrder(coupon: Coupon, rawValue: string) {
    const value = Math.max(0, Number(rawValue.replace(",", ".")) || 0);
    editLocal(coupon, { min_order_value: value });
    await supabase.from("coupons").update({ min_order_value: value }).eq("id", coupon.id);
  }

  async function savePercent(coupon: Coupon, rawValue: string) {
    const value = Number(rawValue.replace(",", "."));
    if (!value || value <= 0 || value > 100) return; // ignora valor inválido, mantém o anterior
    editLocal(coupon, { discount_percent: value });
    await supabase.from("coupons").update({ discount_percent: value }).eq("id", coupon.id);
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Excluir o cupom "${coupon.code}"?`)) return;
    await supabase.from("coupons").delete().eq("id", coupon.id);
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Cupons de desconto</h1>
      <p className="text-sm text-ink/60 mb-6 max-w-2xl">
        Um cupom ativo dá um desconto em porcentagem sobre o valor total da sacola. O cliente digita o código na
        sacola do site para aplicar.
      </p>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-2 max-w-xl">
        <input
          value={newCode}
          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
          placeholder="Código (ex: BEMVINDA10)"
          className="flex-1 min-w-[180px] border border-line rounded-lg px-3 py-2 text-sm uppercase"
        />
        <input
          value={newPercent}
          onChange={(e) => setNewPercent(e.target.value)}
          placeholder="% de desconto"
          inputMode="decimal"
          className="w-32 border border-line rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={newMinOrder}
          onChange={(e) => setNewMinOrder(e.target.value)}
          placeholder="Pedido mínimo (R$)"
          inputMode="decimal"
          className="w-40 border border-line rounded-lg px-3 py-2 text-sm"
        />
        <button className="btn-primary rounded-full px-5 py-2 text-sm font-medium">Adicionar</button>
      </form>
      <p className="text-xs text-ink/40 mb-2 max-w-2xl">
        Deixe o pedido mínimo em branco (ou 0) para o cupom valer para qualquer valor de compra.
      </p>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink/50 mt-4">Carregando...</p>
      ) : coupons.length === 0 ? (
        <p className="text-sm text-ink/50 mt-4">Nenhum cupom cadastrado ainda.</p>
      ) : (
        <div className="bg-surface border border-line rounded-xl divide-y divide-line max-w-2xl mt-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-sm font-medium">{coupon.code}</span>
                <label className="flex items-center gap-1 text-[11px] text-ink/40">
                  Mínimo R$
                  <input
                    defaultValue={coupon.min_order_value > 0 ? coupon.min_order_value : ""}
                    placeholder="0"
                    inputMode="decimal"
                    onBlur={(e) => saveMinOrder(coupon, e.target.value)}
                    className="w-16 border border-line rounded px-1.5 py-0.5 text-[11px] text-ink/70 focus:outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="flex items-center gap-0.5 text-sm text-primary-dark font-medium w-20">
                -
                <input
                  defaultValue={coupon.discount_percent}
                  inputMode="decimal"
                  onBlur={(e) => savePercent(coupon, e.target.value)}
                  className="w-10 border border-line rounded px-1 py-0.5 text-sm text-primary-dark font-medium focus:outline-none focus:border-primary"
                />
                %
              </label>
              <button
                onClick={() => toggleActive(coupon)}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                  coupon.active ? "bg-primary" : "bg-line"
                }`}
                aria-label="Ativar ou desativar cupom"
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    coupon.active ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
              <button onClick={() => handleDelete(coupon)} className="text-red-500 text-xs flex-shrink-0">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-ink/40 mt-4 max-w-2xl">
        Cupons desativados deixam de funcionar na sacola imediatamente, mas continuam salvos aqui.
      </p>
    </div>
  );
}

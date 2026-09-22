"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import type { ProductType } from "@/lib/types";

export default function AdminTiposPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("product_types").select("*").order("sort_order", { ascending: true });
    setTypes(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    const maxOrder = types.reduce((max, t) => Math.max(max, t.sort_order), 0);
    const { error } = await supabase.from("product_types").insert({
      name: newName.trim(),
      slug: slugify(newName),
      sort_order: maxOrder + 1,
    });
    if (error) {
      setError("Não foi possível criar o tipo. O nome pode já existir.");
      return;
    }
    setNewName("");
    load();
  }

  async function renameType(type: ProductType, name: string) {
    setTypes((prev) => prev.map((t) => (t.id === type.id ? { ...t, name } : t)));
  }

  async function saveRename(type: ProductType) {
    await supabase.from("product_types").update({ name: type.name }).eq("id", type.id);
  }

  async function toggleActive(type: ProductType) {
    setTypes((prev) => prev.map((t) => (t.id === type.id ? { ...t, active: !t.active } : t)));
    await supabase.from("product_types").update({ active: !type.active }).eq("id", type.id);
  }

  async function moveType(type: ProductType, direction: -1 | 1) {
    const idx = types.findIndex((t) => t.id === type.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= types.length) return;
    const swapWith = types[swapIdx];

    const reordered = [...types];
    reordered[idx] = swapWith;
    reordered[swapIdx] = type;
    setTypes(reordered);

    await Promise.all([
      supabase.from("product_types").update({ sort_order: swapIdx }).eq("id", type.id),
      supabase.from("product_types").update({ sort_order: idx }).eq("id", swapWith.id),
    ]);
  }

  async function handleDelete(type: ProductType) {
    if (!confirm(`Excluir o tipo "${type.name}"? Produtos com esse tipo ficarão sem tipo.`)) return;
    await supabase.from("product_types").delete().eq("id", type.id);
    setTypes((prev) => prev.filter((t) => t.id !== type.id));
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Tipos</h1>
      <p className="text-sm text-ink/60 mb-6 max-w-2xl">
        O tipo é um filtro à parte da categoria — por exemplo, um produto pode estar na categoria "Perfumes" e ao
        mesmo tempo ter o tipo "Feminino". Use para Feminino, Masculino, Unissex, Kit, ou o que fizer sentido pra
        loja.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome do novo tipo"
          className="flex-1 border border-line rounded-lg px-3 py-2 text-sm"
        />
        <button className="btn-primary rounded-full px-5 py-2 text-sm font-medium">Adicionar</button>
      </form>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : (
        <div className="bg-surface border border-line rounded-xl divide-y divide-line max-w-2xl">
          {types.map((type, i) => (
            <div key={type.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button onClick={() => moveType(type, -1)} disabled={i === 0} className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs leading-none">
                  ▲
                </button>
                <button onClick={() => moveType(type, 1)} disabled={i === types.length - 1} className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs leading-none">
                  ▼
                </button>
              </div>
              <input
                value={type.name}
                onChange={(e) => renameType(type, e.target.value)}
                onBlur={() => saveRename(type)}
                className="flex-1 text-sm border-none bg-transparent focus:outline-none focus:underline"
              />
              <span className="text-xs text-ink/30">/{type.slug}</span>
              <button
                onClick={() => toggleActive(type)}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${type.active ? "bg-primary" : "bg-line"}`}
                aria-label="Ativar ou desativar tipo"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${type.active ? "left-5" : "left-0.5"}`} />
              </button>
              <button onClick={() => handleDelete(type)} className="text-red-500 text-xs flex-shrink-0">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-ink/40 mt-4 max-w-2xl">
        Tipos desativados deixam de aparecer nos filtros da loja, mas os produtos continuam salvos.
      </p>
    </div>
  );
}

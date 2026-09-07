"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/lib/types";

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
    setCategories(data ?? []);
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
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0);
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      slug: slugify(newName),
      sort_order: maxOrder + 1,
    });
    if (error) {
      setError("Não foi possível criar a categoria. O nome pode já existir.");
      return;
    }
    setNewName("");
    load();
  }

  async function renameCategory(cat: Category, name: string) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name } : c)));
  }

  async function saveRename(cat: Category) {
    await supabase.from("categories").update({ name: cat.name }).eq("id", cat.id);
  }

  async function toggleActive(cat: Category) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c)));
    await supabase.from("categories").update({ active: !cat.active }).eq("id", cat.id);
  }

  async function moveCategory(cat: Category, direction: -1 | 1) {
    const idx = categories.findIndex((c) => c.id === cat.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= categories.length) return;
    const swapWith = categories[swapIdx];

    const reordered = [...categories];
    reordered[idx] = swapWith;
    reordered[swapIdx] = cat;
    setCategories(reordered);

    await Promise.all([
      supabase.from("categories").update({ sort_order: swapIdx }).eq("id", cat.id),
      supabase.from("categories").update({ sort_order: idx }).eq("id", swapWith.id),
    ]);
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Excluir a categoria "${cat.name}"? Produtos nessa categoria ficarão sem categoria.`)) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Categorias</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-1 border border-line rounded-lg px-3 py-2 text-sm"
        />
        <button className="btn-primary rounded-full px-5 py-2 text-sm font-medium">Adicionar</button>
      </form>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : (
        <div className="bg-surface border border-line rounded-xl divide-y divide-line max-w-2xl">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button onClick={() => moveCategory(cat, -1)} disabled={i === 0} className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs leading-none">
                  ▲
                </button>
                <button onClick={() => moveCategory(cat, 1)} disabled={i === categories.length - 1} className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs leading-none">
                  ▼
                </button>
              </div>
              <input
                value={cat.name}
                onChange={(e) => renameCategory(cat, e.target.value)}
                onBlur={() => saveRename(cat)}
                className="flex-1 text-sm border-none bg-transparent focus:outline-none focus:underline"
              />
              <span className="text-xs text-ink/30">/{cat.slug}</span>
              <button
                onClick={() => toggleActive(cat)}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${cat.active ? "bg-primary" : "bg-line"}`}
                aria-label="Ativar ou desativar categoria"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${cat.active ? "left-5" : "left-0.5"}`} />
              </button>
              <button onClick={() => handleDelete(cat)} className="text-red-500 text-xs flex-shrink-0">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-ink/40 mt-4 max-w-2xl">
        Categorias desativadas deixam de aparecer no menu e nos filtros da loja, mas os produtos continuam salvos.
      </p>
    </div>
  );
}

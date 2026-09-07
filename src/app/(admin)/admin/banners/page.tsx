"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import type { Banner } from "@/lib/types";

const EMPTY: Omit<Banner, "id" | "created_at" | "sort_order"> = {
  title: "",
  subtitle: "",
  button_text: "",
  button_link: "",
  image_url: null,
  active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
    setBanners(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const maxOrder = banners.reduce((max, b) => Math.max(max, b.sort_order), 0);
    await supabase.from("banners").insert({ ...form, sort_order: maxOrder + 1 });
    setForm(EMPTY);
    setSaving(false);
    load();
  }

  async function updateBanner(banner: Banner, patch: Partial<Banner>) {
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, ...patch } : b)));
    await supabase.from("banners").update(patch).eq("id", banner.id);
  }

  async function moveBanner(banner: Banner, direction: -1 | 1) {
    const idx = banners.findIndex((b) => b.id === banner.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const swapWith = banners[swapIdx];
    const reordered = [...banners];
    reordered[idx] = swapWith;
    reordered[swapIdx] = banner;
    setBanners(reordered);
    await Promise.all([
      supabase.from("banners").update({ sort_order: swapIdx }).eq("id", banner.id),
      supabase.from("banners").update({ sort_order: idx }).eq("id", swapWith.id),
    ]);
  }

  async function handleDelete(banner: Banner) {
    if (!confirm("Excluir este banner?")) return;
    await supabase.from("banners").delete().eq("id", banner.id);
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Banners da home</h1>

      <div className="bg-surface border border-line rounded-xl p-5 mb-8 max-w-xl">
        <h2 className="font-medium text-sm mb-4">Adicionar novo banner</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <ImageUploader value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} label="Imagem do banner" folder="banners" />
          <input
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="border border-line rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Subtítulo"
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="border border-line rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Texto do botão"
              value={form.button_text}
              onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))}
              className="border border-line rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Link do botão (ex: /produtos?categoria=perfumes)"
              value={form.button_link}
              onChange={(e) => setForm((f) => ({ ...f, button_link: e.target.value }))}
              className="border border-line rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button disabled={saving} className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium self-start disabled:opacity-60">
            {saving ? "Salvando..." : "Adicionar banner"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {banners.map((banner, i) => (
            <div key={banner.id} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-4">
              <div className="flex flex-col">
                <button onClick={() => moveBanner(banner, -1)} disabled={i === 0} className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs">▲</button>
                <button onClick={() => moveBanner(banner, 1)} disabled={i === banners.length - 1} className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs">▼</button>
              </div>
              {banner.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={banner.image_url} alt="" className="w-24 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <input
                  value={banner.title}
                  onChange={(e) => setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, title: e.target.value } : b)))}
                  onBlur={(e) => updateBanner(banner, { title: e.target.value })}
                  className="text-sm font-medium w-full border-none bg-transparent focus:outline-none focus:underline"
                />
                <p className="text-xs text-ink/40 truncate">{banner.subtitle}</p>
              </div>
              <button
                onClick={() => updateBanner(banner, { active: !banner.active })}
                className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${banner.active ? "bg-primary" : "bg-line"}`}
                aria-label="Ativar ou desativar banner"
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${banner.active ? "left-5" : "left-0.5"}`} />
              </button>
              <button onClick={() => handleDelete(banner)} className="text-red-500 text-xs flex-shrink-0">
                Excluir
              </button>
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-ink/50">Nenhum banner cadastrado ainda.</p>}
        </div>
      )}
    </div>
  );
}

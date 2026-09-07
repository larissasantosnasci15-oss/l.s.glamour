"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import ImageUploader from "./ImageUploader";
import type { Category, Product } from "@/lib/types";

type FormState = {
  name: string;
  slug: string;
  category_id: string;
  brand: string;
  description: string;
  price: string;
  promo_price: string;
  stock: string;
  active: boolean;
  is_promo: boolean;
  is_launch: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  image_url: string | null;
};

const EMPTY_STATE: FormState = {
  name: "",
  slug: "",
  category_id: "",
  brand: "",
  description: "",
  price: "",
  promo_price: "",
  stock: "0",
  active: true,
  is_promo: false,
  is_launch: false,
  is_featured: false,
  is_bestseller: false,
  image_url: null,
};

export default function ProductForm({ product }: { product?: Product }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCategories(data ?? []));
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        category_id: product.category_id ?? "",
        brand: product.brand ?? "",
        description: product.description ?? "",
        price: String(product.price),
        promo_price: product.promo_price ? String(product.promo_price) : "",
        stock: String(product.stock),
        active: product.active,
        is_promo: product.is_promo,
        is_launch: product.is_launch,
        is_featured: product.is_featured,
        is_bestseller: product.is_bestseller,
        image_url: product.image_url,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugTouched) next.slug = slugify(value as string);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      category_id: form.category_id || null,
      brand: form.brand.trim() || null,
      description: form.description.trim(),
      price: Number(form.price.replace(",", ".")) || 0,
      promo_price: form.promo_price ? Number(form.promo_price.replace(",", ".")) : null,
      stock: parseInt(form.stock, 10) || 0,
      active: form.active,
      is_promo: form.is_promo,
      is_launch: form.is_launch,
      is_featured: form.is_featured,
      is_bestseller: form.is_bestseller,
      image_url: form.image_url,
    };

    const result = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);

    if (result.error) {
      setError(
        result.error.message.includes("duplicate")
          ? "Já existe um produto com essa URL (slug). Ajuste o nome ou a URL do produto."
          : "Não foi possível salvar o produto. Tente novamente."
      );
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-5">
      <div>
        <label className="text-xs text-ink/60 block mb-1">Nome do produto *</label>
        <input
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-ink/60 block mb-1">URL do produto (slug)</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink/40">/produto/</span>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", slugify(e.target.value));
            }}
            className="flex-1 border border-line rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink/60 block mb-1">Categoria</label>
          <select
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Marca (opcional)</label>
          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink/60 block mb-1">Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-ink/60 block mb-1">Preço (R$)</label>
          <input
            inputMode="decimal"
            placeholder="Deixe em branco se ainda não tiver o preço"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-[11px] text-ink/40 mt-1">
            Sem preço, o produto aparece na loja sem valor, com um botão para o cliente consultar pelo WhatsApp.
          </p>
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Preço promocional</label>
          <input
            inputMode="decimal"
            value={form.promo_price}
            onChange={(e) => update("promo_price", e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Estoque</label>
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <ImageUploader value={form.image_url} onChange={(url) => update("image_url", url)} label="Foto principal" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} />
          Ativo na loja
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_promo} onChange={(e) => update("is_promo", e.target.checked)} />
          Marcar como promoção
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_launch} onChange={(e) => update("is_launch", e.target.checked)} />
          Marcar como lançamento
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => update("is_featured", e.target.checked)} />
          Marcar como destaque
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_bestseller} onChange={(e) => update("is_bestseller", e.target.checked)} />
          Marcar como mais vendido
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60">
          {saving ? "Salvando..." : product ? "Salvar alterações" : "Cadastrar produto"}
        </button>
      </div>
    </form>
  );
}

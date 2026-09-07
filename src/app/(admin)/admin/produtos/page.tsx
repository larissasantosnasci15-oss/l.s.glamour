"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(*)")
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleActive(product: Product) {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p)));
    await supabase.from("products").update({ active: !product.active }).eq("id", product.id);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    await supabase.from("products").delete().eq("id", product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-primary rounded-full px-5 py-2 text-sm font-medium">
          + Novo produto
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-ink/50">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg text-ink/50 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Produto</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3">Preço</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Estoque</th>
                <th className="text-left px-4 py-3">Ativo</th>
                <th className="text-right px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <div className="flex gap-1 mt-1">
                      {product.is_promo && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full">Promoção</span>}
                      {product.is_launch && <span className="text-[10px] bg-ink text-white px-1.5 py-0.5 rounded-full">Lançamento</span>}
                      {product.is_featured && <span className="text-[10px] bg-gold text-white px-1.5 py-0.5 rounded-full">Destaque</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink/60">{product.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {product.promo_price ? (
                      <>
                        <span className="text-primary-dark font-medium">{formatPrice(product.promo_price)}</span>
                        <span className="block text-xs text-ink/40 line-through">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={product.stock <= 0 ? "text-red-500" : ""}>{product.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${product.active ? "bg-primary" : "bg-line"}`}
                      aria-label="Ativar ou desativar produto"
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                          product.active ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/produtos/${product.id}`} className="text-primary-dark text-xs mr-3">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(product)} className="text-red-500 text-xs">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import CategoryFilterBar from "./CategoryFilterBar";
import ProductSection from "./ProductSection";
import ProductCard from "./ProductCard";
import { fetchProductsClient, titleForFilters, type ClientProductFilters } from "@/lib/clientProducts";
import type { Category, Product, ProductType, Settings } from "@/lib/types";

export default function HomeCatalog({
  categories,
  types,
  settings,
  destaques,
  promos,
  launches,
  maisVendidos,
  initialFilters = {},
  initialFilteredProducts = null,
}: {
  categories: Category[];
  types: ProductType[];
  settings: Settings;
  destaques: Product[];
  promos: Product[];
  launches: Product[];
  maisVendidos: Product[];
  initialFilters?: ClientProductFilters;
  initialFilteredProducts?: Product[] | null;
}) {
  const [filters, setFilters] = useState<ClientProductFilters>(initialFilters);
  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(initialFilteredProducts);
  const [loading, setLoading] = useState(false);

  const hasActiveFilter = Boolean(filters.categoria || filters.tipo || filters.promocao || filters.lancamento);

  const handleFilterChange = useCallback(
    (patch: Partial<Record<keyof ClientProductFilters, string | null>>) => {
      setFilters((prev) => {
        const next = { ...prev };
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null) delete next[key as keyof ClientProductFilters];
          else next[key as keyof ClientProductFilters] = value;
        });

        const stillActive = Boolean(next.categoria || next.tipo || next.promocao || next.lancamento);
        if (!stillActive) {
          // Voltou pro "Todas" — some o grid filtrado e mostra de novo as
          // seções da home (Em destaque, Ofertas, Lançamentos...), sem
          // precisar buscar nada de novo.
          setFilteredProducts(null);
        } else {
          setLoading(true);
          fetchProductsClient(next, categories, types).then((data) => {
            setFilteredProducts(data);
            setLoading(false);
          });
        }

        return next;
      });
    },
    [categories, types]
  );

  return (
    <>
      <CategoryFilterBar categories={categories} types={types} filters={filters} onChange={handleFilterChange} />

      {hasActiveFilter ? (
        <div className="container-wrap pb-14 md:pb-20">
          <div className="mb-6">
            <h2 className="font-display text-2xl md:text-3xl">{titleForFilters(filters, categories)}</h2>
            <p className="text-ink/50 text-sm mt-1">
              {filteredProducts ? `${filteredProducts.length} produto(s) encontrado(s)` : "Buscando..."}
            </p>
          </div>
          <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
            {filteredProducts && filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-ink/50">
                <p>Nenhum produto encontrado com esses filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-5">
                {(filteredProducts ?? []).map((product) => (
                  <ProductCard key={product.id} product={product} whatsappNumber={settings.whatsapp_number} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <ProductSection
            title="Em destaque"
            products={destaques}
            whatsappNumber={settings.whatsapp_number}
            viewAllHref="/produtos"
          />
          <ProductSection
            title="Ofertas para você"
            products={promos}
            whatsappNumber={settings.whatsapp_number}
            viewAllHref="/?promocao=1"
            tone="neutral"
          />
          <ProductSection
            title="Lançamentos"
            products={launches}
            whatsappNumber={settings.whatsapp_number}
            viewAllHref="/?lancamento=1"
          />
          {maisVendidos.length > 0 && (
            <ProductSection
              title="Mais vendidos"
              products={maisVendidos}
              whatsappNumber={settings.whatsapp_number}
              viewAllHref="/produtos"
              tone="neutral"
            />
          )}
        </>
      )}
    </>
  );
}

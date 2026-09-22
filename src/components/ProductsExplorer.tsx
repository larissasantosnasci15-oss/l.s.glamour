"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import FiltersBar, { type ProductFiltersState } from "./FiltersBar";
import { fetchProductsClient, titleForFilters } from "@/lib/clientProducts";
import type { Category, Product, ProductType, Settings } from "@/lib/types";

export default function ProductsExplorer({
  initialProducts,
  categories,
  types,
  settings,
  initialFilters,
}: {
  initialProducts: Product[];
  categories: Category[];
  types: ProductType[];
  settings: Settings;
  initialFilters: ProductFiltersState;
}) {
  const [filters, setFilters] = useState<ProductFiltersState>(initialFilters);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Na primeira renderização já temos os produtos vindos do servidor
    // (bom pra SEO e pra carregar rápido) — só busca de novo a partir da
    // segunda vez, quando algum filtro muda.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchProductsClient(filters, categories, types).then((data) => {
      if (cancelled) return;
      setProducts(data);
      setLoading(false);
    });

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/produtos?${query}` : "/produtos");

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = useCallback(
    (patch: Partial<Record<keyof ProductFiltersState, string | null>>) => {
      setFilters((prev) => {
        const next = { ...prev };
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null) delete next[key as keyof ProductFiltersState];
          else next[key as keyof ProductFiltersState] = value;
        });
        return next;
      });
    },
    []
  );

  return (
    <div className="container-wrap py-6 md:py-7">
      <div className="mb-5">
        <h1 className="font-display text-2xl md:text-3xl">{titleForFilters(filters, categories)}</h1>
        <p className="text-ink/50 text-sm mt-1">{products.length} produto(s) encontrado(s)</p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <FiltersBar categories={categories} types={types} filters={filters} onChange={handleFilterChange} />

        <div className={`transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
          {products.length === 0 ? (
            <div className="py-20 text-center text-ink/50">
              <p>Nenhum produto encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} whatsappNumber={settings.whatsapp_number} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

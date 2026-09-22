import { createClient } from "./supabase/client";
import type { Category, Product, ProductType } from "./types";

export type ClientProductFilters = {
  categoria?: string;
  tipo?: string;
  busca?: string;
  promocao?: string;
  lancamento?: string;
  precoMin?: string;
  precoMax?: string;
};

// Busca produtos direto no navegador (mesma regra de RLS: leitura pública é
// liberada pra todo mundo). Usado pelas páginas que filtram produtos sem
// recarregar a tela — o clique num filtro só troca os produtos na hora.
export async function fetchProductsClient(
  filters: ClientProductFilters,
  categories: Category[],
  types: ProductType[]
): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, categories(*), types:product_types(*)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (filters.categoria) {
    const cat = categories.find((c) => c.slug === filters.categoria);
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (filters.tipo) {
    const type = types.find((t) => t.slug === filters.tipo);
    if (!type) return [];
    query = query.eq("type_id", type.id);
  }
  if (filters.busca) {
    query = query.or(
      `name.ilike.%${filters.busca}%,description.ilike.%${filters.busca}%,brand.ilike.%${filters.busca}%`
    );
  }
  if (filters.promocao === "1") query = query.eq("is_promo", true);
  if (filters.lancamento === "1") query = query.eq("is_launch", true);
  if (filters.precoMin) query = query.gte("price", Number(filters.precoMin));
  if (filters.precoMax) query = query.lte("price", Number(filters.precoMax));

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export function titleForFilters(filters: ClientProductFilters, categories: Category[]) {
  const activeCategory = categories.find((c) => c.slug === filters.categoria);
  if (activeCategory) return activeCategory.name;
  if (filters.promocao === "1") return "Promoções";
  if (filters.lancamento === "1") return "Lançamentos";
  if (filters.busca) return `Resultados para "${filters.busca}"`;
  return "Todos os produtos";
}

import { getCategories, getProductTypes, getProducts, getSettings } from "@/lib/data";
import ProductsExplorer from "@/components/ProductsExplorer";

export const dynamic = "force-dynamic";

type SearchParams = {
  categoria?: string;
  tipo?: string;
  busca?: string;
  promocao?: string;
  lancamento?: string;
  precoMin?: string;
  precoMax?: string;
};

export default async function ProdutosPage({ searchParams }: { searchParams: SearchParams }) {
  const [settings, categories, types] = await Promise.all([getSettings(), getCategories(), getProductTypes()]);

  const products = await getProducts({
    categorySlug: searchParams.categoria,
    typeSlug: searchParams.tipo,
    search: searchParams.busca,
    onlyPromo: searchParams.promocao === "1",
    onlyLaunch: searchParams.lancamento === "1",
    minPrice: searchParams.precoMin ? Number(searchParams.precoMin) : undefined,
    maxPrice: searchParams.precoMax ? Number(searchParams.precoMax) : undefined,
  });

  // A primeira carga da página vem pronta do servidor (bom pra SEO e pra
  // abrir rápido); a partir daí, o ProductsExplorer assume e troca os
  // produtos direto no navegador quando um filtro é clicado — sem recarregar
  // a tela inteira.
  return (
    <ProductsExplorer
      initialProducts={products}
      categories={categories}
      types={types}
      settings={settings}
      initialFilters={searchParams}
    />
  );
}

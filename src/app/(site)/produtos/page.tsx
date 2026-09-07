import { getCategories, getProducts, getSettings } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import FiltersBar from "@/components/FiltersBar";

export const dynamic = "force-dynamic";

type SearchParams = {
  categoria?: string;
  busca?: string;
  promocao?: string;
  lancamento?: string;
  precoMin?: string;
  precoMax?: string;
};

export default async function ProdutosPage({ searchParams }: { searchParams: SearchParams }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const products = await getProducts({
    categorySlug: searchParams.categoria,
    search: searchParams.busca,
    onlyPromo: searchParams.promocao === "1",
    onlyLaunch: searchParams.lancamento === "1",
    minPrice: searchParams.precoMin ? Number(searchParams.precoMin) : undefined,
    maxPrice: searchParams.precoMax ? Number(searchParams.precoMax) : undefined,
  });

  const activeCategory = categories.find((c) => c.slug === searchParams.categoria);

  return (
    <div className="container-wrap py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">
          {activeCategory ? activeCategory.name : searchParams.busca ? `Resultados para "${searchParams.busca}"` : "Todos os produtos"}
        </h1>
        <p className="text-ink/50 text-sm mt-1">{products.length} produto(s) encontrado(s)</p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <FiltersBar categories={categories} searchParams={searchParams} />

        {products.length === 0 ? (
          <div className="py-20 text-center text-ink/50">
            <p>Nenhum produto encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} whatsappNumber={settings.whatsapp_number} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

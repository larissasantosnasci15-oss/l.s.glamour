import { getBanners, getCategories, getProductTypes, getProducts, getSettings } from "@/lib/data";
import BannerCarousel from "@/components/BannerCarousel";
import HomeCatalog from "@/components/HomeCatalog";
import { WhatsAppCTA, InstagramSection } from "@/components/CallToActionSections";
import type { ClientProductFilters } from "@/lib/clientProducts";

export const dynamic = "force-dynamic";

type SearchParams = {
  categoria?: string;
  tipo?: string;
  promocao?: string;
  lancamento?: string;
};

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const initialFilters: ClientProductFilters = {
    categoria: searchParams.categoria,
    tipo: searchParams.tipo,
    promocao: searchParams.promocao,
    lancamento: searchParams.lancamento,
  };
  const hasInitialFilter = Boolean(
    initialFilters.categoria || initialFilters.tipo || initialFilters.promocao || initialFilters.lancamento
  );

  const [settings, banners, categories, types, featured, promos, launches, bestsellers, initialFilteredProducts] =
    await Promise.all([
      getSettings(),
      getBanners(),
      getCategories(),
      getProductTypes(),
      getProducts({ limit: 8 }),
      getProducts({ onlyPromo: true, limit: 8 }),
      getProducts({ onlyLaunch: true, limit: 8 }),
      getProducts({ limit: 8 }),
      hasInitialFilter
        ? getProducts({
            categorySlug: initialFilters.categoria,
            typeSlug: initialFilters.tipo,
            onlyPromo: initialFilters.promocao === "1",
            onlyLaunch: initialFilters.lancamento === "1",
          })
        : Promise.resolve(null),
    ]);

  const destaques = featured.filter((p) => p.is_featured).slice(0, 8);
  const maisVendidos = bestsellers.filter((p) => p.is_bestseller).slice(0, 8);

  // O banner fica fora do HomeCatalog de propósito: ele é renderizado pelo
  // servidor uma vez só e nunca é recriado, então quando alguém clica num
  // filtro de categoria/tipo (ou chega direto pelo menu com um filtro na
  // URL), só a parte de baixo (o HomeCatalog) troca — a página continua a
  // mesma, com o banner sempre visível.
  return (
    <>
      <BannerCarousel banners={banners} />
      <HomeCatalog
        categories={categories}
        types={types}
        settings={settings}
        destaques={destaques.length ? destaques : featured}
        promos={promos}
        launches={launches}
        maisVendidos={maisVendidos}
        initialFilters={initialFilters}
        initialFilteredProducts={initialFilteredProducts}
      />
      <WhatsAppCTA settings={settings} />
      <InstagramSection settings={settings} />
    </>
  );
}

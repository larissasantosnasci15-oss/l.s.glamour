import { getBanners, getCategories, getProducts, getSettings } from "@/lib/data";
import BannerCarousel from "@/components/BannerCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import ProductSection from "@/components/ProductSection";
import { WhatsAppCTA, InstagramSection } from "@/components/CallToActionSections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, banners, categories, featured, promos, launches, bestsellers] = await Promise.all([
    getSettings(),
    getBanners(),
    getCategories(),
    getProducts({ limit: 8 }),
    getProducts({ onlyPromo: true, limit: 8 }),
    getProducts({ onlyLaunch: true, limit: 8 }),
    getProducts({ limit: 8 }),
  ]);

  const destaques = featured.filter((p) => p.is_featured).slice(0, 8);
  const maisVendidos = bestsellers.filter((p) => p.is_bestseller).slice(0, 8);

  return (
    <>
      <BannerCarousel banners={banners} />
      <CategoryGrid categories={categories} />
      <ProductSection
        title="Em destaque"
        products={destaques.length ? destaques : featured}
        whatsappNumber={settings.whatsapp_number}
        viewAllHref="/produtos"
      />
      <ProductSection
        title="Ofertas para você"
        products={promos}
        whatsappNumber={settings.whatsapp_number}
        viewAllHref="/produtos?promocao=1"
        tone="neutral"
      />
      <ProductSection
        title="Lançamentos"
        products={launches}
        whatsappNumber={settings.whatsapp_number}
        viewAllHref="/produtos?lancamento=1"
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
      <WhatsAppCTA settings={settings} />
      <InstagramSection settings={settings} />
    </>
  );
}

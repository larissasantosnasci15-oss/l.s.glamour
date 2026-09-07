import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getSettings } from "@/lib/data";
import { formatPrice, productWhatsAppLink } from "@/lib/whatsapp";
import AddToCartButton from "@/components/AddToCartButton";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description?.slice(0, 150),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 150),
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, settings] = await Promise.all([getProductBySlug(params.slug), getSettings()]);
  if (!product) notFound();

  const finalPrice = product.promo_price ?? product.price;
  const outOfStock = product.stock <= 0;
  const gallery = product.images?.length ? product.images : product.image_url ? [product.image_url] : [];

  return (
    <div className="container-wrap py-10 md:py-14">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/">Início</Link> /{" "}
        {product.categories && (
          <>
            <Link href={`/produtos?categoria=${product.categories.slug}`}>{product.categories.name}</Link> /{" "}
          </>
        )}
        <span className="text-ink/80">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface border border-line">
            {gallery[0] ? (
              <Image src={gallery[0]} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-2xl text-ink/30">
                {product.name}
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {gallery.slice(1).map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-line">
                  <Image src={src} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.categories?.name && (
            <span className="text-xs uppercase tracking-wide text-primary-dark">{product.categories.name}</span>
          )}
          <h1 className="font-display text-3xl md:text-4xl mt-2 mb-3">{product.name}</h1>

          <div className="flex gap-2 mb-4">
            {product.is_promo && (
              <span className="bg-primary text-white text-[11px] px-2 py-1 rounded-full">Promoção</span>
            )}
            {product.is_launch && <span className="bg-ink text-white text-[11px] px-2 py-1 rounded-full">Lançamento</span>}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            {product.promo_price ? (
              <>
                <span className="text-2xl font-semibold text-primary-dark">{formatPrice(product.promo_price)}</span>
                <span className="text-base text-ink/40 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-sm text-ink/70 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>

          <p className="text-sm mb-6">
            {outOfStock ? (
              <span className="text-red-500">Produto esgotado no momento</span>
            ) : (
              <span className="text-green-700">Em estoque</span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <a
              href={productWhatsAppLink(settings.whatsapp_number, product)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 text-center rounded-full py-3.5 text-sm font-medium"
            >
              Comprar pelo WhatsApp
            </a>
            <AddToCartButton
              product={{ id: product.id, name: product.name, slug: product.slug, price: finalPrice, image_url: product.image_url }}
              disabled={outOfStock}
            />
          </div>

          <ShareButton title={product.name} />

          <div className="hairline my-8" />

          <details className="text-sm text-ink/70 mb-2">
            <summary className="cursor-pointer font-medium text-ink">Pagamento</summary>
            <p className="mt-2 whitespace-pre-line">{settings.payment_info || "Consulte formas de pagamento com a loja."}</p>
          </details>
          <details className="text-sm text-ink/70 mb-2">
            <summary className="cursor-pointer font-medium text-ink">Frete e entrega</summary>
            <p className="mt-2 whitespace-pre-line">{settings.shipping_info || "Consulte prazos e valores de frete com a loja."}</p>
          </details>
          <details className="text-sm text-ink/70">
            <summary className="cursor-pointer font-medium text-ink">Política de troca</summary>
            <p className="mt-2 whitespace-pre-line">{settings.exchange_policy || "Consulte a política de troca com a loja."}</p>
          </details>
        </div>
      </div>
    </div>
  );
}

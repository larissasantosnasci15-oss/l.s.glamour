"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product, Settings } from "@/lib/types";
import { formatPrice, productWhatsAppLink } from "@/lib/whatsapp";
import { useCart } from "@/context/CartContext";

export default function ProductCard({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: Settings["whatsapp_number"];
}) {
  const { addItem } = useCart();
  const finalPrice = product.promo_price ?? product.price;
  const hasPrice = finalPrice > 0;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col">
      <Link href={`/produto/${product.slug}`} className="relative block aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-line">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-display text-lg">
            {product.name}
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_promo && (
            <span className="bg-primary text-white text-[10px] tracking-wide px-2 py-1 rounded-full">Promoção</span>
          )}
          {product.is_launch && (
            <span className="bg-ink text-white text-[10px] tracking-wide px-2 py-1 rounded-full">Lançamento</span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-ink/70">
            Esgotado
          </div>
        )}
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        {product.categories?.name && (
          <span className="text-[11px] text-ink/45">{product.categories.name}</span>
        )}
        <Link href={`/produto/${product.slug}`} className="text-sm font-medium leading-snug line-clamp-2 hover:text-primary">
          {product.name}
        </Link>
        {hasPrice && (
          <div className="flex items-baseline gap-2">
            {product.promo_price ? (
              <>
                <span className="text-sm font-semibold text-primary-dark">{formatPrice(product.promo_price)}</span>
                <span className="text-xs text-ink/40 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-ink">{formatPrice(product.price)}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <a
            href={productWhatsAppLink(whatsappNumber, product)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs border border-primary text-primary-dark rounded-full py-2 hover:bg-primary hover:text-white transition-colors"
          >
            {hasPrice ? "Comprar no WhatsApp" : "Consultar no WhatsApp"}
          </a>
          {hasPrice && (
            <button
              disabled={outOfStock}
              onClick={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: finalPrice,
                  image_url: product.image_url,
                })
              }
              className="text-xs border border-line rounded-full px-3 py-2 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Adicionar à sacola"
            >
              +Sacola
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

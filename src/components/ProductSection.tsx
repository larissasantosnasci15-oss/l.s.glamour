import Link from "next/link";
import type { Product, Settings } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductSection({
  title,
  products,
  whatsappNumber,
  viewAllHref,
  tone = "light",
}: {
  title: string;
  products: Product[];
  whatsappNumber: Settings["whatsapp_number"];
  viewAllHref?: string;
  tone?: "light" | "neutral";
}) {
  if (products.length === 0) return null;

  return (
    <section className={tone === "neutral" ? "bg-surface" : ""}>
      <div className="container-wrap py-14 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm text-primary-dark hover:underline underline-offset-4 hidden sm:inline">
              Ver mais
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
          ))}
        </div>
      </div>
    </section>
  );
}

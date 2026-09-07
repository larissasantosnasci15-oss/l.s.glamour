"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/types";

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="container-wrap pt-8 md:pt-12">
        <div className="relative rounded-2xl bg-primary-light aspect-[16/10] md:aspect-[21/9] flex items-center justify-center overflow-hidden">
          <div className="text-center px-6">
            <p className="font-display text-3xl md:text-5xl text-ink mb-3">Sua elegância em cada detalhe</p>
            <p className="text-ink/70 text-sm md:text-base">
              Cadastre um banner no painel administrativo para personalizar esta vitrine.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[index];

  return (
    <section className="container-wrap pt-8 md:pt-12">
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] md:aspect-[21/9] bg-primary-light">
        {banner.image_url && (
          <Image src={banner.image_url} alt={banner.title} fill priority className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-14 text-white">
          {banner.title && <h1 className="font-display text-3xl md:text-5xl max-w-xl">{banner.title}</h1>}
          {banner.subtitle && <p className="mt-2 md:mt-3 max-w-md text-sm md:text-base text-white/90">{banner.subtitle}</p>}
          {banner.button_text && banner.button_link && (
            <Link
              href={banner.button_link}
              className="mt-5 inline-block bg-white text-ink text-sm px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              {banner.button_text}
            </Link>
          )}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`Ir para o banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const PAGES: Record<string, { title: string; field: "exchange_policy" | "privacy_policy" | "shipping_info" }> = {
  troca: { title: "Política de troca", field: "exchange_policy" },
  privacidade: { title: "Política de privacidade", field: "privacy_policy" },
  "pagamento-frete": { title: "Pagamento e frete", field: "shipping_info" },
};

export default async function PolicyPage({ params }: { params: { slug: string } }) {
  const page = PAGES[params.slug];
  if (!page) notFound();
  const settings = await getSettings();
  const content = settings[page.field];

  return (
    <div className="container-wrap py-14 max-w-2xl">
      <h1 className="font-display text-3xl md:text-4xl mb-6">{page.title}</h1>
      <div className="text-sm text-ink/70 leading-relaxed whitespace-pre-line">
        {content || "Esta seção ainda não foi preenchida pela loja. Fale conosco pelo WhatsApp para mais informações."}
      </div>
      {page.field === "shipping_info" && settings.payment_info && (
        <>
          <h2 className="font-display text-2xl mt-10 mb-4">Formas de pagamento</h2>
          <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-line">{settings.payment_info}</p>
        </>
      )}
    </div>
  );
}

import type { Settings } from "@/lib/types";
import { genericWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppCTA({ settings }: { settings: Settings }) {
  return (
    <section className="bg-primary text-white">
      <div className="container-wrap py-14 md:py-16 text-center">
        <h2 className="font-display text-3xl md:text-4xl mb-3">Ficou com alguma dúvida?</h2>
        <p className="text-white/85 max-w-lg mx-auto mb-7 text-sm md:text-base">
          Fale direto com a {settings.store_name} pelo WhatsApp e receba atendimento personalizado.
        </p>
        <a
          href={genericWhatsAppLink(settings.whatsapp_number, settings.store_name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-primary-dark px-7 py-3 rounded-full text-sm font-medium hover:bg-ink hover:text-white transition-colors"
        >
          Falar com a loja
        </a>
      </div>
    </section>
  );
}

export function InstagramSection({ settings }: { settings: Settings }) {
  if (!settings.instagram) return null;
  const handle = settings.instagram.replace("https://instagram.com/", "").replace("@", "");
  const href = settings.instagram.startsWith("http") ? settings.instagram : `https://instagram.com/${handle}`;

  return (
    <section className="container-wrap py-14 md:py-20 text-center">
      <h2 className="font-display text-3xl md:text-4xl mb-3">Siga a {settings.store_name}</h2>
      <p className="text-ink/60 mb-6 text-sm md:text-base">Novidades, bastidores e lançamentos em primeira mão.</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-primary text-primary-dark rounded-full px-6 py-3 text-sm hover:bg-primary hover:text-white transition-colors"
      >
        @{handle}
      </a>
    </section>
  );
}

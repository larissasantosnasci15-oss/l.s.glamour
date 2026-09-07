import Link from "next/link";
import type { Settings } from "@/lib/types";

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="bg-ink text-bg mt-20">
      <div className="container-wrap py-14 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl mb-3">{settings.store_name}</p>
          <p className="text-sm text-bg/70 leading-relaxed">
            {settings.slogan || settings.description}
          </p>
          {settings.instagram && (
            <a
              href={
                settings.instagram.startsWith("http")
                  ? settings.instagram
                  : `https://instagram.com/${settings.instagram.replace("@", "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-gold hover:underline underline-offset-4"
            >
              Siga no Instagram
            </a>
          )}
        </div>

        <div>
          <p className="text-sm tracking-wide text-bg/50 mb-3">Loja</p>
          <ul className="flex flex-col gap-2 text-sm text-bg/80">
            <li><Link href="/produtos">Todos os produtos</Link></li>
            <li><Link href="/produtos?promocao=1">Promoções</Link></li>
            <li><Link href="/produtos?lancamento=1">Lançamentos</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm tracking-wide text-bg/50 mb-3">Atendimento</p>
          <ul className="flex flex-col gap-2 text-sm text-bg/80">
            {settings.hours && <li>{settings.hours}</li>}
            {settings.email && <li>{settings.email}</li>}
            {settings.address && <li>{settings.address}</li>}
          </ul>
        </div>

        <div>
          <p className="text-sm tracking-wide text-bg/50 mb-3">Políticas</p>
          <ul className="flex flex-col gap-2 text-sm text-bg/80">
            <li><Link href="/politicas/troca">Política de troca</Link></li>
            <li><Link href="/politicas/privacidade">Privacidade</Link></li>
            <li><Link href="/politicas/pagamento-frete">Pagamento e frete</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-bg/40">
        © {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}

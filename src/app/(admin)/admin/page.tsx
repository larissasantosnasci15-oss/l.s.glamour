import Link from "next/link";
import { getAllProductsAdmin, getAllCategoriesAdmin, getAllBannersAdmin, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, categories, banners, settings] = await Promise.all([
    getAllProductsAdmin(),
    getAllCategoriesAdmin(),
    getAllBannersAdmin(),
    getSettings(),
  ]);

  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const active = products.filter((p) => p.active).length;

  const cards = [
    { label: "Produtos cadastrados", value: products.length, href: "/admin/produtos" },
    { label: "Produtos ativos", value: active, href: "/admin/produtos" },
    { label: "Sem estoque", value: outOfStock, href: "/admin/produtos" },
    { label: "Categorias", value: categories.length, href: "/admin/categorias" },
    { label: "Banners ativos", value: banners.filter((b) => b.active).length, href: "/admin/banners" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-1">Olá! 👋</h1>
      <p className="text-ink/60 text-sm mb-8">
        Painel da {settings.store_name}. Aqui você gerencia produtos, categorias, banners e as configurações da loja.
      </p>

      {!settings.whatsapp_number && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-8">
          Você ainda não configurou o número de WhatsApp da loja.{" "}
          <Link href="/admin/configuracoes" className="underline underline-offset-2">
            Configure agora
          </Link>{" "}
          para que os botões de compra funcionem.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-surface border border-line rounded-xl p-5 hover:border-primary transition-colors">
            <p className="text-3xl font-display">{card.value}</p>
            <p className="text-xs text-ink/50 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/produtos/novo" className="btn-primary rounded-xl px-5 py-4 text-sm font-medium block text-center">
          + Adicionar novo produto
        </Link>
        <Link href="/admin/banners" className="border border-primary text-primary-dark rounded-xl px-5 py-4 text-sm font-medium block text-center hover:bg-primary hover:text-white transition-colors">
          Gerenciar banners da home
        </Link>
      </div>
    </div>
  );
}

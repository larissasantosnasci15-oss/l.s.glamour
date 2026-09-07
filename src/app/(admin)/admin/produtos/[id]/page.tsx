import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("products").select("*, categories(*)").eq("id", params.id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Editar produto</h1>
      <ProductForm product={data as Product} />
    </div>
  );
}

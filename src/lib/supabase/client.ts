import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente do Supabase para uso no navegador (componentes "use client").
 * As chaves usadas aqui são a URL do projeto e a "anon key" pública —
 * é seguro expô-las no frontend, pois o acesso de escrita é controlado
 * pelas políticas de RLS (Row Level Security) definidas em
 * supabase/schema.sql, que só permitem escrita a usuários autenticados.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

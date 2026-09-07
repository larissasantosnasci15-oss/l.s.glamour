/**
 * Cria (ou redefine a senha de) o usuário administrador da loja.
 *
 * Uso:
 *   ADMIN_EMAIL="voce@exemplo.com" ADMIN_PASSWORD="uma-senha-forte" npm run create-admin
 *
 * Requer as variáveis de ambiente definidas em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (pegue em Supabase > Project Settings > API — NUNCA
 *                               coloque essa chave no frontend nem no GitHub)
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !serviceKey) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
    process.exit(1);
  }
  if (!email || !password) {
    console.error(
      'Informe o e-mail e a senha do administrador. Exemplo:\n  ADMIN_EMAIL="voce@exemplo.com" ADMIN_PASSWORD="senha-forte" npm run create-admin'
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("A senha precisa ter pelo menos 8 caracteres.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email === email);

  if (found) {
    const { error } = await supabase.auth.admin.updateUserById(found.id, { password });
    if (error) {
      console.error("Erro ao atualizar a senha:", error.message);
      process.exit(1);
    }
    console.log(`Senha atualizada para o administrador existente: ${email}`);
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("Erro ao criar administrador:", error.message);
    process.exit(1);
  }

  console.log(`Administrador criado com sucesso: ${email}`);
  console.log("Acesse /admin/login no site com esse e-mail e senha.");
}

main();

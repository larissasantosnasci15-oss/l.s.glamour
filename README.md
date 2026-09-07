# L.S.GLAMOUR — site + loja virtual + painel administrativo

Site institucional/loja para a **L.S.GLAMOUR**, com catálogo de produtos, carrinho com
finalização pelo WhatsApp e um painel administrativo (`/admin`) para gerenciar tudo
sem mexer em código: produtos, categorias, banners e configurações da loja.

- **Frontend + backend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Banco de dados, autenticação e imagens**: Supabase (Postgres + Auth + Storage)
- **Hospedagem recomendada**: Vercel (grátis, domínio fixo, feito para Next.js)

> Este guia foi escrito para quem **nunca publicou um site**. Siga a ordem exata dos
> passos. Onde houver um comando, copie e cole exatamente como está.

---

## Índice

0. [Como funcionam as alterações "online"](#0-como-funcionam-as-alterações-online)
1. [Visão geral do que foi entregue](#1-visão-geral-do-que-foi-entregue)
2. [Criar o banco de dados (Supabase)](#2-criar-o-banco-de-dados-supabase)
3. [Rodar o site no seu computador (opcional, para testar antes de publicar)](#3-rodar-o-site-no-seu-computador)
4. [Criar seu usuário administrador](#4-criar-seu-usuário-administrador)
5. [Publicar o site (GitHub + Netlify)](#5-publicar-o-site-github--netlify)
6. [Conectar seu domínio (ex: www.lsglamour.com.br)](#6-conectar-seu-domínio)
7. [Como usar o painel administrativo](#7-como-usar-o-painel-administrativo)
8. [Perguntas frequentes](#8-perguntas-frequentes)
9. [O que fica pronto para o futuro (frete, etc.)](#9-o-que-fica-pronto-para-o-futuro)
10. [Limitações desta primeira versão](#10-limitações-desta-primeira-versão)

---

## 0. Como funcionam as alterações "online"

Existem dois tipos de mudança, e cada um funciona de um jeito:

- **Conteúdo do dia a dia** (preços, fotos de produto, estoque, banners, textos,
  WhatsApp, cores, fonte) → feito **direto no painel `/admin`**, no site já
  publicado, sem precisar de mim nem de código. É instantâneo e não muda a URL.
- **Design ou funcionamento do site** (layout, uma seção nova, uma regra de
  negócio diferente) → continue me pedindo aqui, no chat. Eu edito os arquivos e
  te devolvo o projeto atualizado (ou, se preferir manter tudo integrado, você
  pode me colar os arquivos num repositório GitHub e eu aviso exatamente o que
  mudar); depois disso, um `git push` no GitHub atualiza o site publicado
  automaticamente, sem trocar o link.

A identidade visual (cores, tipografia e o nome/slogan da loja) já foi ajustada
neste projeto para combinar com a logo que você enviou — veja a seção 1.1.

## 1. Visão geral do que foi entregue

### 1.1 Identidade visual (a partir da sua logo)

- **Cores padrão**: rosa bebê suave de fundo (`#FBD7E6`) e preto/quase-preto para
  textos e botões (`#221E1F`), reproduzindo o contraste da sua logo. Tudo isso é
  editável em `/admin/configuracoes → Aparência`.
- **Tipografia padrão**: título em **Bodoni Moda** (serifa de alto contraste,
  parecida com o monograma "LS") e texto em **Manrope** (sã limpa e legível).
  Também editável no painel, com mais duas opções de combinação de fontes.
- **Nome e slogan padrão**: "L.S.Glamour" e "Sua beleza, seu estilo, seu
  glamour.", iguais ao que está na sua logo (ajustável no painel a qualquer
  momento).
- **Logo**: o arquivo que você enviou já está em `public/brand/lsglamour-logo.png`
  e é usado como logo do cabeçalho e como ícone/favicon do site enquanto você não
  enviar um logo próprio pelo painel (`/admin/configuracoes`). Quando você
  enviar um logo pelo painel, ele passa a valer no lugar deste.


- Site público responsivo (celular, tablet, desktop), com: página inicial (banner,
  categorias, destaques, ofertas, lançamentos, mais vendidos, chamada de WhatsApp,
  Instagram), listagem de produtos com busca e filtros, página individual de cada
  produto (com link para compartilhar), carrinho com finalização via WhatsApp e
  páginas de políticas (troca, privacidade, pagamento/frete).
- Botão flutuante de WhatsApp em todas as páginas + botões "Comprar pelo WhatsApp"
  em cada produto, todos usando **um único número**, configurado em
  `/admin/configuracoes`.
- Painel administrativo em `/admin`, protegido por login (e-mail/senha), com:
  - **Produtos**: cadastrar, editar, excluir, ativar/desativar, marcar como
    promoção/lançamento/destaque/mais vendido, foto, preço, preço promocional,
    estoque, categoria.
  - **Categorias**: criar, renomear, reordenar, ativar/desativar, excluir. Já vem
    com as categorias da loja (Perfumes, Body Splash, Skincare, Cabelos, Roupas,
    Semijoias, Bolsas, Promoções, Lançamentos).
  - **Banners** da home: imagem, título, subtítulo, botão, link, ordem,
    ativar/desativar.
  - **Configurações**: nome da loja, slogan, descrição, logo, favicon, WhatsApp,
    Instagram, TikTok, e-mail, endereço, horário, textos de pagamento/frete/
    trocas/privacidade, cores e fonte do site.
- Nenhuma dessas informações fica "no código": tudo é lido do banco de dados
  (Supabase) a cada visita, então alterar o painel **nunca muda a URL principal**
  do site nem exige um novo deploy.

---

## 2. Criar o banco de dados (Supabase)

1. Acesse **https://supabase.com**, crie uma conta gratuita e clique em
   **New Project**.
2. Escolha um nome (ex: `lsglamour`), uma senha para o banco (guarde-a) e a região
   mais próxima (ex: São Paulo/`sa-east-1`, se disponível). Clique em **Create**.
3. Espere o projeto ficar pronto (1–2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste projeto,
   copie **todo o conteúdo** e cole no editor do Supabase.
6. Clique em **Run**. Isso cria todas as tabelas (produtos, categorias, banners,
   configurações), já com as categorias iniciais da loja, as regras de segurança e
   o espaço para guardar imagens.
7. Vá em **Project Settings → API** e anote dois valores, que serão usados no
   próximo passo:
   - **Project URL** → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (na mesma página, marcada como secreta) → vai virar
     `SUPABASE_SERVICE_ROLE_KEY`. **Nunca compartilhe essa chave nem a coloque no
     GitHub.**

---

## 3. Rodar o site no seu computador

Só é necessário se você quiser testar antes de publicar. Requer
[Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

```bash
# 1. instale as dependências
npm install

# 2. copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env.local

# 3. abra .env.local e preencha com os 3 valores que você anotou no passo 2:
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#    SUPABASE_SERVICE_ROLE_KEY=...

# 4. rode o site
npm run dev
```

Abra **http://localhost:3000** no navegador. O painel fica em
**http://localhost:3000/admin**.

---

## 4. Criar seu usuário administrador

O login do painel usa o sistema de autenticação do Supabase. Crie o primeiro (e,
se quiser, único) usuário administrador rodando, no terminal, dentro da pasta do
projeto:

```bash
ADMIN_EMAIL="seuemail@exemplo.com" ADMIN_PASSWORD="uma-senha-forte-aqui" npm run create-admin
```

Isso usa a `SUPABASE_SERVICE_ROLE_KEY` do seu `.env.local` para criar o usuário
diretamente no Supabase — funciona tanto rodando localmente quanto depois do site
publicado (o comando fala direto com o Supabase, não com o site). Guarde bem esse
e-mail e senha: é o login de `/admin/login`.

Quer trocar a senha depois? Rode o mesmo comando de novo com a nova senha, ou vá
em **Supabase → Authentication → Users** e clique em "Reset password".

---

## 5. Publicar o site (GitHub + Netlify)

Este projeto já vem configurado para o **Netlify** (arquivo `netlify.toml` com o
plugin oficial `@netlify/plugin-nextjs`), como você pediu. O Netlify tem plano
gratuito suficiente para esta loja e, assim como no Cloudflare Pages, uma vez que
você conecta um domínio próprio a URL de produção fica **fixa** — nenhuma
atualização de conteúdo ou novo deploy muda essa URL.

> Importante: eu (Claude) não tenho como criar contas em serviços externos por
> você nem gerar um link de hospedagem já no ar — isso depende de uma conta sua
> no GitHub, no Netlify e no Supabase. O que fiz foi deixar o projeto 100% pronto
> para que esses passos sejam apenas alguns cliques, sem precisar editar código.

### 5.1 Subir o projeto para o GitHub

```bash
git init
git add .
git commit -m "Site L.S.Glamour"
```

Crie um repositório novo (vazio) em **https://github.com/new**, depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/lsglamour.git
git branch -M main
git push -u origin main
```

### 5.2 Publicar no Netlify

1. Acesse **https://netlify.com**, crie uma conta gratuita (pode entrar com o
   GitHub).
2. Clique em **Add new site → Import an existing project** e escolha o
   repositório `lsglamour` no GitHub.
3. O Netlify já vai detectar o `netlify.toml` e configurar o build sozinho
   (`npm run build`). Não precisa mudar nada nessa tela.
4. Antes de clicar em publicar, abra **Environment variables** (ou depois em
   **Site configuration → Environment variables**) e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → coloque a URL que o Netlify vai gerar (ex.:
     `https://lsglamour.netlify.app`) ou já o seu domínio final, se souber.
   - (Não é necessário colocar `SUPABASE_SERVICE_ROLE_KEY` no Netlify — ela só é
     usada no comando `create-admin`, rodado no seu computador.)
5. Clique em **Deploy site**. Em 1–3 minutos o link estará no ar, algo como
   `https://lsglamour.netlify.app` — esse é o "link pronto" que você pediu; você
   pode renomeá-lo em **Site configuration → Site details → Change site name**
   antes mesmo de ter um domínio próprio.

Depois disso, sempre que o **código** do site mudar (não o conteúdo — isso é
feito pelo painel), basta enviar a mudança para o GitHub (`git push`) que o
Netlify publica automaticamente, mantendo o mesmo link.

---

## 6. Conectar seu domínio

1. Compre o domínio (ex: `lsglamour.com.br`) em um registrador como Registro.br.
2. No painel do Netlify, abra o site → **Domain management** → **Add a domain**
   → digite `www.lsglamour.com.br`.
3. O Netlify mostrará o registro DNS a criar (um `CNAME` apontando `www` para o
   endereço `xxxx.netlify.app`, e uma opção de redirecionamento do domínio raiz).
4. Vá até o painel do seu registrador de domínio, na área de **DNS**, e crie
   exatamente esse registro.
5. Aguarde a propagação (de alguns minutos a algumas horas). O Netlify emite o
   certificado HTTPS automaticamente, sem custo.

A partir daqui, `www.lsglamour.com.br` é a URL permanente do site. Produtos,
preços, banners e textos alterados pelo painel aparecem nessa mesma URL — ela
nunca muda.

---

## 7. Como usar o painel administrativo

Acesse `https://SEU-DOMINIO/admin/login` e entre com o e-mail e senha criados no
passo 4.

- **Cadastrar um produto**: `/admin/produtos` → **+ Novo produto** → preencha
  nome, categoria, descrição, preço (e preço promocional se houver), estoque,
  envie uma foto e marque as opções desejadas (promoção, lançamento, destaque,
  mais vendido) → **Cadastrar produto**.
- **Editar preço, estoque ou foto**: `/admin/produtos` → clique em **Editar** no
  produto → altere o campo → **Salvar alterações**.
- **Ativar/desativar um produto** sem excluí-lo: use o interruptor na coluna
  "Ativo" da lista de produtos.
- **Alterar banners da home**: `/admin/banners` → adicione um novo ou edite/
  reordene/ative os existentes com as setas ▲▼.
- **Trocar o número de WhatsApp, Instagram, cores, fonte, textos de pagamento/
  frete/trocas**: `/admin/configuracoes` → altere os campos → **Salvar
  configurações**.
- **Criar uma nova categoria**: `/admin/categorias` → digite o nome → **Adicionar**.

Todas essas alterações aparecem no site em poucos segundos, sem precisar de novo
deploy e sem alterar a URL do site.

---

## 8. Perguntas frequentes

**Preciso pagar alguma coisa?** Não, no plano de uso descrito aqui: Supabase e
Vercel têm planos gratuitos suficientes para uma loja começando. O único custo é
o domínio (geralmente ~R$40/ano em registradores como o Registro.br).

**Posso ter mais de um administrador?** Sim — rode `npm run create-admin` de novo
com outro e-mail, ou crie usuários direto em Supabase → Authentication → Users.
Qualquer usuário criado ali consegue entrar em `/admin`.

**E se eu esquecer a senha do painel?** Rode `npm run create-admin` novamente com
o mesmo e-mail e uma senha nova, ou redefina em Supabase → Authentication → Users.

**Onde ficam as fotos que eu envio pelo painel?** No Supabase Storage, dentro do
bucket `images`, organizadas em pastas (`produtos`, `banners`, `loja`).

---

## 9. O que fica pronto para o futuro

- **Frete por CEP**: a tela do carrinho já mostra o aviso "frete calculado na
  finalização com a loja" e a estrutura de dados foi pensada para, quando você
  quiser, plugar uma API de frete (Correios, Melhor Envio etc.) sem precisar
  reescrever o site.
- **Pagamento online**: por pedido do briefing, esta primeira versão finaliza
  o pedido pelo WhatsApp. A estrutura (produtos com preço/estoque centralizados
  no banco) já está pronta para, no futuro, adicionar um checkout de pagamento.

---

## 10. Limitações desta primeira versão

Para ser transparente sobre o que foi priorizado:

- A busca e os filtros cobrem nome, categoria, marca, preço, promoção e
  lançamento, exatamente como pedido; um filtro dedicado "por marca" pode ser
  adicionado facilmente mais tarde caso o catálogo cresça e isso vire necessário.
- O painel usa um único nível de acesso ("administrador"); não há hoje perfis
  diferentes (ex: um funcionário que só cadastra produtos, mas não mexe em
  configurações).
- Testes foram feitos via build de produção (`npm run build`, sem erros) e
  revisão de cada fluxo (login, CRUD de produtos/categorias/banners,
  configurações, carrinho, busca/filtros); um teste manual final em
  dispositivos reais após a publicação é sempre recomendado.

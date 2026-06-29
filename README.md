# K&C STORE

E-commerce de moda masculina, feminina e infantil com storefront premium,
elementos 3D leves, painel administrativo, PostgreSQL, Mercado Pago, Melhor
Envio, Cloudinary, Resend e geracao de descricoes com OpenAI.

## Stack

- Next.js 16, React 19, TypeScript e Tailwind CSS 4
- Framer Motion, React Three Fiber e Zustand
- Prisma 7 e PostgreSQL
- Auth.js com credenciais e Argon2id
- Mercado Pago Checkout Pro
- Melhor Envio, Cloudinary, Resend, OpenAI e Sentry
- Vitest e Playwright

## Desenvolvimento local

1. Instale Node.js 24 e PostgreSQL.
2. Copie `.env.example` para `.env`.
3. Preencha `DATABASE_URL`, `AUTH_SECRET`, `OWNER_EMAIL` e `OWNER_PASSWORD`.
4. Instale e prepare o projeto:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Inicie:

```bash
npm run dev
```

Sem `DATABASE_URL`, configure `PREVIEW_ADMIN_EMAIL`,
`PREVIEW_ADMIN_PASSWORD` e `AUTH_SECRET` para ativar o painel temporario. Nesse
modo, produtos e imagens ficam na maquina que executa o site, mas checkout e
pagamentos reais permanecem desativados.

Na Vercel sem banco/Cloudinary, configure `GITHUB_CONTENT_TOKEN`,
`GITHUB_CONTENT_REPO` e `GITHUB_CONTENT_BRANCH` para o painel salvar produtos e
imagens no repositorio como fallback persistente.

## Mercado Pago

O dinheiro das vendas e direcionado para a conta Mercado Pago proprietaria do
Access Token de producao configurado no servidor.

1. Crie ou abra uma aplicacao em
   `https://www.mercadopago.com.br/developers/panel/app`.
2. Comece com as credenciais de teste e valide o fluxo completo.
3. No Render, cadastre `MERCADO_PAGO_ACCESS_TOKEN`,
   `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` e
   `MERCADO_PAGO_WEBHOOK_SECRET`.
4. Cadastre como Webhook de pagamentos:
   `https://SEU-DOMINIO/api/webhooks/mercadopago`.
5. Antes do lancamento, substitua as credenciais de teste pelas credenciais de
   producao da conta que deve receber o dinheiro.
6. Confira a conexao em `/admin/integracoes`.

Nunca salve credenciais reais no GitHub ou envie chaves por chat, WhatsApp ou
e-mail. O Checkout Pro calcula o pedido no servidor, cria uma preferencia com
validade de 30 minutos e confirma o pagamento somente por consulta autenticada
apos um Webhook com assinatura valida.

## Outros servicos

- Melhor Envio: use primeiro o sandbox. Sem token, a cotacao retorna opcoes de
  demonstracao.
- Cloudinary: o admin usa assinatura server-side em `/api/upload/signature`.
- GitHub Content: fallback para deploys Vercel sem banco; use token com acesso
  restrito ao repositorio.
- OpenAI: o modelo padrao e `gpt-5.4-mini`, configuravel por `OPENAI_MODEL`.
- Resend: e-mails entram em `EmailOutbox` e sao processados pelo worker.

## Operacao

- Reservas de estoque expiram apos 30 minutos.
- Pedidos aprovados consomem estoque pelo Webhook.
- A postagem ocorre em ate cinco dias uteis, somados ao prazo da transportadora.
- Reembolso integral e restrito ao papel `OWNER`.
- O estoque retorna somente quando o pagamento passa ao estado `refunded`.
- Textos juridicos incluidos sao bases e precisam de revisao antes do go-live.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Render

O `render.yaml` cria web service, worker e PostgreSQL pagos na regiao Virginia,
executa migrations e seed no pre-deploy e usa `/api/health` como health check.
Depois de criar o Blueprint, preencha as variaveis marcadas como `sync: false`.
`OWNER_EMAIL` e `OWNER_PASSWORD` criam o acesso inicial do proprietario no
primeiro deploy.

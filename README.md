# K&C STORE

E-commerce de moda masculina, feminina e infantil com storefront premium, elementos 3D leves, painel administrativo, PostgreSQL, Mercado Pago, Melhor Envio, Cloudinary, Resend e geração de descrições com OpenAI.

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
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `AUTH_SECRET`, `OWNER_EMAIL` e `OWNER_PASSWORD`.
3. Instale dependências:

```bash
npm install
```

4. Gere e aplique o banco:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Inicie:

```bash
npm run dev
```

Sem `DATABASE_URL`, configure `PREVIEW_ADMIN_EMAIL`,
`PREVIEW_ADMIN_PASSWORD` e `AUTH_SECRET` para ativar o painel temporário de
pré-lançamento. Nesse modo, produtos e imagens ficam salvos localmente na
máquina que executa o site. Migre os dados para PostgreSQL e Cloudinary antes
do go-live.

## Serviços externos

- Mercado Pago: configure token, chave pública e segredo de webhook. Cadastre `/api/webhooks/mercadopago` como URL de notificação.
- Melhor Envio: use primeiro o sandbox. Sem token, a cotação retorna opções demonstrativas.
- Cloudinary: o admin usa assinatura server-side em `/api/upload/signature`.
- OpenAI: o modelo padrão é `gpt-5.4-mini`, configurável por `OPENAI_MODEL`.
- Resend: e-mails entram em `EmailOutbox` e são processados pelo worker.

## Operação

- Reservas de estoque expiram após 30 minutos.
- Pedidos aprovados consomem estoque pelo webhook.
- A postagem ocorre em até cinco dias úteis, somados ao prazo da transportadora.
- Reembolso integral é restrito ao papel `OWNER`.
- Textos jurídicos incluídos são bases e precisam de revisão antes do go-live.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Render

O `render.yaml` cria:

- web service pago em Virginia;
- background worker pago em Virginia;
- PostgreSQL gerenciado;
- migration no pre-deploy;
- health check em `/api/health`.

Após criar o Blueprint, preencha as variáveis marcadas como `sync: false` e execute o seed uma vez com as credenciais definitivas do proprietário.

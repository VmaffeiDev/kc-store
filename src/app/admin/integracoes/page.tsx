import Link from "next/link";
import {
  PiCheckCircle,
  PiCopy,
  PiCreditCard,
  PiWarningCircle,
} from "react-icons/pi";
import { getMercadoPagoAccount } from "@/services/mercado-pago";
import { absoluteUrl, maskEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Status({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  const Icon = ok ? PiCheckCircle : PiWarningCircle;
  return (
    <div className="flex gap-3 border-b border-[#18211e]/10 py-4 last:border-0">
      <Icon
        className={ok ? "text-[#166b52]" : "text-[#b75432]"}
        size={22}
      />
      <div>
        <p className="font-bold">{label}</p>
        <p className="mt-1 text-sm text-[#6f746f]">{detail}</p>
      </div>
    </div>
  );
}

export default async function IntegrationsPage() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isProductionToken = accessToken?.startsWith("APP_USR-") ?? false;
  const isTestToken = accessToken?.startsWith("TEST-") ?? false;
  const isPublicHttps = siteUrl.startsWith("https://");
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const webhookUrl = absoluteUrl("/api/webhooks/mercadopago");

  let account:
    | Awaited<ReturnType<typeof getMercadoPagoAccount>>
    | undefined;
  let accountError: string | undefined;
  if (accessToken) {
    try {
      account = await getMercadoPagoAccount();
    } catch (error) {
      accountError =
        error instanceof Error
          ? error.message
          : "Nao foi possivel validar a conta.";
    }
  }

  const readyForProduction =
    Boolean(account) &&
    isProductionToken &&
    Boolean(publicKey) &&
    Boolean(webhookSecret) &&
    hasDatabase &&
    isPublicHttps;

  return (
    <div>
      <p className="section-kicker">Pagamentos</p>
      <h1 className="font-display mt-2 text-5xl">Integracoes</h1>
      <p className="mt-4 max-w-3xl text-[#5f665f]">
        O Checkout Pro envia o comprador ao ambiente seguro do Mercado Pago.
        O valor das vendas e creditado na conta proprietaria das credenciais de
        producao configuradas no servidor.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="surface bg-white p-6">
          <div className="flex items-center gap-3">
            <PiCreditCard size={28} className="text-[#b75432]" />
            <div>
              <h2 className="font-display text-3xl">Mercado Pago</h2>
              <p className="text-sm text-[#6f746f]">
                {readyForProduction
                  ? "Pronto para pagamentos reais"
                  : "Configuracao de producao incompleta"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Status
              ok={Boolean(account)}
              label="Conta validada"
              detail={
                account
                  ? `${account.nickname ?? "Conta Mercado Pago"} - ID ${account.id}${account.email ? ` - ${maskEmail(account.email)}` : ""}`
                  : accountError ?? "Informe o Access Token da conta que recebera as vendas."
              }
            />
            <Status
              ok={isProductionToken}
              label="Credenciais de producao"
              detail={
                isProductionToken
                  ? "Token de producao identificado."
                  : isTestToken
                    ? "Credencial de teste ativa. Ela nao recebe dinheiro real."
                    : "Access Token de producao ainda nao configurado."
              }
            />
            <Status
              ok={Boolean(publicKey)}
              label="Chave publica"
              detail={
                publicKey
                  ? "Chave publica configurada."
                  : "Chave publica pendente."
              }
            />
            <Status
              ok={Boolean(webhookSecret)}
              label="Assinatura de Webhooks"
              detail={
                webhookSecret
                  ? "Chave secreta configurada; notificacoes serao verificadas."
                  : "Chave secreta do webhook pendente."
              }
            />
            <Status
              ok={hasDatabase}
              label="Banco de pedidos"
              detail={
                hasDatabase
                  ? "PostgreSQL configurado."
                  : "O modo temporario nao processa checkout real."
              }
            />
            <Status
              ok={isPublicHttps}
              label="Site publico HTTPS"
              detail={
                isPublicHttps
                  ? siteUrl
                  : "Configure o dominio definitivo com HTTPS antes do lancamento."
              }
            />
          </div>
        </section>

        <section className="surface bg-[#07362c] p-6 text-white">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#e0ac60]">
            URL do webhook
          </p>
          <h2 className="font-display mt-2 text-3xl">
            Confirmacao automatica
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Cadastre esta URL na aplicacao do Mercado Pago e selecione eventos
            de pagamentos. A chave secreta gerada deve ficar somente no Render.
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-sm bg-white/10 p-4">
            <PiCopy className="mt-0.5 shrink-0 text-[#e0ac60]" size={20} />
            <code className="break-all text-xs leading-5">{webhookUrl}</code>
          </div>
          <Link
            href="https://www.mercadopago.com.br/developers/panel/app"
            target="_blank"
            rel="noreferrer"
            className="button-secondary mt-6 bg-white text-[#07362c]"
          >
            Abrir painel do Mercado Pago
          </Link>
          <p className="mt-5 text-xs leading-5 text-white/55">
            Nunca envie Access Token ou chave secreta por WhatsApp, e-mail ou
            chat. Configure-os diretamente nas variaveis privadas do servidor.
          </p>
        </section>
      </div>
    </div>
  );
}

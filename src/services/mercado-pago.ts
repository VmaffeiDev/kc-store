import "server-only";

import { absoluteUrl } from "@/lib/utils";
import {
  buildMercadoPagoPreference,
  type MercadoPagoPreferenceInput,
  validateMercadoPagoWebhookSignature,
} from "@/lib/mercado-pago";

const apiBase = "https://api.mercadopago.com";

async function mercadoPagoFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN nao configurado.");

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Mercado Pago: ${response.status} ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export async function createPreference(input: MercadoPagoPreferenceInput) {
  const payload = buildMercadoPagoPreference(
    input,
    {
      success: absoluteUrl(`/sucesso?pedido=${input.orderNumber}`),
      failure: absoluteUrl(`/falha?pedido=${input.orderNumber}`),
      pending: absoluteUrl(`/pendente?pedido=${input.orderNumber}`),
      notification: absoluteUrl("/api/webhooks/mercadopago"),
    },
    process.env.MERCADO_PAGO_STATEMENT_DESCRIPTOR ?? "KC STORE",
  );

  return mercadoPagoFetch<{ id: string; init_point: string }>(
    "/checkout/preferences",
    {
      method: "POST",
      headers: { "X-Idempotency-Key": input.orderId },
      body: JSON.stringify(payload),
    },
  );
}

export async function getPayment(paymentId: string) {
  return mercadoPagoFetch<{
    id: number;
    status: string;
    status_detail: string;
    external_reference: string;
    date_last_updated: string;
    transaction_amount: number;
    currency_id: string;
  }>(`/v1/payments/${paymentId}`);
}

export async function refundPayment(paymentId: string, idempotencyKey: string) {
  return mercadoPagoFetch<{
    id: number;
    status: string;
    date_created?: string;
  }>(
    `/v1/payments/${paymentId}/refunds`,
    {
      method: "POST",
      headers: { "X-Idempotency-Key": idempotencyKey },
      body: JSON.stringify({}),
    },
  );
}

export async function getMercadoPagoAccount() {
  return mercadoPagoFetch<{
    id: number;
    nickname?: string;
    email?: string;
    site_id?: string;
    site_status?: string;
  }>("/users/me");
}

export function validateMercadoPagoSignature(
  request: Request,
  signatureDataId?: string | null,
) {
  return validateMercadoPagoWebhookSignature({
    signature: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId: signatureDataId,
    secret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  });
}

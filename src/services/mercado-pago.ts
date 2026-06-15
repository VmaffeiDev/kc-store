import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { absoluteUrl } from "@/lib/utils";

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

type PreferenceInput = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export async function createPreference(input: PreferenceInput) {
  return mercadoPagoFetch<{ id: string; init_point: string }>(
    "/checkout/preferences",
    {
      method: "POST",
      headers: { "X-Idempotency-Key": input.orderId },
      body: JSON.stringify({
        external_reference: input.orderId,
        statement_descriptor: "KC STORE",
        payer: { email: input.customerEmail },
        items: input.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: "BRL",
        })),
        shipments: { cost: Math.max(0, input.total - input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)) },
        back_urls: {
          success: absoluteUrl(`/sucesso?pedido=${input.orderNumber}`),
          failure: absoluteUrl(`/falha?pedido=${input.orderNumber}`),
          pending: absoluteUrl(`/pendente?pedido=${input.orderNumber}`),
        },
        auto_return: "approved",
        notification_url: absoluteUrl("/api/webhooks/mercadopago"),
      }),
    },
  );
}

export async function getPayment(paymentId: string) {
  return mercadoPagoFetch<{
    id: number;
    status: string;
    external_reference: string;
    date_last_updated: string;
  }>(`/v1/payments/${paymentId}`);
}

export async function refundPayment(paymentId: string, idempotencyKey: string) {
  return mercadoPagoFetch<{ id: number; status: string }>(
    `/v1/payments/${paymentId}/refunds`,
    {
      method: "POST",
      headers: { "X-Idempotency-Key": idempotencyKey },
      body: JSON.stringify({}),
    },
  );
}

export function validateMercadoPagoSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature || !requestId) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.trim().split("=");
      return [key, value];
    }),
  );
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const actualBuffer = Buffer.from(parts.v1);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

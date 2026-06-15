import { createHmac, timingSafeEqual } from "node:crypto";

export type MercadoPagoPreferenceInput = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  total: number;
  expiresAt: Date;
  itemSummary: string;
};

export function buildMercadoPagoPreference(
  input: MercadoPagoPreferenceInput,
  urls: {
    success: string;
    failure: string;
    pending: string;
    notification: string;
  },
  statementDescriptor: string,
) {
  return {
    external_reference: input.orderId,
    statement_descriptor: statementDescriptor,
    payer: { email: input.customerEmail },
    items: [
      {
        id: input.orderNumber,
        title: `Pedido K&C STORE ${input.orderNumber}`,
        description: input.itemSummary.slice(0, 256),
        quantity: 1,
        unit_price: input.total,
        currency_id: "BRL",
      },
    ],
    metadata: {
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
    back_urls: {
      success: urls.success,
      failure: urls.failure,
      pending: urls.pending,
    },
    auto_return: "approved",
    notification_url: urls.notification,
    expires: true,
    expiration_date_to: input.expiresAt.toISOString(),
  };
}

function parseSignature(signature: string) {
  const parts = new Map<string, string>();
  for (const part of signature.split(",")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    parts.set(
      part.slice(0, separator).trim(),
      part.slice(separator + 1).trim(),
    );
  }
  return parts;
}

function normalizeDataId(dataId?: string | null) {
  if (!dataId) return null;
  return /^[a-zA-Z0-9]+$/.test(dataId) ? dataId.toLowerCase() : dataId;
}

export function validateMercadoPagoWebhookSignature(input: {
  signature?: string | null;
  requestId?: string | null;
  dataId?: string | null;
  secret?: string | null;
}) {
  if (!input.signature || !input.secret) return false;

  const parts = parseSignature(input.signature);
  const timestamp = parts.get("ts");
  const receivedHash = parts.get("v1");
  if (!timestamp || !receivedHash) return false;

  const manifest = [
    normalizeDataId(input.dataId)
      ? `id:${normalizeDataId(input.dataId)};`
      : "",
    input.requestId ? `request-id:${input.requestId};` : "",
    `ts:${timestamp};`,
  ].join("");
  const expectedHash = createHmac("sha256", input.secret)
    .update(manifest)
    .digest("hex");
  const receivedBuffer = Buffer.from(receivedHash, "utf8");
  const expectedBuffer = Buffer.from(expectedHash, "utf8");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function isNewerPaymentUpdate(
  current: Date | null,
  incoming: Date,
) {
  return !current || incoming.getTime() >= current.getTime();
}

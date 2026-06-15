import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildMercadoPagoPreference,
  isNewerPaymentUpdate,
  validateMercadoPagoWebhookSignature,
} from "@/lib/mercado-pago";

describe("Mercado Pago", () => {
  it("charges the exact server total and expires with the stock reservation", () => {
    const expiresAt = new Date("2026-06-15T18:30:00.000Z");
    const preference = buildMercadoPagoPreference(
      {
        orderId: "order-1",
        orderNumber: "KC260615TESTE",
        customerEmail: "cliente@example.com",
        total: 189.7,
        expiresAt,
        itemSummary: "1x Camiseta M/Preto",
      },
      {
        success: "https://kcstore.example/sucesso",
        failure: "https://kcstore.example/falha",
        pending: "https://kcstore.example/pendente",
        notification:
          "https://kcstore.example/api/webhooks/mercadopago",
      },
      "KC STORE",
    );

    expect(preference.items).toHaveLength(1);
    expect(preference.items[0].unit_price).toBe(189.7);
    expect(preference.expiration_date_to).toBe(expiresAt.toISOString());
    expect(preference.external_reference).toBe("order-1");
  });

  it("validates the Mercado Pago secret signature", () => {
    const secret = "webhook-secret";
    const timestamp = "1750000000";
    const requestId = "request-123";
    const dataId = "ABC123";
    const manifest = `id:abc123;request-id:${requestId};ts:${timestamp};`;
    const hash = createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    expect(
      validateMercadoPagoWebhookSignature({
        signature: `ts=${timestamp},v1=${hash}`,
        requestId,
        dataId,
        secret,
      }),
    ).toBe(true);
    expect(
      validateMercadoPagoWebhookSignature({
        signature: `ts=${timestamp},v1=${hash}`,
        requestId,
        dataId: "outro-pagamento",
        secret,
      }),
    ).toBe(false);
  });

  it("rejects unsigned webhooks and older payment updates", () => {
    expect(
      validateMercadoPagoWebhookSignature({
        signature: null,
        requestId: "request-123",
        dataId: "123",
        secret: "secret",
      }),
    ).toBe(false);
    expect(
      isNewerPaymentUpdate(
        new Date("2026-06-15T18:00:00.000Z"),
        new Date("2026-06-15T17:59:59.000Z"),
      ),
    ).toBe(false);
  });
});

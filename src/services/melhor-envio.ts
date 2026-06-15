import "server-only";
import { totalDeliveryDays } from "@/lib/commerce";

type QuoteItem = {
  productId: string;
  quantity: number;
  width: number;
  height: number;
  length: number;
  weight: number;
};

export type ShippingQuote = {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryDays: number;
  totalDays: number;
};

export async function quoteShipping(
  postalCode: string,
  items: QuoteItem[],
): Promise<ShippingQuote[]> {
  if (!process.env.MELHOR_ENVIO_TOKEN) {
    return [
      {
        id: "demo-pac",
        name: "Envio economico",
        company: "Melhor Envio",
        price: 19.9,
        deliveryDays: 6,
        totalDays: 11,
      },
      {
        id: "demo-sedex",
        name: "Envio expresso",
        company: "Melhor Envio",
        price: 32.9,
        deliveryDays: 3,
        totalDays: 8,
      },
    ];
  }

  const response = await fetch(
    `${process.env.MELHOR_ENVIO_BASE_URL ?? "https://sandbox.melhorenvio.com.br"}/api/v2/me/shipment/calculate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "K&C STORE (contato@kcstore.com.br)",
      },
      body: JSON.stringify({
        from: { postal_code: process.env.MELHOR_ENVIO_FROM_POSTAL_CODE },
        to: { postal_code: postalCode },
        products: items.map((item) => ({
          id: item.productId,
          width: item.width,
          height: item.height,
          length: item.length,
          weight: item.weight,
          insurance_value: 0,
          quantity: item.quantity,
        })),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Melhor Envio: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as Array<{
    id: number;
    name: string;
    price: string;
    delivery_time: number;
    company: { name: string };
    error?: string;
  }>;

  return data
    .filter((quote) => !quote.error)
    .map((quote) => ({
      id: String(quote.id),
      name: quote.name,
      company: quote.company.name,
      price: Number(quote.price),
      deliveryDays: quote.delivery_time,
        totalDays: totalDeliveryDays(quote.delivery_time),
    }));
}

export async function purchaseLabel(orderId: string) {
  if (!process.env.MELHOR_ENVIO_TOKEN) {
    return { id: `demo-${orderId}`, status: "released" };
  }
  throw new Error(
    "A compra de etiqueta exige o carrinho criado no Melhor Envio e credenciais de producao.",
  );
}

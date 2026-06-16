import { shippingQuoteSchema } from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";
import { quoteShipping } from "@/services/melhor-envio";

export async function POST(request: Request) {
  try {
    const input = shippingQuoteSchema.parse(await request.json());
    return Response.json({
      quotes: await quoteShipping(input.postalCode, input.items),
      handlingDays: 5,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

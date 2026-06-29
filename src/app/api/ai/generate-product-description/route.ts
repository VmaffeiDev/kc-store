import { requireRole } from "@/lib/authorization";
import { productDescriptionSchema } from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";
import { generateProductDescription } from "@/services/openai";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    await requireRole(["OWNER", "STAFF"]);
    const input = productDescriptionSchema.parse(await request.json());
    return Response.json(await generateProductDescription(input));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Preencha nome e preco antes de gerar a descricao." },
        { status: 400 },
      );
    }
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}

import { requireRole } from "@/lib/authorization";
import { productDescriptionSchema } from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";
import { generateProductDescription } from "@/services/openai";

export async function POST(request: Request) {
  try {
    await requireRole(["OWNER", "STAFF"]);
    const input = productDescriptionSchema.parse(await request.json());
    return Response.json(await generateProductDescription(input));
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}

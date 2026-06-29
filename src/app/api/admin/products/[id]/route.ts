import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import {
  archiveRuntimeProduct,
  updateRuntimeProduct,
} from "@/lib/local-catalog";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";

const isPanelImageUrl = (value: string) => {
  if (value.startsWith("/uploads/")) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["raw.githubusercontent.com", "res.cloudinary.com"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  genderCategory: z.enum(["MASCULINO", "FEMININO", "INFANTIL", "UNISSEX"]).optional(),
  shortDescription: z.string().min(10).optional(),
  description: z.string().min(20).optional(),
  price: z.coerce.number().positive().optional(),
  promotionalPrice: z.union([z.coerce.number().positive(), z.literal(""), z.null()]).optional(),
  material: z.string().optional(),
  style: z.string().optional(),
  color: z.string().min(1).optional(),
  size: z.string().min(1).optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  image: z.string().refine(isPanelImageUrl, "Use uma imagem enviada pelo painel.").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPromotion: z.boolean().optional(),
});

function getProductValidationMessage(error: z.ZodError) {
  const fields = new Set(error.issues.map((issue) => String(issue.path[0])));
  if (fields.has("name")) return "Preencha o nome do produto.";
  if (fields.has("price")) return "Preencha o preco do produto.";
  if (fields.has("image")) return "Selecione uma imagem valida pelo painel.";
  if (fields.has("shortDescription") || fields.has("description")) {
    return "Preencha a descricao curta e a descricao completa.";
  }
  return "Revise os campos obrigatorios do produto.";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireRole(["OWNER", "STAFF"]);
    const { id } = await context.params;
    const input = updateSchema.parse(await request.json());
    if (!process.env.DATABASE_URL) {
      return Response.json(await updateRuntimeProduct(id, input));
    }
    const product = await getPrisma().product.update({
      where: { id },
      data: {
        name: input.name,
        category: input.category,
        genderCategory: input.genderCategory,
        shortDescription: input.shortDescription,
        description: input.description,
        price: input.price,
        promotionalPrice:
          input.promotionalPrice === "" ? null : input.promotionalPrice,
        material: input.material,
        style: input.style,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        isPromotion: input.isPromotion,
      },
    });
    await getPrisma().auditLog.create({
      data: {
        actorId: actor.id,
        action: "PRODUCT_UPDATED",
        entity: "Product",
        entityId: id,
      },
    });
    return Response.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: getProductValidationMessage(error) },
        { status: 400 },
      );
    }
    const message = getErrorMessage(error);
    return Response.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireRole(["OWNER"]);
    const { id } = await context.params;
    if (!process.env.DATABASE_URL) {
      return Response.json(await archiveRuntimeProduct(id));
    }
    const product = await getPrisma().product.update({
      where: { id },
      data: { isActive: false },
    });
    await getPrisma().auditLog.create({
      data: {
        actorId: actor.id,
        action: "PRODUCT_ARCHIVED",
        entity: "Product",
        entityId: id,
      },
    });
    return Response.json(product);
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 400 });
  }
}

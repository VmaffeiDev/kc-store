import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  shortDescription: z.string().min(10).optional(),
  description: z.string().min(20).optional(),
  price: z.coerce.number().positive().optional(),
  promotionalPrice: z.coerce.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPromotion: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireRole(["OWNER", "STAFF"]);
    const { id } = await context.params;
    const product = await getPrisma().product.update({
      where: { id },
      data: updateSchema.parse(await request.json()),
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

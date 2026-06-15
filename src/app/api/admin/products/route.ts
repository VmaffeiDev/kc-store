import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  genderCategory: z.enum(["MASCULINO", "FEMININO", "INFANTIL", "UNISSEX"]),
  price: z.coerce.number().positive(),
  promotionalPrice: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  material: z.string().optional(),
  style: z.string().optional(),
  color: z.string().min(2),
  size: z.string().min(1),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.union([z.literal("on"), z.boolean()]).optional(),
  isFeatured: z.union([z.literal("on"), z.boolean()]).optional(),
  isPromotion: z.union([z.literal("on"), z.boolean()]).optional(),
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function POST(request: Request) {
  try {
    const actor = await requireRole(["OWNER", "STAFF"]);
    const input = schema.parse(await request.json());
    const prisma = getPrisma();
    const suffix = Date.now().toString(36).toUpperCase();
    const sku = `KC-${input.genderCategory.slice(0, 3)}-${suffix}`;
    const sizes = input.size.split(",").map((item) => item.trim()).filter(Boolean);
    const colors = input.color.split(",").map((item) => item.trim()).filter(Boolean);
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: `${slugify(input.name)}-${suffix.toLowerCase()}`,
        sku,
        category: input.category,
        genderCategory: input.genderCategory,
        price: input.price,
        promotionalPrice:
          typeof input.promotionalPrice === "number"
            ? input.promotionalPrice
            : null,
        material: input.material,
        style: input.style,
        shortDescription: input.shortDescription,
        description: input.description,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        tags: [],
        isActive: Boolean(input.isActive),
        isFeatured: Boolean(input.isFeatured),
        isPromotion: Boolean(input.isPromotion),
        variants: {
          create: sizes.flatMap((size) =>
            colors.map((color, index) => ({
              sku: `${sku}-${size}-${index + 1}`,
              size,
              color,
              stock: 0,
            })),
          ),
        },
      },
    });
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "PRODUCT_CREATED",
        entity: "Product",
        entityId: product.id,
      },
    });
    return Response.json(product, { status: 201 });
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}

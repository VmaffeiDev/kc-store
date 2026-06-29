import { z } from "zod";
import { requireRole } from "@/lib/authorization";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import { saveRuntimeProduct } from "@/lib/local-catalog";
import type { CatalogProduct } from "@/types/store";

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
  stock: z.coerce.number().int().nonnegative(),
  image: z.string().refine(isPanelImageUrl, "Use uma imagem enviada pelo painel."),
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

export async function POST(request: Request) {
  try {
    const actor = await requireRole(["OWNER", "STAFF"]);
    const input = schema.parse(await request.json());
    const suffix = Date.now().toString(36).toUpperCase();
    const sku = `KC-${input.genderCategory.slice(0, 3)}-${suffix}`;
    const sizes = input.size.split(",").map((item) => item.trim()).filter(Boolean);
    const colors = input.color.split(",").map((item) => item.trim()).filter(Boolean);
    if (!process.env.DATABASE_URL) {
      const product: CatalogProduct = {
        id: `preview_${suffix.toLowerCase()}`,
        name: input.name,
        slug: `${slugify(input.name)}-${suffix.toLowerCase()}`,
        sku,
        category: input.category,
        genderCategory: input.genderCategory,
        price: input.price,
        promotionalPrice:
          typeof input.promotionalPrice === "number"
            ? input.promotionalPrice
            : undefined,
        material: input.material || "Nao informado",
        shortDescription: input.shortDescription,
        description: input.description,
        image: input.image,
        badge: input.isPromotion ? "Promocao" : input.isFeatured ? "Novo" : undefined,
        featured: Boolean(input.isFeatured),
        sizes,
        colors,
        stock: input.stock,
      };
      await saveRuntimeProduct(product);
      return Response.json(product, { status: 201 });
    }

    const prisma = getPrisma();
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
        images: {
          create: {
            url: input.image,
            altText: input.name,
            position: 0,
          },
        },
        variants: {
          create: sizes.flatMap((size) =>
            colors.map((color, index) => ({
              sku: `${sku}-${size}-${index + 1}`,
              size,
              color,
              stock: input.stock,
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
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: getProductValidationMessage(error) },
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

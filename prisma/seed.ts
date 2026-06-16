import "dotenv/config";
import { hash } from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { products } from "../src/data/catalog";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL obrigatoria para seed.");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL ?? "admin@example.com";
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerPassword || ownerPassword.length < 8) {
    throw new Error("Defina OWNER_PASSWORD com ao menos 8 caracteres.");
  }
  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { role: "OWNER", active: true },
    create: {
      name: process.env.OWNER_NAME ?? "Proprietario K&C STORE",
      email: ownerEmail,
      passwordHash: await hash(ownerPassword, { type: 2 }),
      role: "OWNER",
      emailVerified: new Date(),
    },
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        price: product.price,
        promotionalPrice: product.promotionalPrice,
        isActive: true,
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        promotionalPrice: product.promotionalPrice,
        category: product.category,
        genderCategory: product.genderCategory,
        material: product.material,
        tags: [],
        isActive: true,
        isFeatured: product.featured ?? false,
        isPromotion: Boolean(product.promotionalPrice),
        images: {
          create: { url: product.image, altText: product.name, position: 0 },
        },
        variants: {
          create: product.sizes.flatMap((size) =>
            product.colors.map((color) => ({
              id: `${product.id}-${size}-${color}`,
              sku: `${product.sku}-${size}-${color}`,
              size,
              color,
              stock: product.stock,
            })),
          ),
        },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "KCBEMVINDO" },
    update: {},
    create: {
      code: "KCBEMVINDO",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumValue: 100,
      usageLimit: 100,
      expiresAt: new Date("2026-12-31T23:59:59-03:00"),
      isActive: true,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

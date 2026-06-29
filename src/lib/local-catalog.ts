import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { products as seedProducts } from "@/data/catalog";
import {
  hasGithubContentConfig,
  readGithubJsonFile,
  writeGithubJsonFile,
} from "@/services/github-content";
import type { CatalogProduct, GenderCategory } from "@/types/store";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "runtime-products.json");
const archiveFile = path.join(dataDirectory, "archived-products.json");
const githubDataFile = "data/runtime-products.json";
const githubArchiveFile = "data/archived-products.json";

type CatalogProductUpdate = {
  name?: string;
  category?: string;
  genderCategory?: GenderCategory;
  price?: number;
  promotionalPrice?: number | null | "";
  material?: string;
  color?: string;
  size?: string;
  stock?: number;
  image?: string;
  shortDescription?: string;
  description?: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
};

async function readRuntimeProducts(): Promise<CatalogProduct[]> {
  if (hasGithubContentConfig()) {
    return readGithubJsonFile<CatalogProduct[]>(githubDataFile, []);
  }

  try {
    return JSON.parse(await readFile(dataFile, "utf8")) as CatalogProduct[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeRuntimeProducts(products: CatalogProduct[], message: string) {
  if (hasGithubContentConfig()) {
    await writeGithubJsonFile(githubDataFile, products, message);
    return;
  }

  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(products, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

async function readArchivedProductIds(): Promise<string[]> {
  if (hasGithubContentConfig()) {
    return readGithubJsonFile<string[]>(githubArchiveFile, []);
  }

  try {
    return JSON.parse(await readFile(archiveFile, "utf8")) as string[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeArchivedProductIds(ids: string[], message: string) {
  if (hasGithubContentConfig()) {
    await writeGithubJsonFile(githubArchiveFile, ids, message);
    return;
  }

  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${archiveFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(ids, null, 2), "utf8");
  await rename(temporaryFile, archiveFile);
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getCatalogProducts() {
  const runtimeProducts = await readRuntimeProducts();
  const archivedIds = new Set(await readArchivedProductIds());
  const runtimeIds = new Set(runtimeProducts.map((product) => product.id));
  return [
    ...runtimeProducts.filter((product) => !archivedIds.has(product.id)),
    ...seedProducts.filter(
      (product) => !runtimeIds.has(product.id) && !archivedIds.has(product.id),
    ),
  ];
}

export async function findCatalogProductById(id: string) {
  return (await getCatalogProducts()).find((product) => product.id === id);
}

export async function findCatalogProductBySlug(slug: string) {
  return (await getCatalogProducts()).find((product) => product.slug === slug);
}

export async function saveRuntimeProduct(product: CatalogProduct) {
  const products = await readRuntimeProducts();
  const nextProducts = [
    product,
    ...products.filter((candidate) => candidate.id !== product.id),
  ];

  await writeRuntimeProducts(nextProducts, `feat: publish product ${product.name}`);
  return product;
}

export async function updateRuntimeProduct(
  id: string,
  input: CatalogProductUpdate,
) {
  const current = await findCatalogProductById(id);
  if (!current) throw new Error("Produto nao encontrado.");

  const products = await readRuntimeProducts();
  const nextProduct: CatalogProduct = {
    ...current,
    name: input.name ?? current.name,
    category: input.category ?? current.category,
    genderCategory: input.genderCategory ?? current.genderCategory,
    price: input.price ?? current.price,
    promotionalPrice:
      input.promotionalPrice === "" || input.promotionalPrice === null
        ? undefined
        : input.promotionalPrice ?? current.promotionalPrice,
    material: input.material || current.material,
    shortDescription: input.shortDescription ?? current.shortDescription,
    description: input.description ?? current.description,
    image: input.image ?? current.image,
    badge: input.isPromotion
      ? "Promocao"
      : input.isFeatured
        ? "Novo"
        : undefined,
    featured: input.isFeatured ?? current.featured,
    sizes: input.size ? splitList(input.size) : current.sizes,
    colors: input.color ? splitList(input.color) : current.colors,
    stock: input.stock ?? current.stock,
  };
  const nextProducts = [
    nextProduct,
    ...products.filter((candidate) => candidate.id !== id),
  ];
  await writeRuntimeProducts(
    nextProducts,
    `fix: update product ${nextProduct.name}`,
  );
  return nextProduct;
}

export async function archiveRuntimeProduct(id: string) {
  const current = await findCatalogProductById(id);
  if (!current) throw new Error("Produto nao encontrado.");

  const products = await readRuntimeProducts();
  await writeRuntimeProducts(
    products.filter((product) => product.id !== id),
    `chore: remove product ${current.name}`,
  );
  const archivedIds = await readArchivedProductIds();
  if (!archivedIds.includes(id)) {
    await writeArchivedProductIds(
      [id, ...archivedIds],
      `chore: archive product ${current.name}`,
    );
  }
  return current;
}

import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { products as seedProducts } from "@/data/catalog";
import {
  hasGithubContentConfig,
  readGithubJsonFile,
  writeGithubJsonFile,
} from "@/services/github-content";
import type { CatalogProduct } from "@/types/store";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "runtime-products.json");
const githubDataFile = "data/runtime-products.json";

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

export async function getCatalogProducts() {
  const runtimeProducts = await readRuntimeProducts();
  return [...runtimeProducts, ...seedProducts];
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

  if (hasGithubContentConfig()) {
    await writeGithubJsonFile(
      githubDataFile,
      nextProducts,
      `feat: publish product ${product.name}`,
    );
    return product;
  }

  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(nextProducts, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
  return product;
}

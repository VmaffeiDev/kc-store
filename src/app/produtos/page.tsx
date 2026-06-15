import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog-client";
import { getCatalogProducts } from "@/lib/local-catalog";

export const metadata: Metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const products = await getCatalogProducts();
  return (
    <CatalogClient
      products={products}
      initialAudience={typeof params.publico === "string" ? params.publico : ""}
      initialSearch={typeof params.busca === "string" ? params.busca : ""}
      promotionOnly={params.promocao === "1"}
    />
  );
}

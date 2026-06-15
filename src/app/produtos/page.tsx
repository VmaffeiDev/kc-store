import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog-client";
import { products } from "@/data/catalog";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <CatalogClient
      products={products}
      initialAudience={typeof params.publico === "string" ? params.publico : ""}
      initialSearch={typeof params.busca === "string" ? params.busca : ""}
      promotionOnly={params.promocao === "1"}
    />
  );
}

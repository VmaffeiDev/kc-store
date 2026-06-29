import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { findCatalogProductById } from "@/lib/local-catalog";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await findCatalogProductById(id);
  if (!product) notFound();

  return (
    <div>
      <p className="section-kicker">Catalogo</p>
      <h1 className="font-display mt-2 text-5xl">Editar produto</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { findProductBySlug, products } from "@/data/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();
  const related = products.filter((candidate) => candidate.id !== product.id).slice(0, 4);
  return (
    <>
      <ProductDetail product={product} />
      <section className="bg-[#f4eadb] py-16">
        <div className="container-store">
          <h2 className="font-display mb-8 text-5xl">Voce tambem pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </div>
      </section>
    </>
  );
}

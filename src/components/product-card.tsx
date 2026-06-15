"use client";

import Image from "next/image";
import Link from "next/link";
import { PiHeart, PiShoppingBagOpen } from "react-icons/pi";
import { formatCurrency } from "@/data/catalog";
import type { CatalogProduct } from "@/types/store";
import { useCart } from "@/stores/cart";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const addItem = useCart((state) => state.addItem);
  const price = product.promotionalPrice ?? product.price;

  return (
    <article className="group">
      <div className="tilt-card relative aspect-[4/5] overflow-hidden rounded-[5px] bg-[#e9dcc8]">
        <Link href={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[#fffaf2]/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0d4638]">
            {product.badge}
          </span>
        )}
        <button aria-label="Favoritar produto" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/80 text-[#0d4638] backdrop-blur">
          <PiHeart size={20} />
        </button>
        <button
          onClick={() =>
            addItem({
              productId: product.id,
              variantId: `${product.id}-${product.sizes[0]}-${product.colors[0]}`,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              image: product.image,
              size: product.sizes[0],
              color: product.colors[0],
              unitPrice: price,
              quantity: 1,
              availableStock: product.stock,
            })
          }
          className="absolute bottom-3 right-3 grid size-11 translate-y-16 place-items-center rounded-full bg-[#0d4638] text-white transition duration-300 group-hover:translate-y-0 focus:translate-y-0"
          aria-label={`Adicionar ${product.name} ao carrinho`}
        >
          <PiShoppingBagOpen size={20} />
        </button>
      </div>
      <div className="pt-4">
        <Link href={`/produto/${product.slug}`} className="text-sm font-semibold hover:text-[#b75432]">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-extrabold">{formatCurrency(price)}</span>
          {product.promotionalPrice && (
            <span className="text-xs text-[#777] line-through">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

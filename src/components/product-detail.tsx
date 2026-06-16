"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PiCheck, PiShoppingBagOpen, PiWhatsappLogo } from "react-icons/pi";
import { whatsappUrl } from "@/lib/contact";
import type { CatalogProduct } from "@/types/store";
import { formatCurrency } from "@/data/catalog";
import { useCart } from "@/stores/cart";

export function ProductDetail({ product }: { product: CatalogProduct }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);
  const price = product.promotionalPrice ?? product.price;

  const add = () =>
    addItem({
      productId: product.id,
      variantId: `${product.id}-${size}-${color}`,
      name: product.name,
      slug: product.slug,
      sku: `${product.sku}-${size}-${color}`,
      image: product.image,
      size,
      color,
      unitPrice: price,
      quantity,
      availableStock: product.stock,
    });

  return (
    <div className="container-store py-12">
      <div className="mb-7 text-xs text-[#6f746f]">
        <Link href="/">Inicio</Link> / <Link href="/produtos">Produtos</Link> / {product.name}
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.06fr_.94fr]">
        <div className="group relative aspect-[4/5] overflow-hidden bg-[#eadcc8]">
          <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover transition duration-700 group-hover:scale-105" />
        </div>
        <div className="py-3 lg:py-8">
          <p className="section-kicker">{product.category}</p>
          <h1 className="font-display mt-3 text-6xl leading-[.95]">{product.name}</h1>
          <p className="mt-5 text-2xl font-extrabold text-[#0d4638]">{formatCurrency(price)}</p>
          {product.promotionalPrice && <p className="mt-1 text-sm text-[#777] line-through">{formatCurrency(product.price)}</p>}
          <p className="mt-7 max-w-xl text-sm leading-7 text-[#5c625e]">{product.description}</p>

          <div className="mt-8 border-t border-[#18211e]/10 pt-7">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wider">Tamanho</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button key={item} onClick={() => setSize(item)} className={`grid min-w-11 place-items-center border px-3 py-2 text-sm ${size === item ? "border-[#0d4638] bg-[#0d4638] text-white" : "border-[#18211e]/20"}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wider">Cor</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((item) => (
                <button key={item} onClick={() => setColor(item)} className={`border px-4 py-2 text-sm ${color === item ? "border-[#b75432] text-[#b75432]" : "border-[#18211e]/20"}`}>{item}</button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <label className="text-xs font-extrabold uppercase tracking-wider" htmlFor="quantity">Quantidade</label>
            <input id="quantity" type="number" min={1} max={Math.min(product.stock, 10)} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="input-store !w-20" />
            <span className="flex items-center gap-1 text-xs text-[#35725f]"><PiCheck /> {product.stock} em estoque</span>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button onClick={add} className="button-primary"><PiShoppingBagOpen size={20} /> Adicionar ao carrinho</button>
            <Link href="/carrinho" onClick={add} className="button-secondary">Comprar agora</Link>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-12 items-center justify-center gap-2 border border-[#0d4638]/20 text-sm font-bold text-[#0d4638]"
          >
            <PiWhatsappLogo size={20} /> Tirar duvida no WhatsApp
          </a>
          <div className="mt-8 grid gap-3 border-t border-[#18211e]/10 pt-6 text-xs text-[#5c625e]">
            <p><strong>Material:</strong> {product.material}</p>
            <p><strong>Postagem:</strong> em ate 5 dias uteis apos a confirmacao do pagamento.</p>
            <p><strong>Pagamento:</strong> ambiente seguro Mercado Pago.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { PiMinus, PiPlus, PiTrash } from "react-icons/pi";
import { useCart } from "@/stores/cart";
import { formatCurrency } from "@/data/catalog";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="container-store py-14">
      <p className="section-kicker">Sua selecao</p>
      <h1 className="font-display mt-2 text-6xl">Carrinho</h1>
      {!items.length ? (
        <div className="surface mt-10 py-20 text-center">
          <h2 className="font-display text-4xl">Seu carrinho esta vazio</h2>
          <p className="mt-2 text-sm text-[#69706b]">Encontre pecas para todos os momentos.</p>
          <Link href="/produtos" className="button-primary mt-7">Explorar produtos</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-[#18211e]/10">
            {items.map((item) => (
              <article key={item.variantId} className="grid grid-cols-[100px_1fr] gap-5 py-5 sm:grid-cols-[120px_1fr_auto]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#eadcc8]">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <Link href={`/produto/${item.slug}`} className="font-display text-2xl">{item.name}</Link>
                  <p className="mt-2 text-xs text-[#6f746f]">{item.size} · {item.color}</p>
                  <p className="mt-3 text-sm font-extrabold">{formatCurrency(item.unitPrice)}</p>
                  <div className="mt-4 inline-flex items-center border border-[#18211e]/15">
                    <button aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="grid size-9 place-items-center"><PiMinus /></button>
                    <span className="grid w-9 place-items-center text-sm">{item.quantity}</span>
                    <button aria-label="Aumentar quantidade" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="grid size-9 place-items-center"><PiPlus /></button>
                  </div>
                </div>
                <button aria-label={`Remover ${item.name}`} onClick={() => removeItem(item.variantId)} className="self-start text-[#a54c30] sm:ml-5"><PiTrash size={20} /></button>
              </article>
            ))}
          </div>
          <aside className="surface h-fit p-7">
            <h2 className="font-display text-3xl">Resumo</h2>
            <div className="mt-6 flex justify-between text-sm"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <p className="mt-3 text-xs leading-5 text-[#6f746f]">Frete e cupons sao calculados no checkout.</p>
            <div className="mt-6 border-t border-[#18211e]/10 pt-5">
              <div className="flex justify-between text-lg"><span>Total parcial</span><strong>{formatCurrency(subtotal)}</strong></div>
            </div>
            <Link href="/checkout" className="button-primary mt-7 w-full">Finalizar compra</Link>
            <Link href="/produtos" className="mt-4 block text-center text-xs font-bold underline">Continuar comprando</Link>
          </aside>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PiLockKey, PiMapPin, PiTruck } from "react-icons/pi";
import { useCart } from "@/stores/cart";
import { formatCurrency } from "@/data/catalog";
import type { ShippingQuote } from "@/services/melhor-envio";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<ShippingQuote | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );

  async function calculateShipping(form: HTMLFormElement) {
    const data = new FormData(form);
    const postalCode = String(data.get("postalCode") ?? "").replace(/\D/g, "");
    if (postalCode.length !== 8) {
      setMessage("Informe um CEP com 8 digitos.");
      return;
    }
    setMessage("Calculando frete...");
    const response = await fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postalCode,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          width: 20,
          height: 10,
          length: 25,
          weight: 0.4,
        })),
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "Nao foi possivel calcular o frete.");
      return;
    }
    setQuotes(body.quotes);
    setSelectedQuote(body.quotes[0] ?? null);
    setMessage("");
  }

  return (
    <form
      className="grid gap-10 lg:grid-cols-[1fr_390px]"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!selectedQuote) {
          await calculateShipping(event.currentTarget);
          return;
        }
        setLoading(true);
        setMessage("Criando pagamento seguro...");
        const data = new FormData(event.currentTarget);
        const payload = {
          customer: {
            name: data.get("name"),
            email: data.get("email"),
            phone: data.get("phone"),
            document: data.get("document") || undefined,
          },
          address: {
            line1: data.get("line1"),
            line2: data.get("line2") || undefined,
            district: data.get("district"),
            city: data.get("city"),
            state: data.get("state"),
            postalCode: String(data.get("postalCode")).replace(/\D/g, ""),
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          couponCode: data.get("coupon") || undefined,
          shipping: {
            serviceId: selectedQuote.id,
            serviceName: `${selectedQuote.company} - ${selectedQuote.name}`,
            price: selectedQuote.price,
            deliveryDays: selectedQuote.deliveryDays,
          },
        };
        const response = await fetch("/api/checkout/create-preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await response.json();
        if (!response.ok) {
          setMessage(
            body.error ??
              "Configure PostgreSQL e Mercado Pago para concluir o pagamento.",
          );
          setLoading(false);
          return;
        }
        clear();
        if (body.initPoint) window.location.href = body.initPoint;
        else router.push(`/pendente?pedido=${body.orderNumber}`);
      }}
    >
      <div className="grid gap-8">
        <section className="surface p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#0d4638] text-white">1</span>
            <div><h2 className="font-display text-3xl">Seus dados</h2><p className="text-xs text-[#6f746f]">Conta opcional, compra sempre simples.</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold">Nome completo<input required name="name" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">E-mail<input required name="email" type="email" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Telefone<input required name="phone" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">CPF opcional<input name="document" className="input-store mt-2" /></label>
          </div>
        </section>
        <section className="surface p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#b75432] text-white">2</span>
            <div><h2 className="font-display text-3xl">Entrega</h2><p className="text-xs text-[#6f746f]">Postagem em ate 5 dias uteis.</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold">CEP<input required name="postalCode" inputMode="numeric" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Estado<input required name="state" maxLength={2} className="input-store mt-2 uppercase" /></label>
            <label className="text-xs font-bold md:col-span-2">Endereco<input required name="line1" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Complemento<input name="line2" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Bairro<input required name="district" className="input-store mt-2" /></label>
            <label className="text-xs font-bold md:col-span-2">Cidade<input required name="city" className="input-store mt-2" /></label>
          </div>
          <button type="button" onClick={(event) => calculateShipping(event.currentTarget.form!)} className="button-secondary mt-5"><PiMapPin /> Calcular frete</button>
          {!!quotes.length && (
            <div className="mt-5 grid gap-2">
              {quotes.map((quote) => (
                <label key={quote.id} className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${selectedQuote?.id === quote.id ? "border-[#0d4638] bg-[#eaf1ed]" : "border-[#18211e]/10"}`}>
                  <input type="radio" name="shippingOption" checked={selectedQuote?.id === quote.id} onChange={() => setSelectedQuote(quote)} />
                  <PiTruck size={20} />
                  <span className="flex-1"><strong>{quote.company} · {quote.name}</strong><br /><small>{quote.totalDays} dias uteis, incluindo preparacao</small></span>
                  <strong>{formatCurrency(quote.price)}</strong>
                </label>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="surface h-fit p-7 lg:sticky lg:top-24">
        <h2 className="font-display text-4xl">Resumo do pedido</h2>
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between gap-4 text-sm">
              <span>{item.quantity}× {item.name}<small className="block text-[#777]">{item.size} · {item.color}</small></span>
              <strong>{formatCurrency(item.unitPrice * item.quantity)}</strong>
            </div>
          ))}
        </div>
        <label className="mt-6 block text-xs font-bold">Cupom<input name="coupon" placeholder="KCBEMVINDO" className="input-store mt-2 uppercase" /></label>
        <div className="mt-6 grid gap-3 border-y border-[#18211e]/10 py-5 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="flex justify-between"><span>Frete</span><strong>{selectedQuote ? formatCurrency(selectedQuote.price) : "A calcular"}</strong></div>
        </div>
        <div className="mt-5 flex justify-between text-lg"><span>Total</span><strong>{formatCurrency(subtotal + (selectedQuote?.price ?? 0))}</strong></div>
        <button disabled={loading || !items.length} className="button-primary mt-7 w-full disabled:opacity-50"><PiLockKey /> {loading ? "Aguarde..." : "Pagar com Mercado Pago"}</button>
        <p aria-live="polite" className="mt-4 text-center text-xs leading-5 text-[#8d3f27]">{message}</p>
        <p className="mt-4 text-center text-[10px] leading-5 text-[#777]">Ao finalizar, voce concorda com as politicas da K&amp;C STORE.</p>
      </aside>
    </form>
  );
}

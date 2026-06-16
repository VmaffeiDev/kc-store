import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="container-store py-12">
      <p className="section-kicker">Ambiente seguro</p>
      <h1 className="font-display mt-2 text-6xl">Finalizar compra</h1>
      <p className="mt-3 text-sm text-[#6f746f]">Ja tem cadastro? <Link href="/entrar" className="font-bold text-[#0d4638] underline">Entre para preencher mais rapido.</Link></p>
      <div className="mt-10"><CheckoutForm /></div>
    </div>
  );
}

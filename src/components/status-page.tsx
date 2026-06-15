import Link from "next/link";
import { PiCheckCircle, PiClock, PiWarningCircle } from "react-icons/pi";

export function StatusPage({
  kind,
  order,
}: {
  kind: "success" | "pending" | "failure";
  order?: string;
}) {
  const content = {
    success: { icon: PiCheckCircle, title: "Compra confirmada", text: "Obrigado por comprar na K&C STORE. Vamos preparar seu pedido para postagem em ate cinco dias uteis." },
    pending: { icon: PiClock, title: "Pagamento em analise", text: "Assim que o Mercado Pago confirmar, voce recebera um e-mail com a atualizacao." },
    failure: { icon: PiWarningCircle, title: "Pagamento nao concluido", text: "Seu estoque sera liberado ao fim da reserva. Voce pode revisar o carrinho e tentar novamente." },
  }[kind];
  const Icon = content.icon;
  return (
    <div className="container-store grid min-h-[610px] place-items-center py-14 text-center">
      <div className="max-w-xl">
        <Icon size={70} className="mx-auto text-[#b75432]" />
        <h1 className="font-display mt-5 text-6xl">{content.title}</h1>
        {order && <p className="mt-3 text-xs font-extrabold uppercase tracking-wider">Pedido {order}</p>}
        <p className="mt-5 text-sm leading-7 text-[#6f746f]">{content.text}</p>
        <Link href="/produtos" className="button-primary mt-8">Continuar comprando</Link>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";

const policies: Record<string, { title: string; intro: string; sections: string[] }> = {
  entrega: { title: "Entrega e rastreio", intro: "A K&C STORE prepara os pedidos para postagem em ate cinco dias uteis apos a confirmacao do pagamento.", sections: ["O prazo exibido no checkout soma o tempo de preparacao ao prazo informado pela transportadora.", "O codigo de rastreio sera enviado por e-mail quando a etiqueta for postada.", "Texto-base sujeito a revisao juridica antes do lancamento."] },
  trocas: { title: "Trocas e devolucoes", intro: "Queremos que cada escolha vista bem e faca sentido para voce.", sections: ["Solicitacoes devem respeitar os prazos previstos na legislacao brasileira.", "O produto precisa preservar etiquetas, embalagem e sinais originais.", "Texto-base sujeito a revisao juridica antes do lancamento."] },
  privacidade: { title: "Privacidade", intro: "Tratamos dados pessoais apenas para operar compras, atendimento e comunicacoes autorizadas.", sections: ["Promocoes dependem de consentimento separado e podem ser canceladas a qualquer momento.", "Dados de pagamento sao processados pelo Mercado Pago.", "Texto-base sujeito a revisao juridica antes do lancamento."] },
};

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const policy = policies[(await params).slug];
  if (!policy) notFound();
  return (
    <article className="container-store max-w-3xl py-16">
      <p className="section-kicker">Politicas K&amp;C STORE</p>
      <h1 className="font-display mt-3 text-6xl">{policy.title}</h1>
      <p className="mt-6 text-lg leading-8">{policy.intro}</p>
      <div className="mt-8 grid gap-4 text-sm leading-7 text-[#5f6661]">{policy.sections.map((section) => <p key={section}>{section}</p>)}</div>
    </article>
  );
}

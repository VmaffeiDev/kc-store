import { PiArrowUpRight, PiPackage, PiShoppingBag, PiWarning } from "react-icons/pi";
import { formatCurrency, products } from "@/data/catalog";

const metrics = [
  ["Total de produtos", String(products.length), PiShoppingBag],
  ["Pedidos no periodo", "24", PiPackage],
  ["Total vendido", formatCurrency(12840.5), PiArrowUpRight],
  ["Estoque baixo", "2", PiWarning],
] as const;

export default function DashboardPage() {
  return (
    <div>
      <p className="section-kicker">Visao geral</p>
      <h1 className="font-display mt-2 text-5xl">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <div key={label} className="surface bg-white p-6">
            <Icon size={24} className="text-[#b75432]" />
            <p className="mt-6 text-xs font-bold text-[#6f746f]">{label}</p>
            <p className="font-display mt-1 text-4xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Pedidos recentes</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-[#777]"><tr><th className="py-3">Pedido</th><th>Cliente</th><th>Status</th><th>Total</th></tr></thead>
              <tbody className="divide-y">
                {[["KC260615A7F2", "Marina Costa", "Pago", "R$ 429,80"], ["KC260615B2E9", "Rafael Lima", "Em separacao", "R$ 249,90"], ["KC260614C8D1", "Luciana Alves", "Aguardando", "R$ 149,90"]].map((row) => <tr key={row[0]}><td className="py-4 font-bold">{row[0]}</td><td>{row[1]}</td><td><span className="rounded-full bg-[#eaf1ed] px-3 py-1 text-xs text-[#0d4638]">{row[2]}</span></td><td>{row[3]}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
        <section className="surface bg-[#07362c] p-6 text-white">
          <h2 className="font-display text-3xl text-[#e0ac60]">Atencao hoje</h2>
          <div className="mt-6 grid gap-4 text-sm text-white/75">
            <p className="border-b border-white/10 pb-4"><strong className="block text-white">2 produtos</strong> com menos de 10 unidades.</p>
            <p className="border-b border-white/10 pb-4"><strong className="block text-white">3 pedidos</strong> aguardando compra de etiqueta.</p>
            <p><strong className="block text-white">1 e-mail</strong> sera reprocessado pelo worker.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

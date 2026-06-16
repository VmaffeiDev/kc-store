import { PiArrowUpRight, PiPackage, PiShoppingBag, PiWarning } from "react-icons/pi";
import { formatCurrency } from "@/data/catalog";
import { getCatalogProducts } from "@/lib/local-catalog";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const products = await getCatalogProducts();
  const metrics = [
    ["Total de produtos", String(products.length), PiShoppingBag],
    ["Pedidos no periodo", "0", PiPackage],
    ["Total vendido", formatCurrency(0), PiArrowUpRight],
    [
      "Estoque baixo",
      String(products.filter((product) => product.stock < 10).length),
      PiWarning,
    ],
  ] as const;
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
            <p className="py-10 text-center text-sm text-[#6f746f]">
              Os pedidos reais aparecerao aqui depois do lancamento.
            </p>
          </div>
        </section>
        <section className="surface bg-[#07362c] p-6 text-white">
          <h2 className="font-display text-3xl text-[#e0ac60]">Atencao hoje</h2>
          <div className="mt-6 grid gap-4 text-sm text-white/75">
            <p className="border-b border-white/10 pb-4"><strong className="block text-white">{products.filter((product) => product.stock < 10).length} produtos</strong> com menos de 10 unidades.</p>
            <p className="border-b border-white/10 pb-4"><strong className="block text-white">Catalogo temporario</strong> salvo neste computador.</p>
            <p><strong className="block text-white">Backup recomendado</strong> antes da migracao para producao.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

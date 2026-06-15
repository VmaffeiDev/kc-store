import Image from "next/image";
import Link from "next/link";
import { PiPencil, PiPlus, PiTrash } from "react-icons/pi";
import { formatCurrency, products } from "@/data/catalog";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="section-kicker">Catalogo</p><h1 className="font-display mt-2 text-5xl">Produtos</h1></div>
        <Link href="/admin/produtos/novo" className="button-primary"><PiPlus /> Novo produto</Link>
      </div>
      <div className="surface mt-8 overflow-x-auto bg-white p-4">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b text-xs uppercase tracking-wider text-[#777]"><tr><th className="py-3">Produto</th><th>Publico</th><th>Preco</th><th>Estoque</th><th>Status</th><th></th></tr></thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-4"><div className="flex items-center gap-3"><div className="relative size-14 overflow-hidden bg-[#eadcc8]"><Image src={product.image} alt="" fill className="object-cover" /></div><div><strong>{product.name}</strong><small className="block text-[#777]">{product.sku}</small></div></div></td>
                <td>{product.genderCategory}</td><td>{formatCurrency(product.promotionalPrice ?? product.price)}</td><td>{product.stock}</td><td><span className="rounded-full bg-[#eaf1ed] px-3 py-1 text-xs text-[#0d4638]">Ativo</span></td>
                <td><div className="flex gap-2"><button aria-label="Editar" className="grid size-9 place-items-center border"><PiPencil /></button><button aria-label="Excluir" className="grid size-9 place-items-center border text-[#a54c30]"><PiTrash /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

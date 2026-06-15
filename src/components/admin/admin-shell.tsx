"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiChartBar,
  PiCoatHanger,
  PiPackage,
  PiTicket,
  PiUsers,
  PiUserGear,
  PiClockCounterClockwise,
  PiCreditCard,
  PiStorefront,
} from "react-icons/pi";

const links = [
  ["/admin/dashboard", "Dashboard", PiChartBar],
  ["/admin/produtos", "Produtos", PiCoatHanger],
  ["/admin/pedidos", "Pedidos", PiPackage],
  ["/admin/cupons", "Cupons", PiTicket],
  ["/admin/clientes", "Clientes", PiUsers],
  ["/admin/equipe", "Equipe", PiUserGear],
  ["/admin/integracoes", "Integracoes", PiCreditCard],
  ["/admin/auditoria", "Auditoria", PiClockCounterClockwise],
] as const;

export function AdminShell({
  children,
  demo,
}: {
  children: React.ReactNode;
  demo: boolean;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#f3ede3]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#07362c] p-5 text-white lg:block">
        <Link href="/admin/dashboard" className="font-display text-3xl text-[#d8a45b]">Admin K&amp;C</Link>
        <nav className="mt-10 grid gap-1">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold transition ${pathname.startsWith(href) ? "bg-white text-[#07362c]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={20} /> {label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="absolute bottom-6 left-5 right-5 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-white/70"><PiStorefront /> Ver loja</Link>
      </aside>
      <div className="lg:pl-64">
        <header className="flex min-h-20 items-center justify-between border-b border-[#18211e]/10 bg-white px-5 md:px-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#b75432]">K&amp;C STORE</p>
            <p className="font-display text-2xl">Painel administrativo</p>
          </div>
          {demo && <span className="rounded-full bg-[#f5dfbd] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#75401f]">Pre-lancamento local</span>}
        </header>
        <div className="border-b border-[#18211e]/10 bg-[#07362c] px-4 py-3 lg:hidden">
          <nav className="flex gap-4 overflow-x-auto text-xs text-white">
            {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </div>
        <div className="p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}

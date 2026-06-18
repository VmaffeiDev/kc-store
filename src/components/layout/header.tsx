"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  PiInstagramLogo,
  PiList,
  PiMagnifyingGlass,
  PiShoppingBag,
  PiUserCircle,
  PiWhatsappLogo,
  PiX,
} from "react-icons/pi";
import { instagramUrl, whatsappUrl } from "@/lib/contact";
import { useCart } from "@/stores/cart";

const nav = [
  ["Inicio", "/"],
  ["Masculino", "/produtos?publico=MASCULINO"],
  ["Feminino", "/produtos?publico=FEMININO"],
  ["Infantil", "/produtos?publico=INFANTIL"],
  ["Perfumes", "/produtos?categoria=Perfumes"],
  ["Promocoes", "/produtos?promocao=1"],
  ["Contato", "/#contato"],
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const count = useCart((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07362c] text-white">
      <div className="container-store flex h-[76px] items-center justify-between gap-5">
        <Link
          href="/"
          className="font-display whitespace-nowrap text-[30px] font-semibold tracking-[-0.03em] text-[#d8a45b]"
        >
          K&amp;C STORE
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] font-semibold text-white/85 transition hover:text-[#e0ac60]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Abrir busca"
            onClick={() => setSearchOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-full transition hover:bg-white/10"
          >
            <PiMagnifyingGlass size={22} />
          </button>
          <Link
            href="/entrar"
            aria-label="Minha conta"
            className="hidden size-10 place-items-center rounded-full transition hover:bg-white/10 sm:grid"
          >
            <PiUserCircle size={23} />
          </Link>
          <Link
            href="/carrinho"
            aria-label={`Carrinho com ${count} itens`}
            className="relative grid size-10 place-items-center rounded-full transition hover:bg-white/10"
          >
            <PiShoppingBag size={23} />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#d8a45b] text-[10px] font-extrabold text-[#07362c]">
                {count}
              </span>
            )}
          </Link>
          <a
            href={instagramUrl}
            aria-label="Instagram K&C STORE"
            target="_blank"
            rel="noreferrer"
            className="hidden size-10 place-items-center rounded-full transition hover:bg-white/10 md:grid"
          >
            <PiInstagramLogo size={21} />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-bold transition hover:border-[#d8a45b] hover:text-[#d8a45b] md:flex"
          >
            <PiWhatsappLogo size={19} />
            WhatsApp
          </a>
          <button
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((value) => !value)}
            className="grid size-10 place-items-center xl:hidden"
          >
            {menuOpen ? <PiX size={25} /> : <PiList size={25} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form action="/produtos" className="container-store pb-4">
          <label className="sr-only" htmlFor="header-search">
            Buscar produtos
          </label>
          <input
            id="header-search"
            name="busca"
            autoFocus
            placeholder="Busque por camisa, vestido, perfume..."
            className="h-12 w-full rounded-sm bg-white px-4 text-sm text-[#18211e]"
          />
        </form>
      )}

      {menuOpen && (
        <nav className="border-t border-white/10 bg-[#07362c] px-5 py-5 xl:hidden">
          <div className="container-store grid gap-1">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/10 py-3 text-sm font-semibold"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

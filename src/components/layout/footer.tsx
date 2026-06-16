"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiInstagramLogo,
  PiWhatsappLogo,
  PiEnvelopeSimple,
} from "react-icons/pi";
import { NewsletterForm } from "@/components/newsletter-form";
import { instagramUrl, whatsappUrl } from "@/lib/contact";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <footer id="contato" className="bg-[#07362c] text-white">
      <div className="container-store grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="font-display text-4xl text-[#d8a45b]">K&amp;C STORE</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
            Moda masculina, feminina e infantil para acompanhar sua familia em
            cada ocasiao.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              aria-label="Instagram K&C STORE"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="grid size-10 place-items-center rounded-full border border-white/20"
            >
              <PiInstagramLogo size={20} />
            </a>
            <a
              aria-label="WhatsApp: (41) 98419-0059"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="grid size-10 place-items-center rounded-full border border-white/20"
            >
              <PiWhatsappLogo size={20} />
            </a>
            <a aria-label="E-mail" href="mailto:contato@kcstore.com.br" className="grid size-10 place-items-center rounded-full border border-white/20">
              <PiEnvelopeSimple size={20} />
            </a>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8a45b]">Loja</p>
            <div className="grid gap-3 text-sm text-white/70">
              <Link href="/produtos">Todos os produtos</Link>
              <Link href="/produtos?promocao=1">Promocoes</Link>
              <Link href="/minha-conta">Minha conta</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8a45b]">Ajuda</p>
            <div className="grid gap-3 text-sm text-white/70">
              <Link href="/politicas/entrega">Entrega e rastreio</Link>
              <Link href="/politicas/trocas">Trocas e devolucoes</Link>
              <Link href="/politicas/privacidade">Privacidade</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8a45b]">Novidades</p>
            <p className="mb-4 text-sm leading-6 text-white/70">Receba lancamentos e promocoes. Voce pode cancelar quando quiser.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} K&amp;C STORE. Estilo para todos os momentos.
      </div>
    </footer>
  );
}

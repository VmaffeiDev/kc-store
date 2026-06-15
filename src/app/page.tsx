import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  PiArrowRight,
  PiCreditCard,
  PiPackage,
  PiShieldCheck,
  PiWhatsappLogo,
} from "react-icons/pi";
import { products } from "@/data/catalog";
import { ProductCard } from "@/components/product-card";
import { whatsappUrl } from "@/lib/contact";

const HeroThree = dynamic(() =>
  import("@/components/hero-three").then((module) => module.HeroThree),
);

const categories = [
  {
    name: "Masculino",
    text: "Pecas versateis para o seu dia a dia.",
    href: "/produtos?publico=MASCULINO",
    image: "/images/category-men.png",
    tone: "bg-[#153f34]",
  },
  {
    name: "Feminino",
    text: "Elegancia e conforto em cada detalhe.",
    href: "/produtos?publico=FEMININO",
    image: "/images/category-women.png",
    tone: "bg-[#a54c30]",
  },
  {
    name: "Infantil",
    text: "Liberdade para brincar e ser feliz.",
    href: "/produtos?publico=INFANTIL",
    image: "/images/category-kids.png",
    tone: "bg-[#153f34]",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#efe2cf]">
        <div className="grid min-h-[690px] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative z-10 flex items-center py-16 lg:py-20">
            <div className="ml-auto w-full max-w-[540px] px-7 lg:px-12">
              <p className="section-kicker mb-5">Nova colecao Essencia</p>
              <h1 className="font-display max-w-[520px] text-[clamp(58px,7vw,98px)] font-medium leading-[0.84] tracking-[-0.055em] text-[#10231d]">
                Estilo para todos os momentos<span className="text-[#b75432]">.</span>
              </h1>
              <p className="mt-8 max-w-[420px] text-[15px] leading-7 text-[#4e554f]">
                Moda masculina, feminina e infantil para acompanhar voce e sua
                familia em cada ocasiao.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/produtos" className="button-primary">
                  Comprar agora
                </Link>
                <Link href="/produtos?ordem=recentes" className="button-secondary">
                  Ver lancamentos
                </Link>
              </div>
              <div className="mt-12 grid max-w-[460px] grid-cols-3 gap-4 border-t border-[#18211e]/15 pt-6 text-[10px] font-semibold text-[#4b514d]">
                <span className="flex gap-2"><PiPackage size={20} /> Frete para todo o Brasil</span>
                <span className="flex gap-2"><PiShieldCheck size={20} /> Compra segura e garantida</span>
                <span className="flex gap-2"><PiCreditCard size={20} /> Mercado Pago</span>
              </div>
            </div>
          </div>
          <div className="relative min-h-[520px] overflow-hidden lg:min-h-[690px]">
            <Image
              src="/images/hero-window.png"
              alt="Vitrine K&C STORE com moda masculina, feminina e infantil"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-[60%_center]"
            />
            <div className="absolute inset-0 bg-[#07362c]/[0.04]" />
            <HeroThree />
          </div>
        </div>
      </section>

      <section className="bg-[#f8f1e7] py-8 md:py-10">
        <div className="container-store grid gap-3 md:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={category.href}
              className={`tilt-card group relative min-h-[390px] overflow-hidden rounded-[5px] md:min-h-[330px] ${category.tone} ${
                index === 1 ? "md:translate-y-4" : ""
              }`}
            >
              <Image
                src={category.image}
                alt={`Moda ${category.name.toLowerCase()}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <h2 className="font-display text-4xl">{category.name}</h2>
                <p className="mt-2 max-w-[220px] text-sm leading-6 text-white/80">{category.text}</p>
                <span className="mt-7 inline-flex items-center gap-2 border-b border-[#d8a45b] pb-1 text-xs font-bold text-[#f2c878]">
                  Ver categoria <PiArrowRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#fffaf2] py-16 md:py-[72px]">
        <div className="container-store">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="section-kicker">Escolhas que inspiram</p>
              <h2 className="font-display mt-2 text-5xl leading-none md:text-6xl">Destaques<br />para voce</h2>
            </div>
            <Link href="/produtos" className="hidden items-center gap-2 text-xs font-bold md:flex">Ver todos <PiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="bg-[#b75432] py-16 text-white">
        <div className="container-store grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f3c982]">Atendimento humano</p>
            <h2 className="font-display mt-2 text-5xl">Precisa de ajuda para escolher?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">Nossa equipe ajuda com medidas, combinacoes e acompanhamento do pedido.</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-sm bg-[#07362c] px-7 text-sm font-bold"
          >
            <PiWhatsappLogo size={22} /> Falar no WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

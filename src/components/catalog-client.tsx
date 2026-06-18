"use client";

import { useMemo, useState } from "react";
import { PiFunnel, PiMagnifyingGlass } from "react-icons/pi";
import { ProductCard } from "@/components/product-card";
import type { CatalogProduct } from "@/types/store";

export function CatalogClient({
  products,
  initialAudience = "",
  initialCategory = "",
  initialSearch = "",
  promotionOnly = false,
}: {
  products: CatalogProduct[];
  initialAudience?: string;
  initialCategory?: string;
  initialSearch?: string;
  promotionOnly?: boolean;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [audience, setAudience] = useState(initialAudience);
  const [category, setCategory] = useState(initialCategory);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("recentes");
  const categories = useMemo(
    () =>
      Array.from(new Set(["Perfumes", ...products.map((product) => product.category)])).sort(
        (a, b) => a.localeCompare(b, "pt-BR"),
      ),
    [products],
  );

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return products
      .filter(
        (product) =>
          (!promotionOnly || product.promotionalPrice) &&
          (!audience || product.genderCategory === audience) &&
          (!category ||
            product.category.localeCompare(category, "pt-BR", {
              sensitivity: "base",
            }) === 0) &&
          (!size || product.sizes.includes(size)) &&
          (!color || product.colors.includes(color)) &&
          (!normalized ||
            `${product.name} ${product.category} ${product.shortDescription}`
              .toLowerCase()
              .includes(normalized)),
      )
      .sort((a, b) => {
        const priceA = a.promotionalPrice ?? a.price;
        const priceB = b.promotionalPrice ?? b.price;
        if (sort === "menor") return priceA - priceB;
        if (sort === "maior") return priceB - priceA;
        return b.id.localeCompare(a.id);
      });
  }, [audience, category, color, products, promotionOnly, search, size, sort]);

  return (
    <div className="container-store py-12">
      <div className="mb-10 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="section-kicker">Curadoria K&amp;C STORE</p>
          <h1 className="font-display mt-2 text-6xl">Encontre seu estilo</h1>
          <p className="mt-3 text-sm text-[#69706b]">
            {filtered.length} produtos encontrados
          </p>
        </div>
        <label className="relative block">
          <PiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produto"
            className="input-store min-w-[290px] pl-11"
          />
        </label>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-3 border-y border-[#18211e]/10 py-5">
        <span className="mr-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
          <PiFunnel /> Filtros
        </span>
        <select className="input-store !w-auto" value={audience} onChange={(event) => setAudience(event.target.value)}>
          <option value="">Todos os publicos</option>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMININO">Feminino</option>
          <option value="INFANTIL">Infantil</option>
        </select>
        <select className="input-store !w-auto" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="input-store !w-auto" value={size} onChange={(event) => setSize(event.target.value)}>
          <option value="">Todos os tamanhos</option>
          {["P", "M", "G", "GG", "4", "6", "8", "10", "38", "39", "40", "41"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="input-store !w-auto" value={color} onChange={(event) => setColor(event.target.value)}>
          <option value="">Todas as cores</option>
          {["Marfim", "Areia", "Terracota", "Verde oliva", "Caramelo", "Oliva"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="input-store ml-auto !w-auto" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="menor">Menor preco</option>
          <option value="maior">Maior preco</option>
        </select>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="surface py-20 text-center">
          <h2 className="font-display text-4xl">Nenhum produto por aqui</h2>
          <p className="mt-2 text-sm text-[#69706b]">Tente remover alguns filtros.</p>
        </div>
      )}
    </div>
  );
}

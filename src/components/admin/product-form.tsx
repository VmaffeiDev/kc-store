"use client";

import { useState } from "react";
import { PiMagicWand, PiUploadSimple } from "react-icons/pi";

export function ProductForm() {
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState<Record<string, unknown> | null>(null);

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_360px]"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const body = await response.json();
        setMessage(response.ok ? "Produto salvo." : body.error ?? "Configure o banco.");
      }}
    >
      <div className="grid gap-6">
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Informacoes principais</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold md:col-span-2">Nome<input name="name" required className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Categoria<select name="category" className="input-store mt-2"><option>Camisas</option><option>Vestidos</option><option>Calcados</option><option>Acessorios</option></select></label>
            <label className="text-xs font-bold">Publico<select name="genderCategory" className="input-store mt-2"><option>MASCULINO</option><option>FEMININO</option><option>INFANTIL</option><option>UNISSEX</option></select></label>
            <label className="text-xs font-bold">Preco<input name="price" type="number" step="0.01" required className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Preco promocional<input name="promotionalPrice" type="number" step="0.01" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Material<input name="material" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Estilo<input name="style" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Cores<input name="color" placeholder="Oliva, Marfim" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Tamanhos<input name="size" placeholder="P, M, G" className="input-store mt-2" /></label>
          </div>
          <button
            type="button"
            onClick={async (event) => {
              const form = event.currentTarget.form!;
              const data = new FormData(form);
              setMessage("Gerando descricao...");
              const response = await fetch("/api/ai/generate-product-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: data.get("name"),
                  category: data.get("category"),
                  genderCategory: data.get("genderCategory"),
                  color: data.get("color"),
                  size: data.get("size"),
                  material: data.get("material"),
                  style: data.get("style"),
                  price: data.get("price"),
                }),
              });
              const body = await response.json();
              if (response.ok) setGenerated(body);
              setMessage(response.ok ? "Texto gerado. Revise antes de salvar." : body.error ?? "IA nao configurada.");
            }}
            className="button-secondary mt-5"
          >
            <PiMagicWand /> Gerar descricao com IA
          </button>
        </section>
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Conteudo e SEO</h2>
          <div className="mt-5 grid gap-4">
            <label className="text-xs font-bold">Descricao curta<textarea name="shortDescription" defaultValue={String(generated?.shortDescription ?? "")} key={`short-${String(generated?.shortDescription)}`} className="input-store mt-2 min-h-24 py-3" /></label>
            <label className="text-xs font-bold">Descricao completa<textarea name="description" defaultValue={String(generated?.fullDescription ?? "")} key={`full-${String(generated?.fullDescription)}`} className="input-store mt-2 min-h-36 py-3" /></label>
            <label className="text-xs font-bold">SEO title<input name="seoTitle" defaultValue={String(generated?.seoTitle ?? "")} key={`seo-${String(generated?.seoTitle)}`} className="input-store mt-2" /></label>
            <label className="text-xs font-bold">SEO description<textarea name="seoDescription" defaultValue={String(generated?.seoDescription ?? "")} key={`desc-${String(generated?.seoDescription)}`} className="input-store mt-2 min-h-24 py-3" /></label>
          </div>
        </section>
      </div>
      <aside className="grid h-fit gap-6">
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Imagens</h2>
          <label className="mt-5 grid min-h-48 cursor-pointer place-items-center border border-dashed border-[#18211e]/25 text-center text-sm text-[#6f746f]">
            <span><PiUploadSimple size={30} className="mx-auto mb-2" />Upload assinado Cloudinary<br /><small>JPG, PNG ou WebP</small></span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" />
          </label>
        </section>
        <section className="surface bg-white p-6">
          <label className="flex items-center justify-between text-sm font-bold">Ativo<input name="isActive" type="checkbox" defaultChecked /></label>
          <label className="mt-4 flex items-center justify-between text-sm font-bold">Destaque<input name="isFeatured" type="checkbox" /></label>
          <label className="mt-4 flex items-center justify-between text-sm font-bold">Promocao<input name="isPromotion" type="checkbox" /></label>
          <button className="button-primary mt-6 w-full">Salvar produto</button>
          <p aria-live="polite" className="mt-3 text-center text-xs text-[#8d3f27]">{message}</p>
        </section>
      </aside>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PiMagicWand, PiUploadSimple } from "react-icons/pi";

type GeneratedDescription = {
  shortDescription?: string;
  fullDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
};

async function getResponseError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error ?? fallback;
}

export function ProductForm() {
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState<GeneratedDescription | null>(null);
  const [imageName, setImageName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_360px]"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) {
          setMessage("Preencha os campos obrigatorios antes de salvar.");
          return;
        }
        setSaving(true);
        setMessage("Enviando imagem...");
        const formData = new FormData(form);
        const imageFile = formData.get("image");
        if (!(imageFile instanceof File) || imageFile.size === 0) {
          setMessage("Selecione uma imagem do produto.");
          setSaving(false);
          return;
        }
        const uploadData = new FormData();
        uploadData.set("image", imageFile);
        const uploadResponse = await fetch("/api/admin/uploads", {
          method: "POST",
          body: uploadData,
        });
        if (!uploadResponse.ok) {
          setMessage(
            await getResponseError(
              uploadResponse,
              "Nao foi possivel enviar a imagem.",
            ),
          );
          setSaving(false);
          return;
        }
        const uploadBody = await uploadResponse.json();

        setMessage("Imagem enviada. Salvando produto...");
        const data = Object.fromEntries(formData);
        delete data.image;
        data.image = uploadBody.url;
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          setMessage(
            await getResponseError(response, "Nao foi possivel salvar."),
          );
          setSaving(false);
          return;
        }
        setMessage("Produto salvo e publicado na loja.");
        form.reset();
        setGenerated(null);
        setImageName("");
        setPreviewUrl("");
        setSaving(false);
      }}
    >
      <div className="grid gap-6">
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Informacoes principais</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold md:col-span-2">Nome<input name="name" required className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Categoria<select name="category" className="input-store mt-2"><option>Camisas</option><option>Vestidos</option><option>Calcados</option><option>Acessorios</option><option>Perfumes</option></select></label>
            <label className="text-xs font-bold">Publico<select name="genderCategory" className="input-store mt-2"><option>MASCULINO</option><option>FEMININO</option><option>INFANTIL</option><option>UNISSEX</option></select></label>
            <label className="text-xs font-bold">Preco<input name="price" type="number" step="0.01" required className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Preco promocional<input name="promotionalPrice" type="number" step="0.01" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Material<input name="material" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Estilo<input name="style" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Cores<input name="color" required placeholder="Oliva, Marfim" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Tamanhos<input name="size" required placeholder="P, M, G" className="input-store mt-2" /></label>
            <label className="text-xs font-bold">Estoque por variacao<input name="stock" type="number" min="0" defaultValue="1" required className="input-store mt-2" /></label>
          </div>
          <button
            type="button"
            onClick={async (event) => {
              const form = event.currentTarget.form!;
              const data = new FormData(form);
              const name = String(data.get("name") ?? "").trim();
              const price = Number(data.get("price"));
              if (name.length < 2 || !Number.isFinite(price) || price <= 0) {
                setMessage("Preencha nome e preco antes de gerar a descricao.");
                return;
              }
              setGenerating(true);
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
              if (!response.ok) {
                setMessage(
                  await getResponseError(
                    response,
                    "Nao foi possivel gerar a descricao.",
                  ),
                );
                setGenerating(false);
                return;
              }
              const body = (await response.json()) as GeneratedDescription;
              setGenerated(body);
              setMessage("Texto gerado. Revise antes de salvar.");
              setGenerating(false);
            }}
            disabled={generating}
            className="button-secondary mt-5"
          >
            <PiMagicWand /> {generating ? "Gerando..." : "Gerar descricao com IA"}
          </button>
        </section>
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Conteudo e SEO</h2>
          <div className="mt-5 grid gap-4">
            <label className="text-xs font-bold">Descricao curta<textarea name="shortDescription" required minLength={10} defaultValue={String(generated?.shortDescription ?? "")} key={`short-${String(generated?.shortDescription)}`} className="input-store mt-2 min-h-24 py-3" /></label>
            <label className="text-xs font-bold">Descricao completa<textarea name="description" required minLength={20} defaultValue={String(generated?.fullDescription ?? "")} key={`full-${String(generated?.fullDescription)}`} className="input-store mt-2 min-h-36 py-3" /></label>
            <label className="text-xs font-bold">SEO title<input name="seoTitle" defaultValue={String(generated?.seoTitle ?? "")} key={`seo-${String(generated?.seoTitle)}`} className="input-store mt-2" /></label>
            <label className="text-xs font-bold">SEO description<textarea name="seoDescription" defaultValue={String(generated?.seoDescription ?? "")} key={`desc-${String(generated?.seoDescription)}`} className="input-store mt-2 min-h-24 py-3" /></label>
          </div>
        </section>
      </div>
      <aside className="grid h-fit gap-6">
        <section className="surface bg-white p-6">
          <h2 className="font-display text-3xl">Imagens</h2>
          <label className="mt-5 grid min-h-48 cursor-pointer place-items-center border border-dashed border-[#18211e]/25 text-center text-sm text-[#6f746f]">
            {previewUrl ? (
              <span className="grid gap-3 p-3">
                <span
                  aria-label="Pre-visualizacao da imagem selecionada"
                  className="mx-auto aspect-[4/5] h-56 rounded-sm bg-cover bg-center"
                  style={{ backgroundImage: `url("${previewUrl}")` }}
                />
                <strong className="text-[#0d4638]">{imageName}</strong>
                <small>Clique para trocar a imagem.</small>
              </span>
            ) : (
              <span><PiUploadSimple size={30} className="mx-auto mb-2" />Selecionar imagem principal<br /><small>JPG, PNG ou WebP, ate 5 MB</small></span>
            )}
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) {
                  setImageName("");
                  setPreviewUrl("");
                  return;
                }
                setImageName(file.name);
                setPreviewUrl(URL.createObjectURL(file));
                setMessage("Imagem selecionada. Agora preencha os dados e salve o produto.");
              }}
            />
          </label>
        </section>
        <section className="surface bg-white p-6">
          <label className="flex items-center justify-between text-sm font-bold">Ativo<input name="isActive" type="checkbox" defaultChecked /></label>
          <label className="mt-4 flex items-center justify-between text-sm font-bold">Destaque<input name="isFeatured" type="checkbox" /></label>
          <label className="mt-4 flex items-center justify-between text-sm font-bold">Promocao<input name="isPromotion" type="checkbox" /></label>
          <button disabled={saving} className="button-primary mt-6 w-full">
            {saving ? "Salvando..." : "Salvar produto"}
          </button>
          <p aria-live="polite" className="mt-3 text-center text-xs text-[#8d3f27]">{message}</p>
        </section>
      </aside>
    </form>
  );
}

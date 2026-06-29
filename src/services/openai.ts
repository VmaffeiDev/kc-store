import "server-only";

import OpenAI from "openai";
import {
  generatedDescriptionSchema,
  type productDescriptionSchema,
} from "@/lib/validation";
import type { z } from "zod";

type ProductDescriptionInput = z.infer<typeof productDescriptionSchema>;

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function fallbackProductDescription(input: ProductDescriptionInput) {
  const name = input.name.trim();
  const category = input.category.toLowerCase();
  const audience = input.genderCategory.toLowerCase();
  const material = input.material?.trim() || "acabamento selecionado";
  const color = input.color?.trim() || "cores versateis";
  const size = input.size?.trim() || "tamanhos variados";
  const style = input.style?.trim() || "estilo casual";
  const suggestedName = titleCase(name);

  return generatedDescriptionSchema.parse({
    suggestedName,
    shortDescription: `${suggestedName} com ${material}, pensado para compor looks ${style} com praticidade e presenca.`,
    fullDescription: `O ${suggestedName} e uma escolha versatil para o publico ${audience}. Com ${material}, opcoes em ${color} e disponibilidade em ${size}, combina conforto, acabamento bonito e uso facil no dia a dia. Ideal para quem busca uma peca de ${category} com visual atual e pronta para diferentes momentos.`,
    benefits: [
      "Visual facil de combinar",
      "Boa opcao para uso diario",
      "Cadastro pronto para vitrine online",
      "Descricao comercial revisavel pelo admin",
      "Texto otimizado para compra pelo WhatsApp ou carrinho",
    ],
    tags: [input.category, input.genderCategory, color, material, style]
      .map((item) => item.trim())
      .filter(Boolean),
    seoTitle: `${suggestedName} | K&C Store`,
    seoDescription: `${suggestedName} na K&C Store. Confira cores, tamanhos, preco e disponibilidade para compra online.`,
    instagramCaption: `Novo na K&C Store: ${suggestedName}. Uma escolha versatil para renovar o visual com praticidade. Confira no site.`,
  });
}

export async function generateProductDescription(input: ProductDescriptionInput) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackProductDescription(input);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const schema = {
    type: "object",
    additionalProperties: false,
    required: [
      "suggestedName",
      "shortDescription",
      "fullDescription",
      "benefits",
      "tags",
      "seoTitle",
      "seoDescription",
      "instagramCaption",
    ],
    properties: {
      suggestedName: { type: "string" },
      shortDescription: { type: "string" },
      fullDescription: { type: "string" },
      benefits: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: { type: "string" },
      },
      tags: { type: "array", items: { type: "string" } },
      seoTitle: { type: "string" },
      seoDescription: { type: "string" },
      instagramCaption: { type: "string" },
    },
  } as const;

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "Voce e especialista em copywriting para e-commerce de moda no Brasil. Nao invente informacoes. Escreva em portugues do Brasil, com linguagem clara, profissional e comercial.",
        },
        {
          role: "user",
          content: `Crie a comunicacao do produto com base apenas nestes dados:
Nome: ${input.name}
Categoria: ${input.category}
Publico: ${input.genderCategory}
Cor: ${input.color}
Tamanho: ${input.size}
Material: ${input.material}
Estilo: ${input.style}
Preco: R$ ${input.price.toFixed(2)}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "product_description",
          strict: true,
          schema,
        },
      },
    });

    return generatedDescriptionSchema.parse(JSON.parse(response.output_text));
  } catch {
    return fallbackProductDescription(input);
  }
}

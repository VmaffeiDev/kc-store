import "server-only";

import OpenAI from "openai";
import {
  generatedDescriptionSchema,
  type productDescriptionSchema,
} from "@/lib/validation";
import type { z } from "zod";

type ProductDescriptionInput = z.infer<typeof productDescriptionSchema>;

export async function generateProductDescription(input: ProductDescriptionInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY nao configurada.");
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
}

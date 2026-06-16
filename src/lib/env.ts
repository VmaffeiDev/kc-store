import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5.4-mini"),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  MERCADO_PAGO_STATEMENT_DESCRIPTOR: z.string().max(13).default("KC STORE"),
  MELHOR_ENVIO_BASE_URL: z
    .string()
    .url()
    .default("https://sandbox.melhorenvio.com.br"),
  MELHOR_ENVIO_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().default("K&C STORE <pedidos@example.com>"),
});

export const env = envSchema.parse(process.env);

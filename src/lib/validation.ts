import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Inclua uma letra maiuscula.")
    .regex(/[0-9]/, "Inclua um numero."),
  marketingConsent: z.boolean().default(false),
});

export const productDescriptionSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  genderCategory: z.string().min(2),
  color: z.string().optional().default(""),
  size: z.string().optional().default(""),
  material: z.string().optional().default(""),
  style: z.string().optional().default(""),
  price: z.coerce.number().positive(),
});

export const generatedDescriptionSchema = z.object({
  suggestedName: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  benefits: z.array(z.string()).length(5),
  tags: z.array(z.string()),
  seoTitle: z.string(),
  seoDescription: z.string(),
  instagramCaption: z.string(),
});

export const shippingQuoteSchema = z.object({
  postalCode: z.string().regex(/^\d{8}$/),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        width: z.number().positive().default(20),
        height: z.number().positive().default(10),
        length: z.number().positive().default(25),
        weight: z.number().positive().default(0.4),
      }),
    )
    .min(1),
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.email(),
    phone: z.string().min(10),
    document: z.string().optional(),
  }),
  address: z.object({
    line1: z.string().min(3),
    line2: z.string().optional(),
    district: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2),
    postalCode: z.string().regex(/^\d{8}$/),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive().max(10),
      }),
    )
    .min(1),
  couponCode: z.string().optional(),
  shipping: z.object({
    serviceId: z.string(),
    serviceName: z.string(),
    price: z.number().nonnegative(),
    deliveryDays: z.number().int().positive(),
  }),
});

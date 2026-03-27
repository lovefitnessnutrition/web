import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const planes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/planes" }),
  schema: z.object({
    title: z.string(),
    price: z.string(),
    period: z.string(),
    features: z.array(z.string()),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    order: z.number().optional(),
  }),
});

const equipo = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/equipo" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    specialties: z.array(z.string()),
    photo: z.string(),
    whatsappNumber: z.string(),
    order: z.number().optional(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { planes, equipo, faq };

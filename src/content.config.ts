import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const processEnum = z.enum([
  'washed',
  'natural',
  'honey',
  'anaerobic',
  'other',
]);

const methodEnum = z.enum([
  'V60',
  'Chemex',
  'AeroPress',
  'Orea',
  'Espresso',
  'French Press',
  'Moka',
  'Cold Brew',
  'other',
]);

const tadimlar = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tadimlar' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    coverImage: z.string().optional(),
    summary: z.string(),
    coffee: z.object({
      roaster: z.string(),
      origin: z.string(),
      region: z.string().optional(),
      farm: z.string().optional(),
      variety: z.string().optional(),
      process: processEnum,
      roastDate: z.coerce.date().optional(),
    }),
    brew: z.object({
      method: methodEnum,
      grindSize: z.string().optional(),
      ratio: z.string().optional(),
      water: z.string().optional(),
      time: z.string().optional(),
    }),
    rating: z.object({
      overall: z.number().min(0).max(100),
      aroma: z.number().min(0).max(10).optional(),
      acidity: z.number().min(0).max(10).optional(),
      body: z.number().min(0).max(10).optional(),
      sweetness: z.number().min(0).max(10).optional(),
      aftertaste: z.number().min(0).max(10).optional(),
      flavorNotes: z.array(z.string()).default([]),
    }),
  }),
});

export const collections = { tadimlar };

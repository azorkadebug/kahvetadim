import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { renkAdlari } from './lib/renkler';

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

/**
 * Keystatic'te "Diğer" seçilince elle yazılan metin için koşullu alan.
 * Diskte iki biçim olabilir: eski düz değer (`process: natural`) ya da
 * Keystatic conditional biçimi (`process: { discriminant: other, value: Natural OX }`).
 * İkisi de { kind, custom } yapısına normalize edilir.
 */
const choice = <T extends [string, ...string[]]>(e: z.ZodEnum<T>) =>
  z
    .union([e, z.object({ discriminant: e, value: z.string().nullish() })])
    .transform((v) =>
      typeof v === 'string'
        ? { kind: v, custom: undefined as string | undefined }
        : { kind: v.discriminant, custom: v.value?.trim() || undefined }
    );

const tadimlar = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tadimlar' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      coverImage: image().optional(),
      summary: z.string(),
      seoDescription: z.string().optional(),
      renk: z.enum(renkAdlari).default('turuncu'),
      coffee: z.object({
        roaster: z.string(),
        origin: z.string(),
        region: z.string().optional(),
        farm: z.string().optional(),
        variety: z.string().optional(),
        process: choice(processEnum),
        roastDate: z.coerce.date().optional(),
        // Gövde metnindeki "Kahve Künyesi" listesinden şeride taşındı.
        altitude: z.string().optional(),
        roastLevel: z.string().optional(),
        roastMachine: z.string().optional(),
      }),
      brew: z.object({
        method: choice(methodEnum),
        grindSize: z.string().optional(),
        ratio: z.string().optional(),
        water: z.string().optional(),
        time: z.string().optional(),
        // Gövde metnindeki emoji satırlarından şeride taşındı.
        waterTemp: z.string().optional(),
        bloom: z.string().optional(),
        pour: z.string().optional(),
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

const sayfalar = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/sayfalar' }),
  schema: z.object({
    kicker: z.string().optional(),
    title: z.string(),
  }),
});

export const collections = { tadimlar, sayfalar };

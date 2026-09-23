// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

const isDev = process.argv.slice(2).includes('dev');

// Türkçe 404: Astro src/pages/tr/404.astro'yu dist/tr/404/index.html olarak
// yazıyor, Cloudflare ise en yakın "404.html" dosyasını arıyor → build sonunda taşı.
const trNotFound = {
  name: 'tr-404',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const { rename, rm } = await import('node:fs/promises');
      const { fileURLToPath } = await import('node:url');
      const root = fileURLToPath(dir);
      await rename(`${root}tr/404/index.html`, `${root}tr/404.html`);
      await rm(`${root}tr/404`, { recursive: true, force: true });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://cuppindog.com',
  trailingSlash: isDev ? 'ignore' : 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      // EN kökte (/...), TR /tr/... altında. Varsayılan dil öneksiz kalır.
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    mdx(),
    sitemap({ filter: (page) => !/\/404\/?$/.test(page) }),
    trNotFound,
    ...(isDev ? [react(), keystatic()] : []),
  ],
});

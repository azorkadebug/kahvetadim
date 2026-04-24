// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

import cloudflare from "@astrojs/cloudflare";

const isDev = process.argv.slice(2).includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://kahvetadim.com',
  trailingSlash: isDev ? 'ignore' : 'always',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    mdx(),
    sitemap(),
    ...(isDev ? [react(), keystatic()] : []),
  ],

  adapter: cloudflare()
});
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://your-domain.pages.dev',
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  integrations: [react()],
});

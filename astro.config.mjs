import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://senses.dhurta.org',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  output: 'static',
  build: {
    assets: '_senses',
  },
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom', 'zustand', 'fuse.js'],
    },
  },
});

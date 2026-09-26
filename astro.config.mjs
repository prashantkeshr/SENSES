import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://senses.dhurta.com',
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

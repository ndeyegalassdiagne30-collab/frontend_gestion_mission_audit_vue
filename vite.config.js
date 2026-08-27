import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Port fixe : l'origine du frontend doit rester celle autorisee par
  // FRONTEND_ORIGIN cote backend (sinon le navigateur bloque les requetes en CORS).
  server: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});

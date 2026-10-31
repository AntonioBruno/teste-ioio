import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';

// Configuração mínima: o site é estático (HTML + CSS + ES modules).
export default defineConfig({
  base: './',            // caminhos relativos -> o build funciona em qualquer subpasta/hospedagem
  server: { port: 5173, open: true },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  plugins: [
    {
      // O QR Code Pix é carregado por caminho dinâmico (js/config.js), então copiamos a pasta para o build.
      name: 'copiar-assets-pix',
      closeBundle() {
        if (existsSync('assets/pix')) cpSync('assets/pix', 'dist/assets/pix', { recursive: true });
      },
    },
  ],
});

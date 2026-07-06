import { defineConfig } from 'vite';

// Em produção no GitHub Pages, o jogo é servido de /<repo>/. A action de deploy
// injeta VITE_BASE — em dev local o base fica em './' (fica ok em qualquer path).
export default defineConfig({
  base: process.env.VITE_BASE || './',
  server: {
    host: true,
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});

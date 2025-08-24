import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  publicDir: '../public',
  server: {
    open: true
  }
});
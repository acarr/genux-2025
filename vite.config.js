import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { minify } from 'terser';

export default defineConfig({
  root: 'src',
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      plugins: [
        {
          name: 'minify-script',
          async writeBundle() {
            const scriptContent = readFileSync('src/script.js', 'utf8');
            const minified = await minify(scriptContent, {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                passes: 2
              },
              mangle: {
                toplevel: true
              },
              format: {
                comments: false
              }
            });
            writeFileSync('dist/script.js', minified.code);
          }
        }
      ]
    }
  },
  publicDir: '../public',
  server: {
    open: true
  }
});
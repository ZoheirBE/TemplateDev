import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'shared': resolve(__dirname, 'src/shared')
    }
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'src/main/index.ts',
        onstart(args) {
          if (process.env.VSCODE_DEBUG) {
            console.log('[VITE] Skipping Electron auto-start');
          }
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            minify: false,
            sourcemap: true,
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      preload: {
        input: 'src/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            minify: false,
            sourcemap: true,
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      renderer: {
        root: '.',
        entry: 'src/renderer/index.tsx'
      }
    })
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        tablist: resolve(__dirname, 'tablist.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        // assetFileNames: (assetInfo) => {
          //   if (assetInfo.name === 'tablist.js') {
            //     return 'tablist.js';
            //   }
            //   return assetInfo.name;
            // },
        assetFileNames: '[name].[ext]',
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  publicDir: 'public',
});

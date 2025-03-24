import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name as string;
          // Keep the original path for icons and manifest
          if (info.includes('icons/') || info === 'manifest.json') {
            return '[name].[ext]';
          }
          return 'assets/[name].[ext]';
        }
      }
    },
    // Ensure manifest.json and icons are copied to dist
    copyPublicDir: true
  }
})

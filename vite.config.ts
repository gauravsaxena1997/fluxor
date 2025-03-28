import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-icons',
      async buildEnd() {
        const sizes = [16, 48, 128];
        const svgPath = resolve(__dirname, 'src/extension/icons/icon.svg');
        
        for (const size of sizes) {
          await sharp(svgPath)
            .resize(size, size)
            .png()
            .toFile(resolve(__dirname, `src/extension/icons/icon${size}.png`));
        }
      }
    },
    {
      name: 'build-background-script',
      apply: 'build',
      writeBundle() {
        console.log('Extension background script built successfully!');
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/extension/background.ts'),
        blocked: resolve(__dirname, 'src/blocked.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? '[name].js' : 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name as string;
          if (info.includes('extension/') || 
              info === 'manifest.json' || 
              info === 'rules.json') {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        manualChunks(id) {
          if (id.includes('blocked.html')) {
            return 'blocked';
          }
        }
      }
    }
  },
  // Use relative paths for assets
  base: './',
  // Ensure extension files are copied to dist
  publicDir: 'src/extension'
})

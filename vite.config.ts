import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react()
  ],

  root: 'src',
  publicDir: '../public',

  build: {
    outDir: '../dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        app: resolve(__dirname, './src/index.html'),
        background: resolve(__dirname, './src/background.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})

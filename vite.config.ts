import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',

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
  },

  test: {
    coverage: {
      provider: 'istanbul'
    },

    dir: './tests'
  }
})

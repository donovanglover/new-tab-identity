import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  root: 'src',

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,

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

  plugins: [
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla_${i}`
    })
  ],

  test: {
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['lib/**'],

      reporter: ['text'],
      reportsDirectory: '../dist',
      clean: false,

      thresholds: {
        100: true
      }
    },

    dir: './tests'
  }
})

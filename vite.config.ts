import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  root: 'src',

  resolve: {
    alias: {
      '@': resolve(__dirname, './src/')
    }
  },

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
      },

      onwarn (warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }

        warn(warning)
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
    environment: 'jsdom',

    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['lib/**', 'components/**'],

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

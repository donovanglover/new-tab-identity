import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: 'src',
  cacheDir: resolve(import.meta.dirname, 'node_modules/.vite'),

  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src/')
    }
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,

    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, './src/index.html'),
        background: resolve(import.meta.dirname, './src/background.ts')
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

  test: {
    environment: 'jsdom',

    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['lib/**', 'components/**', 'types/**'],

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

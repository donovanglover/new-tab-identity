import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  verbose: true,

  collectCoverageFrom: [
    './src/**/*.ts'
  ],

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  setupFiles: [
    'jest-webextension-mock'
  ]
}

export default config

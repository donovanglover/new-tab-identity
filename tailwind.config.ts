import { base16Tailwind } from '@donovanglover/base16-tailwind'
import type { Config } from 'tailwindcss'

const tailwindConfig: Config = {
  content: [
    './src/**/*.{ts,tsx}'
  ],
  plugins: [
    base16Tailwind({
      customPath: 'node_modules/@donovanglover/base16-tailwind/schemes'
    })
  ]
}

export default tailwindConfig

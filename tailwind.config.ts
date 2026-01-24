import type { Config } from 'tailwindcss'
// Use Apple DS Tailwind preset
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import preset from '@smart-coder-labs/apple-design-system/tailwind.preset'

const config: Config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@smart-coder-labs/apple-design-system/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config

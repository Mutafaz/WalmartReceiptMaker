import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'walmart-blue': '#0071DC',
        'walmart-black': '#000000',
      },
      fontFamily: {
        receipt: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config; 
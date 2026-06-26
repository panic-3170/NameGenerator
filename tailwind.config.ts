import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './utils/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f6f2',
          100: '#ede9df',
          200: '#e5e3dc',
          300: '#cfccc1',
          400: '#8a8780',
          500: '#5a5853',
          600: '#3a3935',
          700: '#26251f',
          800: '#1a1a1a',
          900: '#0e0e0d'
        },
        paper: {
          DEFAULT: '#fafaf7',
          dark: '#f3f1ea'
        },
        cinnabar: {
          DEFAULT: '#a8323a',
          dark: '#8a272f',
          light: '#c45760'
        },
        celadon: {
          DEFAULT: '#4a6670',
          light: '#7a9099'
        }
      },
      fontFamily: {
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          'STSong',
          'SimSun',
          'serif'
        ],
        kai: [
          '"LXGW WenKai"',
          '"Ma Shan Zheng"',
          'STKaiti',
          'KaiTi',
          'serif'
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      maxWidth: {
        prose: '720px',
        content: '1080px'
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(26, 26, 26, 0.04)',
        'card-hover': '0 10px 30px -10px rgba(26, 26, 26, 0.12), 0 2px 6px -2px rgba(26, 26, 26, 0.05)'
      }
    }
  }
}

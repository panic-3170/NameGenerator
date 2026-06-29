// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  ssr: true,

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '取名神器 - 中文网名生成器 | 音韵优美 · 有典故寓意',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            '免费中文网名生成器：基于音韵评分与主题词库，生成 2-4 字音韵优美、字形讲究、有诗词典故寓意的中文网名。完全本地处理，无需注册，保护隐私。'
        },
        {
          name: 'keywords',
          content:
            '网名生成器,中文网名,起名,取名,游戏昵称,笔名,品牌名,网名,昵称生成器,文艺网名,二次元网名,电商网名'
        },
        { name: 'author', content: '取名神器' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#fafaf7' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:site_name', content: '取名神器' },
        {
          property: 'og:title',
          content: '取名神器 - 中文网名生成器 | 音韵优美 · 有典故寓意'
        },
        {
          property: 'og:description',
          content: '免费本地生成有音韵、有寓意的中文网名。基于 6 维音韵评分与主题词库。'
        },
        { property: 'og:url', content: 'https://namegen.apppss.com/' },
        { property: 'og:image', content: 'https://namegen.apppss.com/og-image.svg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: '取名神器 - 有音韵、有寓意的中文网名生成器' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: '取名神器 - 中文网名生成器'
        },
        {
          name: 'twitter:description',
          content: '免费本地生成有音韵、有寓意的中文网名。'
        },
        { name: 'twitter:image', content: 'https://namegen.apppss.com/og-image.svg' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon-32x32.svg', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/favicon-192x192.svg', sizes: '192x192' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'canonical', href: 'https://namegen.apppss.com/' },
        { rel: 'alternate', type: 'text/plain', href: 'https://namegen.apppss.com/llms.txt', title: 'LLM-friendly description' }
      ]
    }
  },

  site: {
    url: 'https://namegen.apppss.com',
    name: '取名神器'
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about', '/privacy', '/sitemap.xml', '/robots.txt']
    }
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: 'true'
    }
  }
})

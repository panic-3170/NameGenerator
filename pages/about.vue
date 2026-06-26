<script setup lang="ts">
useHead({
  title: '关于取名神器 - 中文网名生成器',
  meta: [
    {
      name: 'description',
      content: '关于取名神器：一个纯本地运行、专注音韵与寓意的中文网名生成器。'
    }
  ]
})
</script>

<template>
  <article class="container-prose py-16 sm:py-24">
    <header>
      <p class="label-sm text-cinnabar">关于</p>
      <h1 class="mt-3 text-3xl sm:text-4xl font-serif-cn text-ink-900">关于取名神器</h1>
    </header>

    <div class="mt-8 space-y-6 text-ink-700 leading-relaxed">
      <p>
        取名神器是一款<strong class="text-ink-900">纯浏览器本地</strong>运行的中文网名生成工具。
        我们不收集任何数据，不写 Cookie，不做用户追踪——所有计算都在你的设备上完成。
      </p>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-6">为什么做这个工具？</h2>
      <p>
        现有的批量起名工具大多采用「字典随机拼字」的方式，生成的名字生硬无意境。
        取名神器把「音韵评分 + 主题词库 + 典故寓意」做成开箱即用的本地能力，
        让普通人也能在 30 秒内得到一个音韵优美、字形讲究、有诗词典故寓意的中文网名。
      </p>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-6">核心特性</h2>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong class="text-ink-900">零后端</strong>：所有数据随构建产物发布，纯静态站点</li>
        <li><strong class="text-ink-900">6 维音韵评分</strong>：声调起伏、押韵、平仄、字形、寓意、易读性</li>
        <li><strong class="text-ink-900">6 大主题词库</strong>：电商、科技、文艺、二次元、山水自然、通用</li>
        <li><strong class="text-ink-900">AI 增强（可选）</strong>：用户自备 OpenAI 兼容 Key，本地生成的 Top 5 作为风格种子二次创作</li>
        <li><strong class="text-ink-900">SEO & GEO 友好</strong>：语义化 HTML、JSON-LD 结构化数据、完整 FAQ</li>
      </ul>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-6">技术栈</h2>
      <ul class="list-disc pl-5 space-y-2">
        <li>Nuxt 3 (SSG) — 静态生成，利于 SEO</li>
        <li>Tailwind CSS — utility-first 样式</li>
        <li>TypeScript — 类型安全</li>
        <li>pinyin-pro — 汉字转拼音与声调</li>
        <li>GitHub Pages — 零成本部署</li>
      </ul>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-6">开源 & 反馈</h2>
      <p>
        我们欢迎所有形式的反馈：报告坏名字、提建议、贡献新词库。
        仓库地址与联系方式将随正式发布同步公开。
      </p>
    </div>
  </article>
</template>

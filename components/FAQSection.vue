<script setup lang="ts">
const faqs = [
  {
    q: '这个网名生成器是免费的吗？',
    a: '完全免费，核心生成功能在浏览器本地完成，无需注册，无任何费用。AI 增强是可选功能，需要你自备 OpenAI 兼容的 API Key（费用由对应服务商收取）。'
  },
  {
    q: '生成的名字会重复吗？',
    a: '不会。我们基于 200+ 精选美字、6 大主题词库与多套模板组合，候选池极大；算法还会做去重与多样性控制，确保返回的名字之间尽量不同。'
  },
  {
    q: '网名生成器如何保证音韵好听？',
    a: '我们采用 6 维音韵评分体系：声调起伏（25%）、押韵（20%）、平仄（15%）、字形（10%）、寓意（20%）、易读性（10%）。所有候选都会打分排序，只把高分结果呈现给你。'
  },
  {
    q: '我的描述会被上传到服务器吗？',
    a: '不会。所有运算都在你的浏览器内进行，描述、生成结果都不会离开你的设备。我们也不使用 Cookie 做用户追踪。'
  },
  {
    q: '支持哪些类型的网名？',
    a: '目前 v0.1 支持中文 2-4 字名，覆盖电商、科技、文艺、二次元、山水自然等场景。英文名、笔名组合、品牌名生成等高级功能正在规划中。'
  },
  {
    q: '生成的名字可以商用吗？',
    a: '生成结果基于通用汉字组合，无版权限制；你可以自由用于账号、店铺、品牌。但请注意：生成结果仅为灵感参考，最终决定前建议查询商标与平台可用性。'
  },
  {
    q: '如何让 AI 增强生成更准？',
    a: '在「描述你的名字气质」一栏写得更具体（行业、目标用户、想传达的情绪），效果更好。AI 增强会以你本地生成的 Top 5 作为「风格种子」进行二次创作。'
  },
  {
    q: '为什么有些名字我看不出寓意？',
    a: '我们的词库覆盖自然、植物、典故、意象等多个维度。每张结果卡片都会显示该名字相关字的字义与文化背景；点击展开即可看到完整解读。'
  }
]
</script>

<template>
  <section class="container-prose mt-20">
    <header class="text-center">
      <p class="label-sm text-cinnabar">常见问题</p>
      <h2 class="mt-3 text-3xl font-serif-cn text-ink-900">关于取名神器的疑问</h2>
    </header>
    <div class="mt-10 space-y-2">
      <details
        v-for="(faq, i) in faqs"
        :key="i"
        class="group card-base cursor-pointer"
      >
        <summary class="flex items-center justify-between font-serif-cn text-base sm:text-lg text-ink-800 list-none">
          <span>{{ faq.q }}</span>
          <span class="text-ink-400 text-sm transition-transform group-open:rotate-45">+</span>
        </summary>
        <p class="mt-3 text-sm text-ink-600 leading-relaxed">{{ faq.a }}</p>
      </details>
    </div>
  </section>
</template>

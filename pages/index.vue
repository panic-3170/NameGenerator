<script setup lang="ts">
import { Wand2, Loader2, RotateCcw } from 'lucide-vue-next'
import { generateNames, type GeneratedName } from '~/composables/useNameGenerator'
import { useHistory, type HistoryItem } from '~/composables/useHistory'

useWebAppSEO()

const { add: addHistory } = useHistory()

const description = ref('')
const length = ref<2 | 3 | 4>(2)
const style = ref<'通用' | '文艺' | '豪迈' | '清新' | '二次元'>('通用')
const count = ref<10 | 20 | 30 | 50>(10)

const results = ref<GeneratedName[]>([])
const loading = ref(false)
const hasGenerated = ref(false)
const toast = ref('')

async function generate() {
  loading.value = true
  hasGenerated.value = true
  try {
    results.value = await generateNames({
      description: description.value,
      length: length.value,
      style: style.value,
      count: count.value
    })
    if (results.value.length) {
      addHistory({
        description: description.value,
        length: length.value,
        style: style.value,
        count: count.value,
        names: results.value.map(r => r.text)
      })
    }
  } catch (e) {
    toast.value = '生成失败：' + (e as Error).message
    setTimeout(() => (toast.value = ''), 3000)
  } finally {
    loading.value = false
  }
}

function regenerate() {
  generate()
}

function onEnhanced(newNames: { text: string; pinyin: string[]; tones: number[]; meaning: string; score: number }[]) {
  results.value = [...newNames, ...results.value].slice(0, count.value)
}

function showError(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 3000)
}

function restoreHistory(item: HistoryItem) {
  description.value = item.description
  length.value = item.length
  style.value = item.style
  count.value = item.count
  generate()
}

useHead({
  title: '取名神器 - 中文网名生成器 | 音韵优美 · 有典故寓意',
  meta: [
    {
      name: 'description',
      content:
        '免费中文网名生成器：基于音韵评分与主题词库，生成 2-4 字音韵优美、字形讲究、有诗词典故寓意的中文网名。完全本地处理，无需注册，保护隐私。'
    }
  ]
})
</script>

<template>
  <div>
    <HeroInput
      v-model:description="description"
      v-model:length="length"
      v-model:style="style"
      v-model:count="count"
    />

    <div class="container-prose">
      <div class="flex flex-col sm:flex-row items-center gap-3 justify-center">
        <button
          type="button"
          class="btn-primary px-6 sm:px-8 h-12 text-base min-w-[160px] sm:min-w-[180px]"
          :disabled="loading"
          @click="generate"
        >
          <Loader2 v-if="loading" class="animate-spin" :size="18" />
          <Wand2 v-else :size="18" />
          <span>{{ loading ? '生成中' : '生成网名' }}</span>
        </button>
        <button
          v-if="hasGenerated && !loading"
          type="button"
          class="btn-ghost px-6 h-11"
          @click="regenerate"
        >
          <RotateCcw :size="16" />
          <span>再换一批</span>
        </button>
      </div>
    </div>

    <!-- 占位：等待第一次生成时显示示例提示 -->
    <section v-if="!hasGenerated" class="container-prose mt-16">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="(example, i) in ['山岚', '云栖', '清欢', '知秋', '风止', '半山']"
          :key="i"
          class="card-base text-center py-5 px-3"
        >
          <p class="text-2xl font-serif-cn text-ink-800">{{ example }}</p>
          <p class="mt-1 text-[10px] text-ink-400 font-mono">示例</p>
        </div>
      </div>
      <p class="mt-6 text-center text-sm text-ink-400">
        输入描述并点击「生成网名」，或先试试以上示例风格的字组合
      </p>
    </section>

    <!-- 结果区 -->
    <section v-else class="container-prose mt-12">
      <div v-if="loading" class="grid sm:grid-cols-2 gap-4">
        <div v-for="i in count" :key="i" class="card-base animate-pulse">
          <div class="h-3 w-12 bg-ink-100 rounded"></div>
          <div class="mt-3 h-10 w-32 bg-ink-100 rounded"></div>
          <div class="mt-3 h-3 w-40 bg-ink-100 rounded"></div>
        </div>
      </div>
      <div v-else-if="results.length" class="grid sm:grid-cols-2 gap-4 fade-up">
        <ResultCard
          v-for="(name, i) in results"
          :key="`${name.text}-${i}`"
          :name="name"
          :index="i"
        />
      </div>
      <div v-else class="text-center text-ink-500 py-12">
        没有生成结果。试试换个描述或调高字数。
      </div>
    </section>

    <AIEnhancePanel
      v-if="results.length"
      class="mt-12"
      :description="description"
      :style="style"
      :seeds="results.slice(0, 5).map(r => ({ text: r.text, meaning: r.meaning, score: r.score }))"
      @enhanced="onEnhanced"
      @error="showError"
    />

    <FAQSection />

    <HistoryPanel @restore="restoreHistory" />

    <!-- SEO 补充：文字说明 -->
    <section class="container-prose mt-24">
      <article class="prose-content space-y-6 text-ink-700 leading-relaxed">
        <h2 class="text-2xl font-serif-cn text-ink-900">什么是中文网名生成器？</h2>
        <p>
          取名神器是一款<strong class="text-ink-900">纯浏览器本地</strong>运行的中文网名生成器。
          与市面上「字典随机拼字」的工具不同，本工具基于
          <strong class="text-ink-900">音韵评分体系</strong>
          和<strong class="text-ink-900">主题词库</strong>，结合 6 大维度的算法评估，
          为你生成 2-4 字音韵优美、字形讲究、有诗词典故寓意的高质量中文网名。
        </p>

        <h3 class="text-xl font-serif-cn text-ink-900 mt-10">音韵评分维度</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-ink-200">
                <th class="text-left py-2 font-medium text-ink-900">维度</th>
                <th class="text-left py-2 font-medium text-ink-900">权重</th>
                <th class="text-left py-2 font-medium text-ink-900">评分逻辑</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100">
              <tr><td class="py-2">声调起伏</td><td class="py-2 font-mono">25%</td><td class="py-2 text-ink-600">2/4 字名中偶数位以「上声/去声」为佳</td></tr>
              <tr><td class="py-2">押韵</td><td class="py-2 font-mono">20%</td><td class="py-2 text-ink-600">末字韵母落在响亮集合 i/ang/u/an</td></tr>
              <tr><td class="py-2">平仄</td><td class="py-2 font-mono">15%</td><td class="py-2 text-ink-600">双数位以平声为主，末字以仄声收尾</td></tr>
              <tr><td class="py-2">字形</td><td class="py-2 font-mono">10%</td><td class="py-2 text-ink-600">左右/上下结构优先，避免堆叠</td></tr>
              <tr><td class="py-2">寓意</td><td class="py-2 font-mono">20%</td><td class="py-2 text-ink-600">引用诗词/典故/自然意象，加分</td></tr>
              <tr><td class="py-2">易读性</td><td class="py-2 font-mono">10%</td><td class="py-2 text-ink-600">首字母组合是否朗朗上口</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-xl font-serif-cn text-ink-900 mt-10">适用场景</h3>
        <ul class="list-disc pl-5 space-y-1.5 text-ink-700">
          <li>自媒体创作者：寻找有辨识度的笔名 / 账号名</li>
          <li>跨境电商：品牌名、店铺名灵感</li>
          <li>游戏玩家：公会名、角色名、昵称</li>
          <li>项目命名：产品代号、内部项目名</li>
          <li>二次元：番剧向、角色向、社团向昵称</li>
        </ul>

        <h3 class="text-xl font-serif-cn text-ink-900 mt-10">隐私与本地处理</h3>
        <p>
          取名神器<strong class="text-ink-900">不在服务端存储任何数据</strong>。
          所有运算（关键词提取、主题匹配、模板组合、音韵评分）都在你的浏览器内完成，
          描述文本和生成结果从不上传。我们不写 Cookie，不做用户追踪。
          （AI 增强功能为可选，需你主动填写 API Key，请求由浏览器直接发往你所配置的 API endpoint。）
        </p>
      </article>
    </section>

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-ink-800 text-paper text-sm rounded-md shadow-lg"
      >
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Loader2, KeyRound, Trash2 } from 'lucide-vue-next'
import { enhanceWithAI, loadAIConfig, saveAIConfig, clearAIConfig, type AIConfig } from '~/composables/useAIEnhance'

const props = defineProps<{
  description: string
  style: string
  seeds: { text: string; meaning: string; score: number }[]
}>()

const emit = defineEmits<{
  enhanced: [names: { text: string; pinyin: string[]; tones: number[]; meaning: string; score: number }[]]
  error: [message: string]
}>()

const open = ref(false)
const config = reactive<AIConfig>({
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini'
})
const loading = ref(false)
const tested = ref(false)
const testResult = ref<'ok' | 'fail' | null>(null)
const errorMsg = ref('')
const showKey = ref(false)

onMounted(() => {
  const saved = loadAIConfig()
  if (saved) {
    config.apiKey = saved.apiKey
    config.baseUrl = saved.baseUrl || 'https://api.openai.com/v1'
    config.model = saved.model || 'gpt-4o-mini'
  }
})

function save() {
  saveAIConfig({ ...config })
  tested.value = false
  testResult.value = null
}

function clear() {
  clearAIConfig()
  config.apiKey = ''
  testResult.value = null
  tested.value = false
  errorMsg.value = ''
}

async function testConnection() {
  if (!config.apiKey) {
    errorMsg.value = '请先填写 API Key'
    testResult.value = 'fail'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` }
    })
    testResult.value = res.ok ? 'ok' : 'fail'
    if (!res.ok) errorMsg.value = `HTTP ${res.status}`
  } catch (e) {
    testResult.value = 'fail'
    errorMsg.value = `连接失败：${(e as Error).message || '网络异常'}`
  } finally {
    loading.value = false
  }
}

async function runEnhance() {
  if (!config.apiKey) {
    errorMsg.value = '请先填写 API Key'
    testResult.value = 'fail'
    return
  }
  save()
  loading.value = true
  errorMsg.value = ''
  try {
    const arr = await enhanceWithAI(props.seeds, props.description, props.style, { ...config })
    if (!arr.length) {
      errorMsg.value = 'AI 未返回有效名字，请重试'
      testResult.value = 'fail'
      return
    }
    emit('enhanced', arr.map(text => ({
      text,
      pinyin: [],
      tones: [],
      meaning: `AI 增强（${props.style}）`,
      score: 0
    })))
    open.value = false
  } catch (e) {
    errorMsg.value = (e as Error).message
    testResult.value = 'fail'
    emit('error', errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container-prose">
    <div class="border border-ink-200 rounded-lg bg-white overflow-hidden dark:border-ink-700 dark:bg-ink-800">
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 sm:px-5 h-14 text-left hover:bg-paper-dark/50 transition-colors dark:hover:bg-ink-700/50"
        :aria-expanded="open"
        @click="open = !open"
      >
        <div class="flex items-center gap-3 min-w-0">
          <Sparkles class="text-cinnabar shrink-0" :size="18" />
          <span class="text-sm font-medium text-ink-800 dark:text-ink-200">AI 增强（可选）</span>
          <span class="text-xs text-ink-400 hidden sm:inline truncate">用大模型改写 · 需自备 OpenAI 兼容 Key</span>
        </div>
        <span class="text-ink-400 text-xs shrink-0 ml-2">{{ open ? '收起' : '展开' }}</span>
      </button>

      <div v-if="open" class="px-4 sm:px-5 pb-5 pt-4 border-t border-ink-200/60 space-y-4 dark:border-ink-700/60">
        <div class="grid sm:grid-cols-2 gap-3">
          <label class="block sm:col-span-2">
            <span class="label-sm">API Key</span>
            <div class="mt-1.5 relative">
              <KeyRound class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" :size="16" />
              <input
                v-model="config.apiKey"
                :type="showKey ? 'text' : 'password'"
                class="input-base pl-10 pr-20 font-mono text-sm"
                placeholder="sk-..."
                autocomplete="off"
                spellcheck="false"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink-500 hover:text-cinnabar px-2 py-1"
                @click="showKey = !showKey"
              >
                {{ showKey ? '隐藏' : '显示' }}
              </button>
            </div>
          </label>
          <label class="block">
            <span class="label-sm">Base URL</span>
            <input
              v-model="config.baseUrl"
              type="text"
              class="input-base mt-1.5 font-mono text-sm"
              placeholder="https://api.openai.com/v1"
              spellcheck="false"
            />
          </label>
          <label class="block">
            <span class="label-sm">模型</span>
            <input
              v-model="config.model"
              type="text"
              class="input-base mt-1.5 font-mono text-sm"
              placeholder="gpt-4o-mini"
              spellcheck="false"
            />
          </label>
        </div>
        <p class="text-xs text-ink-400 leading-relaxed">
          Key 仅保存在浏览器 localStorage，不会上传到任何中间服务器。请求由浏览器直连你配置的 API endpoint。
        </p>
        <div
          v-if="errorMsg"
          class="text-xs text-cinnabar bg-cinnabar/5 border border-cinnabar/20 rounded px-3 py-2 leading-relaxed"
        >
          {{ errorMsg }}
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            class="btn-ghost text-sm h-9 px-4"
            :disabled="loading || !config.apiKey"
            @click="testConnection"
          >
            <Loader2 v-if="loading" class="animate-spin" :size="14" />
            <span v-else>测试连接</span>
          </button>
          <button
            v-if="config.apiKey"
            type="button"
            class="text-xs text-ink-400 hover:text-cinnabar underline-offset-2 hover:underline dark:hover:text-cinnabar-light"
            @click="clear"
          >
            <Trash2 :size="12" class="inline -mt-0.5 mr-1" />
            清除已保存的 Key
          </button>
          <span v-if="testResult === 'ok'" class="text-xs text-celadon">✓ 连接正常</span>
          <button
            type="button"
            class="btn-primary text-sm h-9 px-5 ml-auto"
            :disabled="loading || !config.apiKey"
            @click="runEnhance"
          >
            <Loader2 v-if="loading" class="animate-spin" :size="14" />
            <Sparkles v-else :size="14" />
            <span>{{ loading ? '生成中…' : '基于结果增强 10 个' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

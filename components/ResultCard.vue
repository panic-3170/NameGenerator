<script setup lang="ts">
import { Copy, Check, Share2, ImageIcon } from 'lucide-vue-next'
import type { ScoredName } from '~/composables/usePhonetic'
import { generateAvatar } from '~/composables/useAvatar'

const props = defineProps<{
  name: ScoredName
  index: number
  enhanced?: boolean
}>()

const copied = ref(false)
const shared = ref(false)
const avatarPreview = ref(false)
const avatarUrl = computed(() => generateAvatar(props.name.text, 512))

async function downloadAvatar() {
  const link = document.createElement('a')
  link.href = avatarUrl.value
  link.download = `${props.name.text}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  avatarPreview.value = false
}

async function copyName() {
  try {
    await navigator.clipboard.writeText(props.name.text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.name.text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
}

async function shareName() {
  const shareData = {
    title: `「${props.name.text}」- 取名神器`,
    text: `我用取名神器生成了一个好听的网名：「${props.name.text}」${props.name.meaning ? `- ${props.name.meaning}` : ''}`,
    url: 'https://namegen.apppss.com/'
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      shared.value = true
      setTimeout(() => (shared.value = false), 1500)
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      shared.value = true
      setTimeout(() => (shared.value = false), 1500)
    }
  } catch {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
    shared.value = true
    setTimeout(() => (shared.value = false), 1500)
  }
}

const pinyinStr = computed(() => props.name.pinyin.map((p, i) => `${p}${props.name.tones[i]}`).join(' '))
</script>

<template>
  <article class="card-base card-hover group">
    <header class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2">
          <span class="text-xs text-ink-400 font-mono dark:text-ink-500">#{{ String(index + 1).padStart(2, '0') }}</span>
          <span
            v-if="enhanced"
            class="text-[10px] uppercase tracking-widest text-cinnabar border border-cinnabar/30 px-1.5 py-0.5 rounded"
          >
            AI
          </span>
        </div>
        <h3 class="mt-2 text-3xl sm:text-4xl font-serif-cn text-ink-900 leading-none dark:text-ink-100">
          {{ name.text }}
        </h3>
        <p class="mt-2 text-sm text-celadon font-mono">
          {{ pinyinStr }}
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:text-cinnabar hover:border-cinnabar transition-colors dark:border-ink-600 dark:text-ink-400 dark:hover:text-cinnabar-light dark:hover:border-cinnabar-light"
          :aria-label="`生成头像 ${name.text}`"
          @click="avatarPreview = true"
        >
          <ImageIcon class="w-4 h-4" :size="16" />
        </button>
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:text-cinnabar hover:border-cinnabar transition-colors dark:border-ink-600 dark:text-ink-400 dark:hover:text-cinnabar-light dark:hover:border-cinnabar-light"
          :aria-label="`分享 ${name.text}`"
          @click="shareName"
        >
          <Check v-if="shared" class="w-4 h-4 text-cinnabar" :size="16" />
          <Share2 v-else class="w-4 h-4" :size="16" />
        </button>
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:text-cinnabar hover:border-cinnabar transition-colors dark:border-ink-600 dark:text-ink-400 dark:hover:text-cinnabar-light dark:hover:border-cinnabar-light"
          :aria-label="`复制 ${name.text}`"
          @click="copyName"
        >
          <Check v-if="copied" class="w-4 h-4 text-cinnabar" :size="16" />
          <Copy v-else class="w-4 h-4" :size="16" />
        </button>
      </div>
    </header>

    <p v-if="name.meaning" class="mt-4 text-sm text-ink-600 leading-relaxed line-clamp-2 dark:text-ink-300">
      {{ name.meaning }}
    </p>

    <footer class="mt-5 pt-4 border-t border-ink-200/70 flex items-center justify-between dark:border-ink-700/70">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-ink-400 dark:text-ink-500">音韵</span>
        <div class="h-1 w-24 bg-ink-100 rounded-full overflow-hidden dark:bg-ink-700">
          <div
            class="h-full bg-cinnabar transition-all duration-700 ease-out"
            :style="{ width: `${name.score}%` }"
          ></div>
        </div>
        <span class="text-xs font-mono text-ink-700 tabular-nums dark:text-ink-300">{{ name.score }}</span>
      </div>
      <div class="text-[10px] text-ink-400 font-mono dark:text-ink-500">
        {{ name.breakdown.toneFlow }}/{{ name.breakdown.rhyme }}/{{ name.breakdown.meaning }}
      </div>
    </footer>
  </article>

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="avatarPreview"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm"
      @click="avatarPreview = false"
    >
      <div
        class="fixed top-[20%] left-1/2 -translate-x-1/2 bg-white rounded-xl overflow-hidden shadow-xl w-[320px] dark:bg-ink-800"
        @click.stop
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-ink-200 dark:border-ink-700">
          <span class="text-sm font-medium text-ink-800 dark:text-ink-200">{{ name.text }} 的头像</span>
          <button
            type="button"
            class="text-ink-400 hover:text-ink-600 transition-colors dark:hover:text-ink-100"
            @click="avatarPreview = false"
          >
            ×
          </button>
        </div>
        <div class="p-6 flex flex-col items-center">
          <img
            :src="avatarUrl"
            :alt="`${name.text} 的头像`"
            class="w-32 h-32 rounded-lg shadow-lg object-cover"
          />
          <p class="mt-3 text-sm text-ink-500 dark:text-ink-400">点击下方按钮下载头像</p>
          <button
            type="button"
            class="mt-4 btn-primary w-full"
            @click="downloadAvatar"
          >
            <ImageIcon :size="16" />
            <span>下载头像</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

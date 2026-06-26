<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'
import type { ScoredName } from '~/composables/usePhonetic'

const props = defineProps<{
  name: ScoredName
  index: number
  enhanced?: boolean
}>()

const copied = ref(false)

async function copyName() {
  try {
    await navigator.clipboard.writeText(props.name.text)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // 降级方案
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

const pinyinStr = computed(() => props.name.pinyin.map((p, i) => `${p}${props.name.tones[i]}`).join(' '))
</script>

<template>
  <article class="card-base card-hover group">
    <header class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2">
          <span class="text-xs text-ink-400 font-mono">#{{ String(index + 1).padStart(2, '0') }}</span>
          <span
            v-if="enhanced"
            class="text-[10px] uppercase tracking-widest text-cinnabar border border-cinnabar/30 px-1.5 py-0.5 rounded"
          >
            AI
          </span>
        </div>
        <h3 class="mt-2 text-3xl sm:text-4xl font-serif-cn text-ink-900 leading-none">
          {{ name.text }}
        </h3>
        <p class="mt-2 text-sm text-celadon font-mono">
          {{ pinyinStr }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 w-10 h-10 flex items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:text-cinnabar hover:border-cinnabar transition-colors"
        :aria-label="`复制 ${name.text}`"
        @click="copyName"
      >
        <Check v-if="copied" class="w-4 h-4 text-cinnabar" :size="16" />
        <Copy v-else class="w-4 h-4" :size="16" />
      </button>
    </header>

    <p v-if="name.meaning" class="mt-4 text-sm text-ink-600 leading-relaxed line-clamp-2">
      {{ name.meaning }}
    </p>

    <footer class="mt-5 pt-4 border-t border-ink-200/70 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-ink-400">音韵</span>
        <div class="h-1 w-24 bg-ink-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-cinnabar transition-all duration-700 ease-out"
            :style="{ width: `${name.score}%` }"
          ></div>
        </div>
        <span class="text-xs font-mono text-ink-700 tabular-nums">{{ name.score }}</span>
      </div>
      <div class="text-[10px] text-ink-400 font-mono">
        {{ name.breakdown.toneFlow }}/{{ name.breakdown.rhyme }}/{{ name.breakdown.meaning }}
      </div>
    </footer>
  </article>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

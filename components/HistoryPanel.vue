<script setup lang="ts">
import { Clock, Trash2, ChevronDown, ChevronRight, Copy, Check } from 'lucide-vue-next'
import { useHistory, type HistoryItem } from '~/composables/useHistory'

const emit = defineEmits<{
  (e: 'restore', item: HistoryItem): void
}>()

const { history, remove, clear, formatTime } = useHistory()

const expandedId = ref<string | null>(null)
const copiedId = ref<string | null>(null)

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

async function copyName(name: string, id: string) {
  try {
    await navigator.clipboard.writeText(name)
    copiedId.value = `${id}-${name}`
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch {}
}

function handleRestore(item: HistoryItem) {
  emit('restore', item)
}
</script>

<template>
  <div v-if="history.length" class="container-prose mt-16">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <Clock :size="18" class="text-ink-500" />
        <h2 class="text-lg font-medium text-ink-800">生成历史</h2>
        <span class="text-xs text-ink-400 bg-ink-100 px-2 py-0.5 rounded-full">
          {{ history.length }}
        </span>
      </div>
      <button
        type="button"
        class="text-xs text-ink-400 hover:text-ink-600 transition-colors"
        @click="clear"
      >
        清空历史
      </button>
    </div>

    <div class="space-y-3">
      <div
          v-for="item in history"
          :key="item.id"
          class="card-base overflow-hidden transition-all duration-200 dark:bg-ink-800 dark:border-ink-700"
        >
        <div
          class="flex items-center gap-3 p-4 cursor-pointer hover:bg-ink-50/50 transition-colors dark:hover:bg-ink-700/50"
          @click="toggleExpand(item.id)"
        >
          <component
            :is="expandedId === item.id ? ChevronDown : ChevronRight"
            :size="16"
            class="text-ink-400 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-ink-800 truncate dark:text-ink-200">
                {{ item.description || '无描述' }}
              </span>
              <span class="text-xs text-ink-400 bg-ink-100 px-2 py-0.5 rounded dark:bg-ink-700 dark:text-ink-500">
                {{ item.length }}字 · {{ item.style }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-ink-400 dark:text-ink-500">{{ formatTime(item.timestamp) }}</span>
              <span class="text-xs text-ink-300 dark:text-ink-600">·</span>
              <span class="text-xs text-ink-400 dark:text-ink-500">{{ item.names.length }}个网名</span>
            </div>
          </div>
          <button
            type="button"
            class="text-xs btn-ghost px-3 h-7 flex-shrink-0"
            @click.stop="handleRestore(item)"
          >
            重新生成
          </button>
          <button
            type="button"
            class="p-1.5 text-ink-400 hover:text-ink-600 transition-colors flex-shrink-0"
            @click.stop="remove(item.id)"
          >
            <Trash2 :size="14" />
          </button>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="expandedId === item.id" class="px-4 pb-4 pt-0">
            <div class="flex flex-wrap gap-2 pt-3 border-t border-ink-100 dark:border-ink-700">
              <button
                v-for="name in item.names"
                :key="name"
                type="button"
                class="group flex items-center gap-1 px-3 py-1.5 text-sm bg-ink-50 hover:bg-ink-100 rounded-md transition-colors dark:bg-ink-700 dark:hover:bg-ink-600"
                @click="copyName(name, item.id)"
              >
                <span class="font-serif-cn text-ink-700 dark:text-ink-200">{{ name }}</span>
                <component
                  :is="copiedId === `${item.id}-${name}` ? Check : Copy"
                  :size="12"
                  class="text-ink-400 group-hover:text-ink-600 transition-colors"
                />
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'

const { theme, toggle } = useTheme()

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor
}

const labels = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统'
}
</script>

<template>
  <header class="border-b border-ink-200/60 bg-paper/95 backdrop-blur-sm sticky top-0 z-30 dark:border-ink-700/60 dark:bg-ink-900/95">
    <div class="container-content flex items-center justify-between h-16">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <span class="text-2xl text-cinnabar font-serif-cn">墨</span>
          <span class="text-lg font-serif-cn tracking-wide text-ink-800 group-hover:text-cinnabar transition-colors dark:text-ink-200 dark:group-hover:text-cinnabar-light">
            取名神器
          </span>
        </NuxtLink>
      </div>
      <nav class="flex items-center gap-6 text-sm text-ink-500">
        <NuxtLink to="/" class="hover:text-ink-900 transition-colors dark:hover:text-ink-100">生成器</NuxtLink>
        <NuxtLink to="/about" class="hover:text-ink-900 transition-colors dark:hover:text-ink-100">关于</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-ink-900 transition-colors dark:hover:text-ink-100">隐私</NuxtLink>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 h-9 text-ink-500 hover:text-ink-900 transition-colors rounded-md dark:hover:text-ink-100"
          @click="toggle"
          :title="labels[theme]"
        >
          <component :is="icons[theme]" :size="16" />
          <span class="hidden sm:inline text-sm">{{ labels[theme] }}</span>
        </button>
      </nav>
    </div>
  </header>
</template>

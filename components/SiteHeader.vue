<template>
  <header class="border-b border-ink-200/60 bg-paper/95 backdrop-blur-sm sticky top-0 z-30">
    <div class="container-content flex items-center justify-between h-16">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <span class="text-2xl text-cinnabar font-serif-cn">墨</span>
        <span class="text-lg font-serif-cn tracking-wide text-ink-800 group-hover:text-cinnabar transition-colors">
          取名神器
        </span>
      </NuxtLink>
      <nav class="flex items-center gap-6 text-sm text-ink-500">
        <NuxtLink to="/" class="hover:text-ink-900 transition-colors">生成器</NuxtLink>
        <NuxtLink to="/about" class="hover:text-ink-900 transition-colors">关于</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-ink-900 transition-colors">隐私</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<template>
  <footer class="border-t border-ink-200/60 mt-24 py-10">
    <div class="container-content flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
      <div class="flex items-center gap-2">
        <span class="text-cinnabar font-serif-cn">墨</span>
        <span>取名神器 · 纯本地 · 不上传任何数据</span>
      </div>
      <div class="flex items-center gap-5">
        <NuxtLink to="/about" class="hover:text-ink-800 transition-colors">关于</NuxtLink>
        <NuxtLink to="/privacy" class="hover:text-ink-800 transition-colors">隐私</NuxtLink>
        <a href="https://github.com" target="_blank" rel="noopener" class="hover:text-ink-800 transition-colors">
          GitHub
        </a>
      </div>
    </div>
  </footer>
</template>

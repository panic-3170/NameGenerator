<script setup lang="ts">
const description = defineModel<string>('description', { default: '' })
const length = defineModel<2 | 3 | 4>('length', { default: 2 })
const style = defineModel<'通用' | '文艺' | '豪迈' | '清新' | '二次元'>('style', { default: '通用' })
const count = defineModel<10 | 20 | 30 | 50>('count', { default: 10 })

const lengths: (2 | 3 | 4)[] = [2, 3, 4]
const styles: ('通用' | '文艺' | '豪迈' | '清新' | '二次元')[] = ['通用', '文艺', '豪迈', '清新', '二次元']
const counts: (10 | 20 | 30 | 50)[] = [10, 20, 30, 50]

const placeholders = [
  '跨境电商',
  '二次元手游玩家的昵称',
  '山水意境的笔名',
  '科技创业公司品牌',
  '清新文艺的女生网名',
  '古风国风 ID',
  '极简北欧风品牌',
  '运动健身博主'
]
const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)]
</script>

<template>
  <section class="container-prose pt-16 sm:pt-24 pb-10">
    <div class="text-center">
      <p class="label-sm text-cinnabar fade-up fade-up-1">中文网名生成器</p>
      <h1 class="mt-4 text-4xl sm:text-5xl font-serif-cn text-ink-900 leading-tight text-balance fade-up fade-up-2 dark:text-ink-100">
        一个有音韵 · <span class="shimmer-text">有典故</span> · 有寓意的名字
      </h1>
      <p class="mt-5 text-base sm:text-lg text-ink-500 leading-relaxed text-balance fade-up fade-up-3 dark:text-ink-400">
        基于音韵评分与主题词库，本地生成 2-4 字中文网名。<br class="hidden sm:block" />
        无需注册，不上传任何数据。
      </p>
    </div>

    <div class="mt-10 fade-up fade-up-4">
      <label class="block">
        <span class="label-sm">描述你的名字气质</span>
        <div class="mt-2 relative">
          <input
            v-model="description"
            :placeholder="placeholder"
            maxlength="40"
            class="input-base text-lg h-14"
            type="text"
            aria-label="描述你的名字气质"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-400 font-mono">
            {{ description.length }}/40
          </span>
        </div>
      </label>

      <div class="mt-5 grid sm:grid-cols-3 gap-4">
        <div>
          <div class="label-sm mb-2">字数</div>
          <div class="seg-control w-full">
            <button
              v-for="l in lengths"
              :key="l"
              type="button"
              class="seg-btn flex-1"
              :class="{ 'seg-btn-active': length === l }"
              @click="length = l"
            >
              {{ l }} 字
            </button>
          </div>
        </div>
        <div>
          <div class="label-sm mb-2">风格</div>
          <div class="seg-control w-full flex-wrap">
            <button
              v-for="s in styles"
              :key="s"
              type="button"
              class="seg-btn flex-1 px-1.5 text-[11px] sm:text-xs whitespace-nowrap"
              :class="{ 'seg-btn-active': style === s }"
              @click="style = s"
            >
              {{ s }}
            </button>
          </div>
        </div>
        <div>
          <div class="label-sm mb-2">数量</div>
          <div class="seg-control w-full">
            <button
              v-for="c in counts"
              :key="c"
              type="button"
              class="seg-btn flex-1"
              :class="{ 'seg-btn-active': count === c }"
              @click="count = c"
            >
              {{ c }} 个
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

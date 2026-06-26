<script setup lang="ts">
useHead({
  title: '隐私声明 - 取名神器',
  meta: [
    {
      name: 'description',
      content: '取名神器的隐私声明：纯本地处理，零数据收集。'
    }
  ]
})
</script>

<template>
  <article class="container-prose py-16 sm:py-24">
    <header>
      <p class="label-sm text-cinnabar">隐私</p>
      <h1 class="mt-3 text-3xl sm:text-4xl font-serif-cn text-ink-900">隐私声明</h1>
    </header>

    <div class="mt-8 space-y-6 text-ink-700 leading-relaxed">
      <p>最后更新：2026 年 6 月</p>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-4">我们不收集什么</h2>
      <ul class="list-disc pl-5 space-y-2">
        <li>不收集你输入的描述文本</li>
        <li>不收集生成结果</li>
        <li>不写 Cookie 做用户追踪</li>
        <li>不收集 IP、UA、Referer 等服务端日志（除必要的 CDN 反代日志）</li>
      </ul>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-4">AI 增强（可选功能）</h2>
      <p>
        取名神器的核心功能完全本地运行；「AI 增强」是<strong class="text-ink-900">可选</strong>功能，
        仅在你主动填写 API Key 并点击「基于结果增强」时才会被调用。
      </p>
      <ul class="list-disc pl-5 space-y-2">
        <li>API Key 仅保存在你浏览器的 localStorage，不会上传到任何中间服务器</li>
        <li>请求由浏览器直接发往你配置的 API endpoint（默认 OpenAI 兼容）</li>
        <li>你可以随时清除浏览器 localStorage 来删除已保存的 Key</li>
      </ul>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-4">CDN 与托管</h2>
      <p>
        本工具为静态站点，通过 GitHub Pages 部署。
        部署服务商（GitHub）可能会记录基础访问日志（IP、UA、时间戳），这不在我们的控制范围内。
      </p>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-4">数据安全</h2>
      <p>
        由于全部计算在客户端进行，本工具没有后端数据库可被攻破。
        即使网站源码泄露，也不会有任何用户数据外泄。
      </p>

      <h2 class="text-2xl font-serif-cn text-ink-900 pt-4">政策变更</h2>
      <p>
        如本声明发生重大变更，我们会在首页顶部发布醒目通知。
        继续使用即代表你接受变更后的条款。
      </p>
    </div>
  </article>
</template>

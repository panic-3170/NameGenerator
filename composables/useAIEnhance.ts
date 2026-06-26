// 可选 AI 增强：用户自备 API Key 浏览器直连 OpenAI 兼容 API
export type AIConfig = {
  apiKey: string
  baseUrl: string
  model: string
}

const DEFAULT_TIMEOUT = 30000

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return { signal: ctrl.signal, cancel: () => clearTimeout(timer) }
}

function extractJsonArray(text: string): string[] | null {
  if (!text) return null
  // 优先匹配 markdown 代码块 ```json [...] ```
  const fence = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/i)
  if (fence) {
    try {
      const arr = JSON.parse(fence[1])
      if (Array.isArray(arr)) return arr
    } catch {
      /* fallthrough */
    }
  }
  // 退化：找第一个完整 JSON 数组
  const start = text.indexOf('[')
  if (start === -1) return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inStr) {
      if (esc) esc = false
      else if (ch === '\\') esc = true
      else if (ch === '"') inStr = false
    } else {
      if (ch === '"') inStr = true
      else if (ch === '[') depth++
      else if (ch === ']') {
        depth--
        if (depth === 0) {
          const slice = text.substring(start, i + 1)
          try {
            const arr = JSON.parse(slice)
            if (Array.isArray(arr)) return arr
          } catch {
            return null
          }
        }
      }
    }
  }
  return null
}

export async function enhanceWithAI(
  seeds: { text: string; meaning: string; score: number }[],
  description: string,
  style: string,
  config: AIConfig
): Promise<string[]> {
  const prompt = `你是一位精通中文音韵美学的命名师。请基于以下种子名字的意境、音韵和主题（${description || '通用'}，${style}风格），生成 10 个更新颖、更有韵味的中文 2-4 字网名。
要求：
1. 保持与种子名字相似的气质与音韵美感
2. 避免与种子名字完全相同
3. 名字要有典故或诗意
4. 仅返回 JSON 数组，例如 ["名字1","名字2"]，不要任何其他文字
种子名字：${JSON.stringify(seeds.map(s => s.text))}`

  const base = config.baseUrl.replace(/\/$/, '')
  const { signal, cancel } = withTimeout(DEFAULT_TIMEOUT)
  let res: Response
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你只输出合法 JSON 数组，不要任何解释或代码块包裹。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9
      }),
      signal
    })
  } catch (e) {
    cancel()
    if ((e as Error).name === 'AbortError') {
      throw new Error(`AI 请求超时（${DEFAULT_TIMEOUT / 1000}s），请检查网络或 Base URL`)
    }
    throw new Error(`网络错误：${(e as Error).message || '无法连接到 API'}`)
  }
  cancel()

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const errBody = await res.json()
      if (errBody?.error?.message) detail = errBody.error.message
    } catch {
      /* ignore */
    }
    if (res.status === 401) throw new Error('API Key 无效或已过期（401）')
    if (res.status === 403) throw new Error('无权访问该模型（403），请检查模型名或权限')
    if (res.status === 404) throw new Error('模型或端点不存在（404），请检查 Base URL 与 Model')
    if (res.status === 429) throw new Error('请求过于频繁（429），请稍后重试')
    if (res.status >= 500) throw new Error(`服务异常（${detail}），请稍后重试`)
    throw new Error(`AI 请求失败：${detail}`)
  }

  let data: any
  try {
    data = await res.json()
  } catch {
    throw new Error('AI 返回的不是合法 JSON')
  }

  const content: string = data?.choices?.[0]?.message?.content || ''
  const arr = extractJsonArray(content)
  if (!arr) throw new Error('AI 返回格式异常（未找到 JSON 数组）')

  return arr
    .filter((x: unknown) => typeof x === 'string')
    .map((x: string) => x.trim())
    .filter((x: string) => x && /^[一-龥]{2,4}$/.test(x))
}

export function loadAIConfig(): AIConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('ng:aiConfig')
    if (!raw) return null
    const parsed = JSON.parse(raw) as AIConfig
    if (parsed && typeof parsed.apiKey === 'string') return parsed
    return null
  } catch {
    return null
  }
}

export function saveAIConfig(cfg: AIConfig) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ng:aiConfig', JSON.stringify(cfg))
}

export function clearAIConfig() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ng:aiConfig')
}

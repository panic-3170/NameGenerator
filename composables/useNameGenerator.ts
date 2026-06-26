// 4 步流水线：关键词提取 → 主题匹配 → 模板组合 → 音韵打分排序
import { loadAllData, charsToFull, type NameChar, type Theme, type Template } from './useData'
import { scoreName, type ScoredName } from './usePhonetic'

export type NameStyle = '通用' | '文艺' | '豪迈' | '清新' | '二次元'
export type NameLength = 2 | 3 | 4

export type GenerateOptions = {
  description: string
  length: NameLength
  style: NameStyle
  count: number
}

export type GeneratedName = ScoredName

// 风格 → 字库 category 偏好映射
const STYLE_CATEGORIES: Record<NameStyle, string[]> = {
  '通用': ['自然', '光影', '清雅', '美玉', '植物', '动物', '文墨', '豪迈', '意象'],
  '文艺': ['文墨', '清雅', '美玉', '意象', '植物', '光影'],
  '豪迈': ['豪迈', '自然', '光影', '意象', '动物'],
  '清新': ['植物', '清雅', '自然', '光影', '美玉'],
  '二次元': ['光影', '意象', '美玉', '豪迈', '植物']
}

// 2 字模板多样化：{p}{s} (前后) / {p}{p} (叠字) / {m}{m} (对仗) / {p}{m} (前后+中)
// 增加更多模式以减少同质化
const ALL_TWO_CHAR_TEMPLATES: Template[] = [
  { id: 't1', pattern: '{p}{s}', length: 2, style: '通用', styles: ['通用', '文艺', '清新', '豪迈', '二次元'] },
  { id: 't16', pattern: '{m}{m}', length: 2, style: '对仗', styles: ['文艺', '清新', '通用'] },
  { id: 't19', pattern: '{p}{p}', length: 2, style: '叠字', styles: ['通用', '二次元'] }
]

// 简单的中文关键词分词
function tokenize(text: string): string[] {
  if (!text) return []
  const tokens: string[] = []
  // 把 2-4 字固定词加入
  for (let len = 4; len >= 2; len--) {
    for (let i = 0; i + len <= text.length; i++) {
      tokens.push(text.substring(i, i + len))
    }
  }
  // 单字也算
  for (const c of text) {
    if (/[\u4e00-\u9fa5]/.test(c)) tokens.push(c)
  }
  return tokens
}

function matchTheme(description: string, themes: Theme[], style: NameStyle): Theme[] {
  if (!description.trim()) return []
  const tokens = tokenize(description.toLowerCase())
  const scored = themes
    .map(t => {
      let hits = 0
      for (const kw of t.keywords) {
        const kwl = kw.toLowerCase()
        for (const tok of tokens) {
          if (tok.includes(kwl) || kwl.includes(tok)) hits++
        }
      }
      // 主题风格与所选风格匹配度加分
      const styleBonus = t.styles.includes(style) ? 2 : 0
      return { theme: t, hits: hits + styleBonus }
    })
    .filter(x => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
  return scored.map(s => s.theme)
}

function pick<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr.slice()
  const out: T[] = []
  const used = new Set<number>()
  while (out.length < n && used.size < arr.length) {
    const i = Math.floor(Math.random() * arr.length)
    if (used.has(i)) continue
    used.add(i)
    out.push(arr[i])
  }
  return out
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 根据风格筛选字符：把首选 category 放在前面
function filterByStyle(chars: NameChar[], style: NameStyle): NameChar[] {
  if (style === '通用') return chars
  const preferred = new Set(STYLE_CATEGORIES[style] || [])
  const matched: NameChar[] = []
  const others: NameChar[] = []
  for (const c of chars) {
    if (preferred.has(c.category)) matched.push(c)
    else others.push(c)
  }
  // 70% 来自风格匹配，30% 来自其他（保持多样性）
  return [...matched, ...others]
}

function chooseTemplates(length: number, style: NameStyle, templates: Template[]): Template[] {
  // 2 字模板优先使用扩展的多样化模板
  if (length === 2) {
    return ALL_TWO_CHAR_TEMPLATES.filter(t => t.styles.includes(style) || t.styles.includes('通用'))
  }
  return templates.filter(t => t.length === length && (t.styles.includes(style) || t.styles.includes('通用')))
}

function buildName(template: Template, prefix: NameChar[], middle: NameChar[], suffix: NameChar[]): string | null {
  if (template.length === 2) {
    // 2 字按模板模式分支
    if (template.pattern === '{m}{m}' && middle.length >= 2) {
      // 对仗式：取同 category/相邻字
      const a = pickOne(middle)
      let b = pickOne(middle)
      let safety = 0
      while (b.char === a.char && safety < 8) { b = pickOne(middle); safety++ }
      return a.char + b.char
    }
    if (template.pattern === '{p}{p}' && prefix.length >= 2) {
      // 叠字式：XX（如 清清、宁宁）
      const p = pickOne(prefix)
      return p.char + p.char
    }
    // 默认 {p}{s}
    if (!prefix.length || !suffix.length) return null
    return pickOne(prefix).char + pickOne(suffix).char
  }
  if (!prefix.length || !suffix.length) return null
  const p = pickOne(prefix)
  const s = pickOne(suffix)
  if (!middle.length) {
    // 退化为 2 字
    return p.char + s.char
  }
  if (template.length === 3) {
    const m = pickOne(middle)
    return p.char + m.char + s.char
  }
  if (template.length === 4) {
    if (middle.length < 2) {
      const m = pickOne(middle)
      return p.char + m.char + m.char + s.char
    }
    const ms = pick(middle, 2)
    return p.char + ms[0].char + ms[1].char + s.char
  }
  return null
}

// 字符组合池：拆分主题的 prefix/middle/suffix + 全局兜底
function buildCharPool(themes: Theme[], allChars: NameChar[]) {
  const prefixSet = new Map<string, NameChar>()
  const middleSet = new Map<string, NameChar>()
  const suffixSet = new Map<string, NameChar>()
  for (const theme of themes) {
    const pChars = charsToFull(theme.prefix)
    const mChars = charsToFull(theme.middle)
    const sChars = charsToFull(theme.suffix)
    for (const c of pChars) if (c) prefixSet.set(c.char, c)
    for (const c of mChars) if (c) middleSet.set(c.char, c)
    for (const c of sChars) if (c) suffixSet.set(c.char, c)
  }
  // 兜底：保证候选集不为空（从全量字库补齐）
  if (prefixSet.size < 10) for (const c of allChars) if (!prefixSet.has(c.char)) prefixSet.set(c.char, c)
  if (middleSet.size < 10) for (const c of allChars) if (!middleSet.has(c.char)) middleSet.set(c.char, c)
  if (suffixSet.size < 10) for (const c of allChars) if (!suffixSet.has(c.char)) suffixSet.set(c.char, c)
  return {
    prefix: Array.from(prefixSet.values()),
    middle: Array.from(middleSet.values()),
    suffix: Array.from(suffixSet.values())
  }
}

// 风格匹配度评分（0-100）
function styleMatchScore(text: string, charMap: Map<string, NameChar>, style: NameStyle): number {
  if (style === '通用') return 100
  const preferred = new Set(STYLE_CATEGORIES[style] || [])
  const chars = [...text].map(c => charMap.get(c)).filter(Boolean) as NameChar[]
  if (!chars.length) return 50
  const hit = chars.filter(c => preferred.has(c.category)).length
  return Math.round((hit / chars.length) * 100)
}

export async function generateNames(opts: GenerateOptions): Promise<GeneratedName[]> {
  const { description, length, style, count } = opts
  const { chars, themes, templates } = await loadAllData()

  // 1. 关键词提取（已经隐式完成：直接用 description 作为 token 源）
  // 2. 主题匹配（带风格加权）
  const matchedThemes = matchTheme(description, themes, style)
  const fallbackTheme = themes.find(t => t.id === 'general')!
  const activeThemes = matchedThemes.length ? matchedThemes : [fallbackTheme]

  // 聚合候选字集
  const pool = buildCharPool(activeThemes, chars)

  // 按风格筛选（前置偏好）
  const prefixArr = filterByStyle(pool.prefix, style)
  const middleArr = filterByStyle(pool.middle, style)
  const suffixArr = filterByStyle(pool.suffix, style)

  // 3. 模板组合
  const usedTemplates = chooseTemplates(length, style, templates)
  if (!usedTemplates.length) return []

  // 生成 8 倍候选再评分（保证多样性）
  const targetCandidates = count * 12
  const candidateNames = new Set<string>()
  let safety = 0
  while (candidateNames.size < targetCandidates && safety < targetCandidates * 5) {
    safety++
    const tpl = pickOne(usedTemplates)
    const name = buildName(tpl, prefixArr, middleArr, suffixArr)
    if (name && name.length === [...name].length) {
      candidateNames.add(name)
    }
  }

  // 4. 音韵打分排序
  const charMap = new Map<string, NameChar>()
  for (const c of chars) charMap.set(c.char, c)

  const scored: GeneratedName[] = []
  for (const name of candidateNames) {
    const charList = [...name].map(c => charMap.get(c))
    const baseScore = scoreName(name, charList)
    const sm = styleMatchScore(name, charMap, style)
    // 风格匹配 20% 加权 + 基础音韵 80%
    const finalScore = Math.round(baseScore.score * 0.8 + sm * 0.2)
    scored.push({ ...baseScore, score: finalScore, breakdown: { ...baseScore.breakdown, styleMatch: sm } as any })
  }

  // 排序：分数高的优先；同分随机
  scored.sort((a, b) => b.score - a.score)

  // 多样性：首字/末字出现次数均不超过 2
  const seen = new Set<string>()
  const dedup: GeneratedName[] = []
  for (const s of scored) {
    if (dedup.length >= count) break
    if (seen.has(s.text)) continue
    const first = s.text[0]
    const last = s.text[s.text.length - 1]
    const firstCount = dedup.filter(x => x.text[0] === first).length
    const lastCount = dedup.filter(x => x.text[x.text.length - 1] === last).length
    if (firstCount < 2 && lastCount < 2) {
      dedup.push(s)
      seen.add(s.text)
    }
  }
  // 不足则放宽末字限制补全
  if (dedup.length < count) {
    for (const s of scored) {
      if (dedup.length >= count) break
      if (seen.has(s.text)) continue
      const first = s.text[0]
      const firstCount = dedup.filter(x => x.text[0] === first).length
      if (firstCount < 2) {
        dedup.push(s)
        seen.add(s.text)
      }
    }
  }
  // 还不足则完全放开
  if (dedup.length < count) {
    for (const s of scored) {
      if (dedup.length >= count) break
      if (!seen.has(s.text)) {
        dedup.push(s)
        seen.add(s.text)
      }
    }
  }

  return dedup.slice(0, count)
}

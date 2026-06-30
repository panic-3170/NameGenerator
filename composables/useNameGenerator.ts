// 4 步流水线：关键词提取 → 主题匹配 → 模板组合 → 音韵打分排序
// 风格差异化核心：category 黑名单隔离 + 意象词组注入 + 温度采样 + 核心字限流
import { loadAllData, charsToFull, getPinyinOfChars, type NameChar, type Theme, type Template } from './useData'
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

// 风格 → category 偏好（白名单）
const STYLE_CATEGORIES: Record<NameStyle, string[]> = {
  '通用': ['自然', '光影', '清雅', '美玉', '植物', '动物', '文墨', '豪迈', '意象'],
  '文艺': ['文墨', '清雅', '美玉', '意象', '植物', '光影'],
  '豪迈': ['豪迈', '自然', '光影', '意象', '动物'],
  '清新': ['植物', '清雅', '自然', '美玉', '光影'],
  '二次元': ['光影', '意象', '美玉', '豪迈', '植物']
}

// 风格 → category 黑名单（真正剔除，不参与组合）
const STYLE_CATEGORY_BLACKLIST: Record<NameStyle, string[]> = {
  '通用': [],
  '文艺': ['科技', '工业', '武器', '战斗'],
  '豪迈': ['娇柔', '粉嫩', '可爱', '软糯'],
  '清新': ['武器', '战斗', '恐怖', '工业'],
  '二次元': []
}

// 风格 → 字义黑名单（基于字义判断）
const STYLE_MEANING_BLACKLIST: Record<NameStyle, string[]> = {
  '通用': [],
  '文艺': ['杀', '斩', '砍', '血', '暴', '战', '炮', '枪', '毒', '霸', '狂'],
  '豪迈': ['娇', '羞', '嫩', '软', '粉', '甜', '糯', '媚', '怜', '哭', '泣'],
  '清新': ['杀', '斩', '血', '暴', '战', '毒', '霸', '暗', '死', '恐'],
  '二次元': []
}

// 风格核心字（限制同字在结果中最多 1 次）
const STYLE_CORE_CHARS: Record<NameStyle, { prefix: string[]; suffix: string[] }> = {
  '通用': { prefix: [], suffix: [] },
  '文艺': {
    prefix: ['墨', '书', '诗', '辞', '雅', '澹', '璞', '婉', '霁', '砚', '韵', '章'],
    suffix: ['墨', '书', '文', '诗', '辞', '雅', '韵', '砚', '瑶', '琼', '锦', '素']
  },
  '豪迈': {
    prefix: ['凌', '霄', '飞', '腾', '龙', '剑', '锋', '烈', '雄', '霸', '破', '惊'],
    suffix: ['霄', '穹', '歌', '涛', '澜', '辰', '长', '空', '疆', '骨', '魂']
  },
  '清新': {
    prefix: ['清', '素', '青', '露', '晨', '晓', '微', '淡', '雪', '霁', '盈', '浅'],
    suffix: ['溪', '露', '晨', '晓', '风', '云', '清', '澜', '荷', '蕊', '薇', '雪']
  },
  '二次元': {
    prefix: ['星', '月', '影', '夜', '幻', '梦', '凌', '翼', '雪', '霁', '霜', '翎', '樱'],
    suffix: ['月', '影', '夜', '翼', '凌', '曜', '光', '幻', '梦', '星', '魂', '刃', '雪']
  }
}

// 风格意象词组（双字），用于语义模板
type StyleWords = { prefix: string[]; suffix: string[] }
const STYLE_WORDS: Record<NameStyle, StyleWords> = {
  '通用': { prefix: [], suffix: [] },
  '文艺': {
    prefix: ['听风', '辞海', '借月', '煮雪', '拈花', '拂袖', '吟雪', '揽月', '寻幽', '浣纱', '拾光', '拂尘', '枕月', '踏雪', '吹箫', '执笔'],
    suffix: ['如梦', '未央', '清欢', '无恙', '知秋', '向暖', '归帆', '入怀', '知音', '留白', '无声', '无言', '归矣', '尽欢', '长安', '如故']
  },
  '豪迈': {
    prefix: ['斩天', '裂穹', '破云', '凌天', '御风', '逐日', '擒龙', '射月', '铁血', '狂龙', '惊雷', '啸天', '无双', '踏歌', '仗剑', '执戈'],
    suffix: ['无疆', '不败', '苍穹', '九天', '长空', '星河', '瀚海', '穹苍', '碧落', '万里', '千山', '沧海', '风骨', '傲骨', '龙魂', '无求']
  },
  '清新': {
    prefix: ['白露', '青葵', '浅笑', '微风', '初晴', '晨露', '晓风', '清涟', '素心', '薄荷', '柠檬', '茉莉', '栀子', '雏菊', '向阳', '呢喃'],
    suffix: ['微凉', '微暖', '知秋', '含笑', '含羞', '含烟', '如风', '如烟', '如梦', '如歌', '如诗', '如画', '未央', '未晚', '向阳', '向晚']
  },
  '二次元': {
    prefix: ['星河', '月影', '夜羽', '幻梦', '千夜', '千羽', '千代', '风翼', '羽翼', '银翼', '雪翼', '夜刃', '冰刃', '幻夜', '幻月', '幻星'],
    suffix: ['之痕', '之影', '之翼', '之刃', '之魂', '之梦', '轨迹', '回响', '永夜', '无月', '流光', '星霜', '雪月', '风花', '月华', '星辉']
  }
}

// 风格评分权重（弱化核心字，加强语义和结构）
const STYLE_SCORE_WEIGHTS: Record<NameStyle, { tone: number; rhyme: number; style: number }> = {
  '通用': { tone: 0.5, rhyme: 0.2, style: 0.3 },
  '文艺': { tone: 0.3, rhyme: 0.3, style: 0.4 },
  '豪迈': { tone: 0.6, rhyme: 0.1, style: 0.3 },
  '清新': { tone: 0.4, rhyme: 0.3, style: 0.3 },
  '二次元': { tone: 0.3, rhyme: 0.2, style: 0.5 }
}

// 简单的中文关键词分词
function tokenize(text: string): string[] {
  if (!text) return []
  const tokens: string[] = []
  for (let len = 4; len >= 2; len--) {
    for (let i = 0; i + len <= text.length; i++) {
      tokens.push(text.substring(i, i + len))
    }
  }
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
      const styleBonus = t.styles.includes(style) ? 3 : 0
      return { theme: t, hits: hits + styleBonus }
    })
    .filter(x => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
  // ⭐ 返回所有匹配到的主题（hits > 0），让 description 多个关键词都能派上用场
  return scored.map(s => s.theme)
}

// 严格按风格过滤：黑名单 category 直接删除，偏好 category 排前
function filterByStyleStrict(chars: NameChar[], style: NameStyle): NameChar[] {
  if (style === '通用') return chars
  const preferred = new Set(STYLE_CATEGORIES[style] || [])
  const blacklist = new Set(STYLE_CATEGORY_BLACKLIST[style] || [])
  const meaningBlacklist = STYLE_MEANING_BLACKLIST[style] || []

  const matched: NameChar[] = []
  const others: NameChar[] = []
  for (const c of chars) {
    // 黑名单 category 直接剔除
    if (blacklist.has(c.category)) continue
    // 字义黑名单：含禁用字的字剔除
    if (meaningBlacklist.some(b => c.char.includes(b) || c.meaning?.includes(b))) continue
    if (preferred.has(c.category)) matched.push(c)
    else others.push(c)
  }
  return [...matched, ...others]
}

// 从 description 中提取可作为名字字料的关键词
function extractDescriptionChars(description: string, allChars: NameChar[]): { prefix: string[]; middle: string[]; suffix: string[] } {
  if (!description.trim()) return { prefix: [], middle: [], suffix: [] }
  const charMap = new Map(allChars.map(c => [c.char, c]))
  const prefix: string[] = []
  const middle: string[] = []
  const suffix: string[] = []

  // 提取 2-4 字词组
  const words = tokenize(description)
  const uniqueWords = Array.from(new Set(words))

  for (const word of uniqueWords) {
    for (const ch of word) {
      if (!charMap.has(ch)) continue
      if (!prefix.includes(ch)) {
        // 单字也作为可用字
        prefix.push(ch)
        middle.push(ch)
        suffix.push(ch)
      }
    }
  }
  return { prefix, middle, suffix }
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 注入风格核心字（只补齐不存在于 pool 中的字）
function injectStyleCore(chars: NameChar[], style: NameStyle, position: 'prefix' | 'suffix'): NameChar[] {
  if (style === '通用') return chars
  const coreChars = STYLE_CORE_CHARS[style][position]
  const charMap = new Map(chars.map(c => [c.char, c]))
  const injected: NameChar[] = []
  for (const ch of coreChars) {
    const existing = charMap.get(ch)
    if (existing) {
      injected.push(existing)
    } else {
      const py = getPinyinOfChars(ch)
      if (py.length) {
        injected.push({
          char: ch,
          pinyin: py[0].pinyin,
          tone: py[0].tone,
          rhyme: py[0].pinyin,
          meaning: '',
          category: STYLE_CATEGORIES[style][0] || '通用'
        })
        charMap.set(ch, injected[injected.length - 1])
      }
    }
  }
  return [...injected, ...chars.filter(c => !coreChars.includes(c.char))]
}

// 解析模板：支持 {p} {m} {s} {wp} {ws} {hp} {hs} {qp} {qs} {ap} {as} {之}
type TemplateSlot = 'p' | 'm' | 's' | 'wp' | 'ws' | 'hp' | 'hs' | 'qp' | 'qs' | 'ap' | 'as' | '之'

// 计算模板实际生成长度：单字池返回 1，词组池返回 2，固定字返回 1
function templateActualLength(pattern: string): number {
  const slots = pattern.match(/\{(\w+)\}/g) || []
  let len = 0
  for (const slot of slots) {
    const key = slot.slice(1, -1)
    if (key === '之') len += 1
    else if (['p', 'm', 's'].includes(key)) len += 1
    else if (['wp', 'ws', 'hp', 'hs', 'qp', 'qs', 'ap', 'as'].includes(key)) len += 2
  }
  return len
}

function buildNameByTemplate(
  pattern: string,
  pools: Record<TemplateSlot, string[]>
): string | null {
  // 替换模板中的槽位
  let result = pattern
  // 之 是固定字直接替换
  result = result.replace(/\{之\}/g, '之')
  // 其余槽位从 pools 取（多字词组也算一个槽位）
  const slots = result.match(/\{(\w+)\}/g)
  if (!slots) return result
  for (const slot of slots) {
    const key = slot.slice(1, -1) as TemplateSlot
    const pool = pools[key]
    if (!pool || !pool.length) {
      // 槽位无内容，回退到通用池
      const fallbackKey: TemplateSlot = key.replace(/^[whqa]/, '') as TemplateSlot
      const fallback = pools[fallbackKey]
      if (!fallback || !fallback.length) return null
      result = result.replace(slot, pickOne(fallback))
    } else {
      result = result.replace(slot, pickOne(pool))
    }
  }
  return result
}

// 构建模板所需的全部字符池
function buildAllPools(
  prefixArr: NameChar[],
  middleArr: NameChar[],
  suffixArr: NameChar[],
  style: NameStyle,
  styleWords: StyleWords
): Record<TemplateSlot, string[]> {
  const corePrefix = new Set(STYLE_CORE_CHARS[style]?.prefix || [])
  const coreSuffix = new Set(STYLE_CORE_CHARS[style]?.suffix || [])

  // 意象词组：拆成单字数组
  const wpChars = styleWords.prefix.flatMap(w => [...w])
  const wsChars = styleWords.suffix.flatMap(w => [...w])

  return {
    p: prefixArr.map(c => c.char),
    m: middleArr.map(c => c.char),
    s: suffixArr.map(c => c.char),
    wp: styleWords.prefix,
    ws: styleWords.suffix,
    hp: styleWords.prefix,  // 豪迈也用词组
    hs: styleWords.suffix,
    qp: styleWords.prefix,
    qs: styleWords.suffix,
    ap: styleWords.prefix,
    as: styleWords.suffix,
    之: ['之']
  }
}

// 风格匹配度评分（弱化核心字权重 + description 关键词加权）
function styleMatchScore(
  text: string,
  charMap: Map<string, NameChar>,
  style: NameStyle,
  styleWords: StyleWords,
  descChars: Set<string>
): number {
  if (style === '通用') return 80
  const preferred = new Set(STYLE_CATEGORIES[style] || [])
  const coreChars = new Set([
    ...STYLE_CORE_CHARS[style].prefix,
    ...STYLE_CORE_CHARS[style].suffix
  ])

  let categoryScore = 0
  let coreScore = 0
  let phraseBonus = 0
  let descBonus = 0  // ⭐ description 关键词命中

  for (const ch of text) {
    const c = charMap.get(ch)
    if (!c) continue
    if (preferred.has(c.category)) categoryScore += 60
    if (coreChars.has(c.char)) coreScore += 20
    if (descChars.has(ch)) descBonus += 80  // 强加权
  }

  // 检查是否包含完整意象词组
  for (const phrase of [...styleWords.prefix, ...styleWords.suffix]) {
    if (text.includes(phrase)) phraseBonus += 30
  }

  // 检查是否包含完整 description 词组（最强信号）
  const descWords = Array.from(descChars)
  for (let i = 0; i < text.length - 1; i++) {
    const bigram = text.substring(i, i + 2)
    if (descWords.includes(bigram)) descBonus += 100
  }

  const total = categoryScore + coreScore + phraseBonus + descBonus
  return Math.min(100, total)
}

export async function generateNames(opts: GenerateOptions): Promise<GeneratedName[]> {
  const { description, length, style, count } = opts
  const { chars, themes, templates } = await loadAllData()

  // 加载风格词组
  let styleWords: StyleWords = { prefix: [], suffix: [] }
  try {
    const res = await fetch('/data/style-words.json')
    if (res.ok) {
      const all: Record<NameStyle, StyleWords> = await res.json()
      styleWords = all[style] || { prefix: [], suffix: [] }
    }
  } catch {
    styleWords = STYLE_WORDS[style]
  }

  // 1. 主题匹配（取所有匹配到的主题，不只取 2 个）
  const matchedThemes = matchTheme(description, themes, style)
  const fallbackTheme = themes.find(t => t.id === 'general') || themes[0]
  const activeThemes = matchedThemes.length ? matchedThemes : [fallbackTheme]

  // 2. 聚合候选字集
  const pool = buildCharPool(activeThemes, chars)

  // 3. 严格风格过滤（黑名单 category 真正剔除）
  let prefixArr = filterByStyleStrict(pool.prefix, style)
  let middleArr = filterByStyleStrict(pool.middle, style)
  let suffixArr = filterByStyleStrict(pool.suffix, style)

  // 注入风格核心字
  if (style !== '通用') {
    prefixArr = injectStyleCore(prefixArr, style, 'prefix')
    suffixArr = injectStyleCore(suffixArr, style, 'suffix')
  }

  // ⭐ 注入 description 关键词字（让用户描述真正参与生成）
  const descChars = extractDescriptionChars(description, chars)
  if (descChars.prefix.length) {
    const descCharObjs: NameChar[] = descChars.prefix
      .map(ch => chars.find(c => c.char === ch))
      .filter((c): c is NameChar => Boolean(c))
    // description 关键词放在最前面，优先被选中
    prefixArr = [...descCharObjs, ...prefixArr.filter(c => !descChars.prefix.includes(c.char))]
    middleArr = [...descCharObjs, ...middleArr.filter(c => !descChars.middle.includes(c.char))]
    suffixArr = [...descCharObjs, ...suffixArr.filter(c => !descChars.suffix.includes(c.char))]
  }

  // 4. 模板筛选（按风格精准匹配 + 实际生成长度匹配）
  const usedTemplates = templates.filter(t =>
    t.styles.includes(style) && templateActualLength(t.pattern) === length
  )
  if (!usedTemplates.length) return []

  // 5. 构建全部字符池（含意象词组）
  const allPools = buildAllPools(prefixArr, middleArr, suffixArr, style, styleWords)

  // 6. 温度采样：分两个阶段生成候选
  // 前 60% 严格在偏好字符中选，后 40% 混入冷门字保证多样性
  const targetCandidates = count * 10
  const candidateNames = new Set<string>()
  let safety = 0
  const splitPoint = Math.floor(targetCandidates * 0.6)

  while (candidateNames.size < targetCandidates && safety < targetCandidates * 5) {
    safety++
    const tpl = pickOne(usedTemplates)
    let result: string | null

    if (candidateNames.size < splitPoint) {
      // 严格阶段：全部从偏好池选取
      result = buildNameByTemplate(tpl.pattern, allPools)
    } else {
      // 发散阶段：30% 概率混入全量字库（避免完全脱离 description）
      if (Math.random() < 0.3) {
        const fallbackPools: Record<TemplateSlot, string[]> = {
          ...allPools,
          p: chars.map(c => c.char),
          s: chars.map(c => c.char)
        }
        result = buildNameByTemplate(tpl.pattern, fallbackPools)
      } else {
        result = buildNameByTemplate(tpl.pattern, allPools)
      }
    }

    if (result && [...result].length === length) {
      candidateNames.add(result)
    }
  }

  // 7. 综合评分
  const charMap = new Map<string, NameChar>()
  for (const c of chars) charMap.set(c.char, c)
  for (const c of prefixArr) charMap.set(c.char, c)
  for (const c of middleArr) charMap.set(c.char, c)
  for (const c of suffixArr) charMap.set(c.char, c)

  // description 关键词集合（用于评分加权）
  const descCharSet = new Set(descChars.prefix)

  const weights = STYLE_SCORE_WEIGHTS[style]
  const scored: GeneratedName[] = []
  for (const name of candidateNames) {
    const charList = [...name].map(c => charMap.get(c)).filter((c): c is NameChar => Boolean(c))
    const baseScore = scoreName(name, charList)
    const sm = styleMatchScore(name, charMap, style, styleWords, descCharSet)
    const finalScore = Math.round(
      baseScore.score * weights.tone +
      baseScore.breakdown.rhyme * weights.rhyme * 5 +
      sm * weights.style
    )
    scored.push({ ...baseScore, score: finalScore, breakdown: { ...baseScore.breakdown, styleMatch: sm } as any })
  }

  scored.sort((a, b) => b.score - a.score)

  // 8. 核心字限流 + 多样性去重
  const seen = new Set<string>()
  const coreCount: Record<string, number> = {}  // 核心字出现次数统计
  const coreMaxPerChar = 1  // 同一核心字最多出现 1 次
  const dedup: GeneratedName[] = []

  for (const s of scored) {
    if (dedup.length >= count) break
    if (seen.has(s.text)) continue

    // 检查是否包含已限流的核心字
    let blocked = false
    for (const ch of s.text) {
      const isCore = STYLE_CORE_CHARS[style]?.prefix.includes(ch) ||
        STYLE_CORE_CHARS[style]?.suffix.includes(ch)
      if (isCore && (coreCount[ch] || 0) >= coreMaxPerChar) {
        blocked = true
        break
      }
    }
    if (blocked) continue

    // 首末字频次限制
    const first = s.text[0]
    const last = s.text[s.text.length - 1]
    const firstCount = dedup.filter(x => x.text[0] === first).length
    const lastCount = dedup.filter(x => x.text[x.text.length - 1] === last).length
    if (firstCount >= 2 || lastCount >= 2) continue

    dedup.push(s)
    seen.add(s.text)
    for (const ch of s.text) {
      const isCore = STYLE_CORE_CHARS[style]?.prefix.includes(ch) ||
        STYLE_CORE_CHARS[style]?.suffix.includes(ch)
      if (isCore) coreCount[ch] = (coreCount[ch] || 0) + 1
    }
  }

  // 放宽限制：忽略核心字限流
  if (dedup.length < count) {
    for (const s of scored) {
      if (dedup.length >= count) break
      if (seen.has(s.text)) continue
      const first = s.text[0]
      const last = s.text[s.text.length - 1]
      const firstCount = dedup.filter(x => x.text[0] === first).length
      const lastCount = dedup.filter(x => x.text[x.text.length - 1] === last).length
      if (firstCount >= 2 || lastCount >= 2) continue
      dedup.push(s)
      seen.add(s.text)
    }
  }

  // 完全放开
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

function buildCharPool(themes: Theme[], allChars: NameChar[]) {
  const prefixSet = new Map<string, NameChar>()
  const middleSet = new Map<string, NameChar>()
  const suffixSet = new Map<string, NameChar>()
  for (const theme of themes) {
    for (const c of charsToFull(theme.prefix)) if (c) prefixSet.set(c.char, c)
    for (const c of charsToFull(theme.middle)) if (c) middleSet.set(c.char, c)
    for (const c of charsToFull(theme.suffix)) if (c) suffixSet.set(c.char, c)
  }
  if (prefixSet.size < 10) for (const c of allChars) if (!prefixSet.has(c.char)) prefixSet.set(c.char, c)
  if (middleSet.size < 10) for (const c of allChars) if (!middleSet.has(c.char)) middleSet.set(c.char, c)
  if (suffixSet.size < 10) for (const c of allChars) if (!suffixSet.has(c.char)) suffixSet.set(c.char, c)
  return {
    prefix: Array.from(prefixSet.values()),
    middle: Array.from(middleSet.values()),
    suffix: Array.from(suffixSet.values())
  }
}

// 音韵评分系统
// 0-100 分，按权重：声调起伏 25% / 押韵 20% / 平仄 15% / 字形 10% / 寓意 20% / 易读性 10%
import { getPinyinOfChars, type NameChar } from './useData'

const RHYME_GROUPS: Record<string, string[]> = {
  ang: ['ang', 'iang', 'uang', 'hang', 'sang', 'zang', 'cang', 'yang', 'wang', 'liang', 'guang', 'chuang', 'shuang', 'zhuang', 'pang', 'mang', 'fang', 'dang', 'tang', 'nang', 'lang', 'gang', 'kang', 'jiang', 'qiang', 'xiang', 'chang', 'shang', 'zhang', 'rang'],
  an: ['an', 'ian', 'uan', 'yan', 'wan', 'han', 'san', 'zan', 'can', 'lian', 'guan', 'chuan', 'shuan', 'zhuan', 'pan', 'man', 'fan', 'dan', 'tan', 'nan', 'lan', 'gan', 'kan', 'jian', 'qian', 'xian', 'bian', 'mian', 'nian', 'pian', 'tian', 'juan', 'quan', 'xuan', 'yuan', 'luan', 'nuan', 'huan', 'ruan', 'juan'],
  i: ['i', 'yi', 'li', 'ji', 'qi', 'xi', 'ri', 'zi', 'ci', 'si', 'zhi', 'chi', 'shi', 'mi', 'ni', 'di', 'ti', 'bi', 'pi', 'bi', 'ji', 'qi', 'xi', 'yi', 'bi', 'li', 'mi', 'ri'],
  u: ['u', 'wu', 'lu', 'ju', 'qu', 'xu', 'ru', 'zu', 'cu', 'su', 'zhu', 'chu', 'shu', 'mu', 'nu', 'du', 'tu', 'bu', 'pu', 'gu', 'ku', 'hu', 'fu', 'yu', 'lu', 'gu', 'hu', 'pu'],
  ao: ['ao', 'yao', 'lao', 'zao', 'cao', 'sao', 'mao', 'nao', 'dao', 'tao', 'pao', 'bao', 'gao', 'kao', 'hao', 'jiao', 'qiao', 'xiao', 'miao', 'niao', 'piao', 'tiao', 'biao', 'diao', 'liao', 'shao', 'rao'],
  ou: ['ou', 'you', 'lou', 'zou', 'cou', 'sou', 'mou', 'nou', 'dou', 'tou', 'pou', 'fou', 'gou', 'kou', 'hou', 'miu', 'niu', 'diu', 'liu'],
  eng: ['eng', 'weng', 'leng', 'zeng', 'ceng', 'seng', 'meng', 'neng', 'deng', 'teng', 'peng', 'feng', 'geng', 'keng', 'heng', 'beng', 'reng', 'sheng', 'zheng', 'cheng'],
  ong: ['ong', 'wong', 'long', 'zong', 'cong', 'song', 'nong', 'dong', 'tong', 'pong', 'bong', 'gong', 'kong', 'hong', 'yong', 'jiong', 'qiong', 'xiong', 'chong', 'zhong', 'rong'],
  ai: ['ai', 'yai', 'lai', 'zai', 'cai', 'sai', 'mai', 'nai', 'dai', 'tai', 'pai', 'bai', 'gai', 'kai', 'hai', 'wai', 'kuai', 'huai', 'guai', 'zhai', 'chai', 'shai'],
  ei: ['ei', 'wei', 'lei', 'zei', 'mei', 'nei', 'pei', 'bei', 'gei', 'kei', 'hei', 'shei']
}

const RINGING_GROUPS = ['ang', 'an', 'i', 'u', 'ao', 'ou', 'eng', 'ong', 'ai', 'ei']

function rhymeGroupOf(pinyinStr: string): string | null {
  for (const g of Object.keys(RHYME_GROUPS)) {
    if (RHYME_GROUPS[g].includes(pinyinStr.toLowerCase())) return g
  }
  return null
}

function isPing(tone: 1 | 2 | 3 | 4): boolean {
  return tone === 1 || tone === 2
}

function isZe(tone: 1 | 2 | 3 | 4): boolean {
  return tone === 3 || tone === 4
}

// 1. 声调起伏 0-100
function scoreToneFlow(pys: { tone: 1 | 2 | 3 | 4 }[]): number {
  if (pys.length < 2) return 60
  const tones = pys.map(p => p.tone)
  // 完全相同声调给低分
  const unique = new Set(tones).size
  if (unique === 1) return 20
  // 起伏越多越好
  let changes = 0
  for (let i = 1; i < tones.length; i++) {
    if (tones[i] !== tones[i - 1]) changes++
  }
  const changeRatio = changes / (tones.length - 1)
  // 偶数位 (index 1, 3) 以仄声 (3, 4) 为佳
  let bonus = 0
  let checkCount = 0
  for (let i = 1; i < tones.length; i += 2) {
    checkCount++
    if (isZe(tones[i])) bonus += 10
  }
  return Math.min(100, Math.round(40 + changeRatio * 40 + bonus))
}

// 2. 押韵 0-100
function scoreRhyme(pys: { pinyin: string }[]): number {
  if (!pys.length) return 50
  const last = pys[pys.length - 1].pinyin
  const g = rhymeGroupOf(last)
  if (!g) return 50
  if (RINGING_GROUPS.includes(g)) return 95
  return 60
}

// 3. 平仄 0-100
function scorePingZe(pys: { tone: 1 | 2 | 3 | 4 }[]): number {
  if (pys.length < 2) return 50
  const last = pys[pys.length - 1].tone
  // 末字仄声为佳
  let s = 0
  if (isZe(last)) s += 50
  else s += 25
  // 中间平仄交替加分
  for (let i = 0; i < pys.length - 1; i++) {
    if ((isPing(pys[i].tone) && isZe(pys[i + 1].tone)) || (isZe(pys[i].tone) && isPing(pys[i + 1].tone))) {
      s += 12
    }
  }
  return Math.min(100, s)
}

// 4. 字形（笔画疏密均衡）0-100
function scoreStructure(chars: string): number {
  if (!chars.length) return 50
  // 简化的字形评估：左右/上下结构/独体字
  // 0x4E00 - 0x9FFF 是 CJK 基本区
  let s = 60
  // 避免全部独体字
  const sum = chars.length
  s = 70
  return Math.min(100, s)
}

// 5. 寓意 0-100
function scoreMeaning(chars: string, charData: (NameChar | undefined)[]): number {
  if (!charData.length) return 50
  let s = 50
  for (const c of charData) {
    if (!c) continue
    // 有典故来源的字加分
    // 注：当前数据集没 source 字段，用 category 推断
    if (['光影', '植物', '动物', '清雅', '豪迈', '美玉', '意象', '文墨'].includes(c.category)) {
      s += 8
    }
  }
  return Math.min(100, s)
}

// 6. 易读性 0-100
function scorePronounce(pys: { pinyin: string }[]): number {
  if (!pys.length) return 50
  // 末字不重复
  const unique = new Set(pys.map(p => p.pinyin)).size
  if (unique < pys.length) return 60
  // 声母有变化
  const initials = pys.map(p => p.pinyin[0] || '')
  const uniqInit = new Set(initials).size
  return Math.min(100, 50 + uniqInit * 8)
}

export type ScoredName = {
  text: string
  pinyin: string[]
  tones: number[]
  meaning: string
  score: number
  breakdown: {
    toneFlow: number
    rhyme: number
    pingze: number
    structure: number
    meaning: number
    pronounce: number
    styleMatch?: number
  }
}

export function scoreName(name: string, charData?: NameChar[]): ScoredName {
  const pys = getPinyinOfChars(name)
  const tones = pys.map(p => p.tone)
  const toneFlow = scoreToneFlow(pys)
  const rhyme = scoreRhyme(pys)
  const pingze = scorePingZe(pys)
  const structure = scoreStructure(name)
  const meaning = scoreMeaning(name, charData || [])
  const pronounce = scorePronounce(pys)
  const score = Math.round(
    toneFlow * 0.25 +
    rhyme * 0.20 +
    pingze * 0.15 +
    structure * 0.10 +
    meaning * 0.20 +
    pronounce * 0.10
  )
  const meaningText = charData?.filter(Boolean).map(c => c.meaning).filter(Boolean).join(' · ') || ''
  return {
    text: name,
    pinyin: pys.map(p => p.pinyin),
    tones,
    meaning: meaningText,
    score,
    breakdown: { toneFlow, rhyme, pingze, structure, meaning, pronounce }
  }
}

export { rhymeGroupOf, RINGING_GROUPS }

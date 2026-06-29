// 拼音解析 - 用 pinyin-pro 拿到每个字的拼音/声调
import { pinyin } from 'pinyin-pro'

export type NameChar = {
  char: string
  pinyin: string
  tone: 1 | 2 | 3 | 4
  rhyme: string
  meaning: string
  category: string
}

export type Theme = {
  id: string
  name: string
  keywords: string[]
  prefix: string[]
  middle: string[]
  suffix: string[]
  styles: string[]
}

export type Template = {
  id: string
  pattern: string
  length: number
  style: string
  styles: string[]
}

let _chars: NameChar[] | null = null
let _themes: Theme[] | null = null
let _templates: Template[] | null = null

const charSet = new Set<string>()

async function loadJSON<T>(path: string): Promise<T> {
  const result = await $fetch<T>(path)
  return result as T
}

export async function loadAllData() {
  if (_chars && _themes && _templates) {
    return { chars: _chars, themes: _themes, templates: _templates }
  }
  const [c1, c2, c3, c4, themes, templates] = await Promise.all([
    loadJSON<NameChar[]>('/data/chars-1.json'),
    loadJSON<NameChar[]>('/data/chars-2.json'),
    loadJSON<NameChar[]>('/data/chars-3.json'),
    loadJSON<NameChar[]>('/data/chars-4.json'),
    loadJSON<Theme[]>('/data/themes.json'),
    loadJSON<Template[]>('/data/templates.json')
  ])
  const merged = [...c1, ...c2, ...c3, ...c4]
  const seen = new Set<string>()
  _chars = merged.filter(c => {
    if (seen.has(c.char)) return false
    seen.add(c.char)
    charSet.add(c.char)
    return true
  })
  _themes = themes
  _templates = templates
  return { chars: _chars, themes, templates }
}

export function getCharByName(name: string, chars?: NameChar[]): NameChar | undefined {
  const list = chars || _chars
  if (!list) return undefined
  return list.find(c => c.char === name)
}

export function isValidNameChar(c: string): boolean {
  return charSet.has(c)
}

export function charsToFull(chars: string[]): NameChar[] {
  if (!_chars) return []
  return chars
    .map(c => _chars!.find(x => x.char === c))
    .filter((c): c is NameChar => Boolean(c))
}

// 从一个汉字字符串提取每个字的拼音
export function getPinyinOfChars(chars: string): { pinyin: string; tone: 1 | 2 | 3 | 4 }[] {
  if (!chars) return []
  const arr = Array.from(chars)
  return arr.map(c => {
    const py = pinyin(c, { toneType: 'num', type: 'array' }) as string[] | string
    const pyStr = Array.isArray(py) ? py[0] : py
    const m = pyStr.match(/^([a-zü]+)([1-4])$/i)
    if (!m) return { pinyin: pyStr, tone: 1 as 1 | 2 | 3 | 4 }
    const tone = parseInt(m[2], 10) as 1 | 2 | 3 | 4
    return { pinyin: m[1], tone }
  })
}

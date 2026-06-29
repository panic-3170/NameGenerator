export interface HistoryItem {
  id: string
  description: string
  length: 2 | 3 | 4
  style: '通用' | '文艺' | '豪迈' | '清新' | '二次元'
  count: 10 | 20
  names: string[]
  timestamp: number
}

const STORAGE_KEY = 'namegen_history'
const MAX_HISTORY = 20

export function useHistory() {
  const history = ref<HistoryItem[]>([])

  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        history.value = JSON.parse(data)
      }
    } catch {
      history.value = []
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    } catch {}
  }

  function add(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now()
    }
    history.value = [newItem, ...history.value].slice(0, MAX_HISTORY)
    save()
  }

  function remove(id: string) {
    history.value = history.value.filter(h => h.id !== id)
    save()
  }

  function clear() {
    history.value = []
    save()
  }

  function formatTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) return '刚刚'
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
    if (diff < day) return `${Math.floor(diff / hour)}小时前`
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  load()

  return {
    history,
    add,
    remove,
    clear,
    formatTime
  }
}

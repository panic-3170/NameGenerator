type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  let initialTheme: Theme = 'system'
  if (typeof window !== 'undefined') {
    initialTheme = (localStorage.getItem('theme') as Theme) || 'system'
  }
  const theme = ref<Theme>(initialTheme)

  const isDark = computed(() => {
    if (theme.value === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return false
    }
    return theme.value === 'dark'
  })

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    updateDocumentClass()
  }

  function toggle() {
    const nextTheme: Theme = theme.value === 'dark' ? 'light' : theme.value === 'light' ? 'system' : 'dark'
    setTheme(nextTheme)
  }

  function updateDocumentClass() {
    if (typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  if (typeof window !== 'undefined') {
    updateDocumentClass()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateDocumentClass)
  }

  return {
    theme,
    isDark,
    setTheme,
    toggle
  }
}

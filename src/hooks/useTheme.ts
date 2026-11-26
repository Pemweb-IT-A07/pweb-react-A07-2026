import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Tema terang/gelap, disimpan via useLocalStorage dan dipasang ke <html data-theme>. */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('amm:theme', getSystemTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggleTheme }
}

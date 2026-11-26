import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'light' | 'dark'

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Tema terang/gelap, disimpan via useLocalStorage dan dipasang ke <html data-theme>.
 * Ganti tema memakai View Transitions API: tema baru "menyapu" masuk dari samping
 * (ke gelap dari kiri, ke terang dari kanan). Tanpa dukungan browser / reduced motion,
 * tema langsung berganti tanpa animasi.
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('amm:theme', getSystemTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement

    if (!document.startViewTransition || prefersReducedMotion()) {
      setTheme(next)
      return
    }

    // Arah sapuan dibaca CSS lewat data-theme-switch
    root.dataset.themeSwitch = next
    const transition = document.startViewTransition(() => {
      // Snapshot "sesudah" harus sudah memakai tema baru, jadi update DOM secara sinkron
      flushSync(() => setTheme(next))
      root.dataset.theme = next
    })
    transition.finished.finally(() => {
      delete root.dataset.themeSwitch
    })
  }

  return { theme, toggleTheme }
}

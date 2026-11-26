import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Tekan "/" (di luar input) untuk fokus ke elemen yang dirujuk `ref`. */
export function useSlashFocus(ref: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      if (isTyping || !ref.current) return
      e.preventDefault() // jangan ketik "/" ke input
      ref.current.focus()
      ref.current.select()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ref])
}

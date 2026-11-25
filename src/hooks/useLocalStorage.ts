import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * useState yang otomatis tersimpan di localStorage.
 * Nilai awal dibaca sekali (lazy init); jika key belum ada / JSON rusak, pakai initialValue.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw) as T
    } catch {
      // JSON rusak / storage tidak tersedia -> pakai initialValue
    }
    return initialValue instanceof Function ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage penuh / tidak tersedia -> abaikan, state tetap jalan
    }
  }, [key, value])

  return [value, setValue]
}

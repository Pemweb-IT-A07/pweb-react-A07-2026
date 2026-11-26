import { useEffect, useState } from 'react'

/**
 * Mengembalikan `value` yang baru ter-update setelah tidak berubah selama `delay` ms.
 * Dipakai untuk search: filter baru jalan setelah user berhenti mengetik.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Setiap value berubah sebelum delay habis, timer lama dibatalkan
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

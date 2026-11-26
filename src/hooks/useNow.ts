import { useEffect, useState } from 'react'

/**
 * Waktu "sekarang" yang di-refresh tiap `intervalMs` (default 1 menit).
 * Dipakai untuk derived state berbasis waktu (Rawan Ghosting) tanpa memanggil
 * `new Date()` langsung saat render.
 */
export function useNow(intervalMs: number = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}

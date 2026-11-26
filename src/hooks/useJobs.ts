import { useCallback, useEffect, useState } from 'react'
import { fetchJobs } from '../services/jobService'
import type { JobSource } from '../services/jobService'
import type { JobListing } from '../types'

export type FetchStatus = 'loading' | 'success' | 'error'

interface JobsResult {
  /** Request mana yang menghasilkan data ini (source + reloadKey) */
  key: string
  status: Exclude<FetchStatus, 'loading'>
  jobs: JobListing[]
  error: string | null
}

/**
 * Ambil lowongan dari `source` memakai useEffect + fetch + AbortController.
 * `retry()` memicu fetch ulang dari sumber yang sama.
 */
export function useJobs(source: JobSource) {
  const [result, setResult] = useState<JobsResult | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const requestKey = `${source}:${reloadKey}`

  useEffect(() => {
    const controller = new AbortController()

    fetchJobs(source, controller.signal)
      .then((jobs) => setResult({ key: requestKey, status: 'success', jobs, error: null }))
      .catch((err: unknown) => {
        // Request dibatalkan karena unmount / ganti sumber -> bukan error
        if (controller.signal.aborted) return
        const message =
          err instanceof TypeError
            ? 'Tidak bisa terhubung ke server. Periksa koneksi internet kamu.'
            : err instanceof Error
              ? err.message
              : 'Terjadi kesalahan tak dikenal'
        setResult({ key: requestKey, status: 'error', jobs: [], error: message })
      })

    // Cleanup: batalkan request lama
    return () => controller.abort()
  }, [source, requestKey])

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  // Derived: selama hasil belum untuk request terbaru -> Loading
  const isCurrent = result?.key === requestKey
  return {
    status: isCurrent ? result.status : ('loading' as FetchStatus),
    jobs: isCurrent ? result.jobs : [],
    error: isCurrent ? result.error : null,
    retry,
  }
}

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarClock } from 'lucide-react'
import type { Application, ApplicationUpdater } from '../types'
import { createActivityLog, formatDateTime } from '../utils'

interface InterviewSchedulePanelProps {
  application: Application
  onUpdate: (updater: ApplicationUpdater) => void
  /** true jika dibuka dari banner bentrok: panel di-scroll & input langsung fokus */
  autoFocus?: boolean
}

/** Ubah jadwal interview untuk lamaran berstatus INTERVIEW (untuk menyelesaikan bentrok). */
export function InterviewSchedulePanel({ application: app, onUpdate, autoFocus = false }: InterviewSchedulePanelProps) {
  const [value, setValue] = useState(app.interviewDateTime ?? '')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!autoFocus) return
    inputRef.current?.scrollIntoView({ block: 'nearest' })
    inputRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!value) {
      setError('Jadwal interview wajib diisi')
      return
    }
    if (value === app.interviewDateTime) {
      setError('Jadwal belum diubah')
      return
    }
    const timestamp = new Date().toISOString()
    const log = createActivityLog(
      `Jadwal interview diubah: ${formatDateTime(app.interviewDateTime)} → ${formatDateTime(value)}`,
      timestamp,
    )
    onUpdate((current) => ({
      ...current,
      interviewDateTime: value,
      lastUpdatedAt: timestamp,
      activityLogs: [...current.activityLogs, log],
    }))
    setError(null)
  }

  return (
    <form className={`panel ${autoFocus ? 'panel--highlight' : ''}`} onSubmit={handleSubmit} noValidate>
      <h3>Jadwal interview</h3>
      <div className="inline-form">
        <input
          ref={inputRef}
          className={`input ${error ? 'is-invalid' : ''}`}
          type="datetime-local"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          aria-label="Jadwal interview"
        />
        <button type="submit" className="btn btn--primary">
          <CalendarClock size={16} strokeWidth={1.5} aria-hidden="true" />
          Simpan jadwal
        </button>
      </div>
      {error && <p className="field__error">{error}</p>}
    </form>
  )
}

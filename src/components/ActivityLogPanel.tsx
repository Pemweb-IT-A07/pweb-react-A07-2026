import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Application, ApplicationUpdater } from '../types'
import { createActivityLog, formatDateTime } from '../utils'

interface ActivityLogPanelProps {
  application: Application
  onUpdate: (updater: ApplicationUpdater) => void
}

/** Riwayat otomatis (buat lamaran, pindah status) + catatan manual Kapten. */
export function ActivityLogPanel({ application, onUpdate }: ActivityLogPanelProps) {
  const [note, setNote] = useState('')
  // Terbaru di atas (copy dulu, jangan reverse array asli)
  const logs = [...application.activityLogs].reverse()

  const addNote = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = note.trim()
    if (!value) return
    const log = createActivityLog(`Catatan: ${value}`)
    onUpdate((app) => ({ ...app, activityLogs: [...app.activityLogs, log] }))
    setNote('')
  }

  return (
    <section className="panel">
      <form className="inline-form" onSubmit={addNote}>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambah catatan, misal: HR minta portofolio"
          aria-label="Catatan baru"
        />
        <button type="submit" className="btn btn--primary" disabled={!note.trim()}>
          Catat
        </button>
      </form>

      <ol className="timeline">
        {logs.map((log) => (
          <li key={log.id}>
            <time dateTime={log.timestamp}>{formatDateTime(log.timestamp)}</time>
            <p>{log.message}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

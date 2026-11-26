import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarClock, Check, TriangleAlert } from 'lucide-react'
import type { Application, InterviewConflict } from '../types'
import { findInterviewConflicts, formatDateTime } from '../utils'
import { Modal } from './Modal'

interface RescheduleDialogProps {
  /** Seluruh lamaran (bentrok dicek terhadap semua jadwal interview, bukan hanya yang bentrok) */
  applications: Application[]
  conflicts: InterviewConflict[]
  onClose: () => void
  /** id lamaran -> jadwal interview baru (hanya yang berubah) */
  onSave: (changes: Record<string, string>) => void
}

/** Atur ulang jadwal semua lamaran yang bentrok sekaligus, dengan cek bentrok langsung. */
export function RescheduleDialog({ applications, conflicts, onClose, onSave }: RescheduleDialogProps) {
  // Lamaran yang terlibat bentrok (diambil sekali saat dialog dibuka), urut dari jadwal paling awal
  const [involved] = useState<Application[]>(() => {
    const byId = new Map<string, Application>()
    conflicts.forEach(({ a, b }) => {
      byId.set(a.id, a)
      byId.set(b.id, b)
    })
    return [...byId.values()].sort((x, y) => (x.interviewDateTime ?? '').localeCompare(y.interviewDateTime ?? ''))
  })

  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(involved.map((app) => [app.id, app.interviewDateTime ?? ''])),
  )

  // Derived: bentrok dihitung ulang dari jadwal draft + jadwal interview lain
  const previewConflicts = useMemo(
    () =>
      findInterviewConflicts(
        applications.map((app) => (app.id in drafts ? { ...app, interviewDateTime: drafts[app.id] } : app)),
      ),
    [applications, drafts],
  )

  const changes: Record<string, string> = Object.fromEntries(
    involved
      .filter((app) => drafts[app.id] && drafts[app.id] !== app.interviewDateTime)
      .map((app) => [app.id, drafts[app.id]]),
  )
  const changedCount = Object.keys(changes).length
  const hasEmpty = involved.some((app) => !drafts[app.id])

  /** Lamaran lain yang masih bentrok dengan `id` */
  const clashesOf = (id: string) =>
    previewConflicts
      .filter(({ a, b }) => a.id === id || b.id === id)
      .map(({ a, b, diffMinutes }) => `${(a.id === id ? b : a).company} (${diffMinutes} menit)`)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (changedCount === 0 || hasEmpty) return
    onSave(changes)
    onClose()
  }

  const stillClashing = previewConflicts.length > 0

  return (
    <Modal title="Atur jadwal bentrok" onClose={onClose}>
      <form className="reschedule" onSubmit={handleSubmit} noValidate>
        <p className="muted">
          Ubah jadwal interview yang bentrok. Bentrok dicek langsung terhadap semua jadwal interview kamu.
        </p>

        <ul className="reschedule__list">
          {involved.map((app) => {
            const clashes = clashesOf(app.id)
            const changed = drafts[app.id] !== app.interviewDateTime
            return (
              <li key={app.id} className="reschedule__row">
                <div className="reschedule__info">
                  <strong>{app.company}</strong>
                  <span className="muted">{app.role}</span>
                  {changed && (
                    <span className="muted reschedule__was">
                      Sebelumnya {formatDateTime(app.interviewDateTime)}
                    </span>
                  )}
                </div>
                <div className="reschedule__input">
                  <input
                    className={`input ${clashes.length > 0 || !drafts[app.id] ? 'is-invalid' : ''}`}
                    type="datetime-local"
                    value={drafts[app.id]}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [app.id]: e.target.value }))}
                    aria-label={`Jadwal interview ${app.company}`}
                  />
                  {!drafts[app.id] ? (
                    <span className="field__error">Jadwal wajib diisi</span>
                  ) : clashes.length > 0 ? (
                    <span className="field__error">Bentrok dengan {clashes.join(', ')}</span>
                  ) : (
                    <span className="reschedule__ok">
                      <Check size={14} strokeWidth={1.5} aria-hidden="true" />
                      Aman
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="app-form__footer">
          <span className={`reschedule__summary ${stillClashing ? 'field__error' : 'reschedule__ok'}`}>
            {stillClashing ? (
              <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Check size={16} strokeWidth={1.5} aria-hidden="true" />
            )}
            {stillClashing ? `Masih ada ${previewConflicts.length} bentrok` : 'Tidak ada jadwal bentrok'}
          </span>
          <button type="button" className="btn" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={changedCount === 0 || hasEmpty}>
            <CalendarClock size={16} strokeWidth={1.5} aria-hidden="true" />
            {changedCount > 0 ? `Simpan ${changedCount} jadwal` : 'Simpan jadwal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Application, ApplicationStatus, ApplicationUpdater, WorkMode } from '../types'
import { applyTransition, getAllowedTransitions, STATUS_LABEL, validateTransition } from '../utils'

interface StatusTransitionPanelProps {
  application: Application
  onUpdate: (updater: ApplicationUpdater) => void
}

/** Hanya menampilkan status tujuan yang sah + input kondisional sesuai status tujuan. */
export function StatusTransitionPanel({ application: app, onUpdate }: StatusTransitionPanelProps) {
  const allowed = getAllowedTransitions(app.status)

  const [target, setTarget] = useState<ApplicationStatus | ''>('')
  const [cvVersion, setCvVersion] = useState(app.cvVersion ?? '')
  const [appliedDate, setAppliedDate] = useState(app.appliedDate ?? '')
  const [interviewDateTime, setInterviewDateTime] = useState(app.interviewDateTime ?? '')
  const [salaryOffer, setSalaryOffer] = useState(app.salaryOffer ? String(app.salaryOffer) : '')
  const [workMode, setWorkMode] = useState<WorkMode>(app.workMode)
  const [errors, setErrors] = useState<string[]>([])

  if (allowed.length === 0) {
    return (
      <section className="panel">
        <h3>Pindah Status</h3>
        <p className="muted">
          Status <strong>{STATUS_LABEL[app.status]}</strong> bersifat final, tidak bisa dipindah lagi.
        </p>
      </section>
    )
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!target) {
      setErrors(['Pilih status tujuan'])
      return
    }
    // Hanya kirim field yang relevan dengan status tujuan
    const payload =
      target === 'APPLIED'
        ? { cvVersion: cvVersion.trim(), appliedDate }
        : target === 'INTERVIEW'
          ? { interviewDateTime }
          : target === 'OFFER'
            ? { salaryOffer: Number(salaryOffer), workMode }
            : {}

    const validationErrors = validateTransition(app, target, payload)
    setErrors(validationErrors)
    if (validationErrors.length > 0) return

    onUpdate((current) => applyTransition(current, target, payload))
    setTarget('')
  }

  return (
    <form className="panel" onSubmit={handleSubmit} noValidate>
      <h3>Pindah Status</h3>
      <div className="form-grid">
        <label className="field form-grid__full">
          <span>
            Dari <strong>{STATUS_LABEL[app.status]}</strong> ke
          </span>
          <select
            className="select"
            value={target}
            onChange={(e) => {
              setTarget(e.target.value as ApplicationStatus | '')
              setErrors([])
            }}
          >
            <option value="">— Pilih status tujuan —</option>
            {allowed.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        {target === 'APPLIED' && (
          <>
            <label className="field">
              <span>Versi CV</span>
              <input className="input" value={cvVersion} onChange={(e) => setCvVersion(e.target.value)} />
            </label>
            <label className="field">
              <span>Tanggal Melamar</span>
              <input
                className="input"
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
              />
            </label>
          </>
        )}

        {target === 'INTERVIEW' && (
          <label className="field form-grid__full">
            <span>Jadwal Interview</span>
            <input
              className="input"
              type="datetime-local"
              value={interviewDateTime}
              onChange={(e) => setInterviewDateTime(e.target.value)}
            />
          </label>
        )}

        {target === 'OFFER' && (
          <>
            <label className="field">
              <span>Uang Saku / Gaji (Rp)</span>
              <input
                className="input"
                type="number"
                min={0}
                step={50000}
                value={salaryOffer}
                onChange={(e) => setSalaryOffer(e.target.value)}
                placeholder="5000000"
              />
            </label>
            <label className="field">
              <span>Mode Kerja</span>
              <select className="select" value={workMode} onChange={(e) => setWorkMode(e.target.value as WorkMode)}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </label>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <ul className="field__error error-list" role="alert">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <div className="app-form__footer">
        <button type="submit" className="btn btn--primary" disabled={!target}>
          Simpan Status
        </button>
      </div>
    </form>
  )
}

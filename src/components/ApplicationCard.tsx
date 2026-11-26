import { CalendarClock, Trash2 } from 'lucide-react'
import type { Application } from '../types'
import { formatDateTime, formatRupiah, getMatchLevel } from '../utils'
import { StatusBadge } from './StatusBadge'

interface ApplicationCardProps {
  application: Application
  skillMatch: number
  isGhosting: boolean
  onOpen: (id: string) => void
  onSimulate: (id: string) => void
  onDelete: (id: string) => void
}

export function ApplicationCard({
  application: app,
  skillMatch,
  isGhosting,
  onOpen,
  onSimulate,
  onDelete,
}: ApplicationCardProps) {
  const done = app.checklist.filter((item) => item.done).length
  const total = app.checklist.length
  const canSimulate = app.status === 'APPLIED' || app.status === 'SCREENING'

  return (
    <article className={`card app-card ${isGhosting ? 'app-card--ghosting' : ''}`}>
      <header className="app-card__header">
        <div>
          <h3>{app.company}</h3>
          <p className="muted">{app.role}</p>
        </div>
        <div className="app-card__badges">
          <StatusBadge status={app.status} />
          {isGhosting && <span className="badge badge--outline-red">Rawan Ghosting</span>}
        </div>
      </header>

      <dl className="app-card__meta">
        <div>
          <dt>Versi CV</dt>
          <dd>{app.cvVersion ?? '-'}</dd>
        </div>
        <div>
          <dt>Skill Match</dt>
          <dd>
            <span className={`badge badge--${getMatchLevel(skillMatch)}`}>{skillMatch}%</span>
          </dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{app.workMode}</dd>
        </div>
        {app.status === 'INTERVIEW' && (
          <div>
            <dt>Interview</dt>
            <dd>{formatDateTime(app.interviewDateTime)}</dd>
          </div>
        )}
        {app.status === 'OFFER' && (
          <div>
            <dt>Offer</dt>
            <dd>{formatRupiah(app.salaryOffer)}</dd>
          </div>
        )}
      </dl>

      <div className="progress" title="Progress checklist">
        <div className="progress__label">
          <span>Checklist</span>
          <span>
            {done}/{total}
          </span>
        </div>
        <div className="progress__track">
          <div className="progress__bar" style={{ transform: `scaleX(${total === 0 ? 0 : done / total})` }} />
        </div>
      </div>

      <footer className="app-card__footer">
        <span className="muted app-card__updated" title="Terakhir update">
          {formatDateTime(app.lastUpdatedAt)}
        </span>
        <div className="app-card__actions">
          {canSimulate && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => onSimulate(app.id)}
              title="Mundurkan lastUpdatedAt 15 hari"
            >
              <CalendarClock size={16} strokeWidth={1.5} aria-hidden="true" />
              Simulasi +15 Hari
            </button>
          )}
          <button type="button" className="btn btn--sm" onClick={() => onOpen(app.id)}>
            Detail
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--icon btn--sm btn--danger"
            onClick={() => onDelete(app.id)}
            aria-label={`Hapus lamaran ${app.company}`}
            title="Hapus"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </footer>
    </article>
  )
}

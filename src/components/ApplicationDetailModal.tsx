import { useState } from 'react'
import type { Application, ApplicationUpdater } from '../types'
import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'
import { formatDateTime, formatRupiah } from '../utils'
import { StatusTransitionPanel } from './StatusTransitionPanel'
import { ChecklistPanel } from './ChecklistPanel'
import { ActivityLogPanel } from './ActivityLogPanel'
import { InterviewPrepTimer } from './InterviewPrepTimer'
import { InterviewSchedulePanel } from './InterviewSchedulePanel'

type DetailTab = 'info' | 'checklist' | 'log' | 'prep'

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'info', label: 'Info & Status' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'log', label: 'Activity Log' },
  { key: 'prep', label: 'Latihan Interview' },
]

interface ApplicationDetailModalProps {
  application: Application
  onClose: () => void
  /** Update lamaran ini secara immutable */
  onUpdate: (updater: ApplicationUpdater) => void
  /** Dibuka dari banner bentrok: langsung arahkan ke editor jadwal interview */
  focusSchedule?: boolean
}

/** Modal Detail Lamaran: info + pindah status, checklist, activity log, latihan interview. */
export function ApplicationDetailModal({
  application,
  onClose,
  onUpdate,
  focusSchedule = false,
}: ApplicationDetailModalProps) {
  const [tab, setTab] = useState<DetailTab>('info')

  return (
    <Modal
      title={
        <>
          {application.company} <span className="muted">· {application.role}</span>
        </>
      }
      onClose={onClose}
    >
      <div className="subtabs" role="tablist">
        {DETAIL_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`subtab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <>
          <dl className="detail-grid">
            <dt>Status</dt>
            <dd>
              <StatusBadge status={application.status} />
            </dd>
            <dt>Mode Kerja</dt>
            <dd>{application.workMode}</dd>
            <dt>Required Skills</dt>
            <dd>{application.requiredSkills.join(', ') || '-'}</dd>
            <dt>Versi CV</dt>
            <dd>{application.cvVersion ?? '-'}</dd>
            <dt>Tanggal Melamar</dt>
            <dd>{application.appliedDate ?? '-'}</dd>
            <dt>Jadwal Interview</dt>
            <dd>{formatDateTime(application.interviewDateTime)}</dd>
            <dt>Offer</dt>
            <dd>{formatRupiah(application.salaryOffer)}</dd>
            <dt>Terakhir Update</dt>
            <dd>{formatDateTime(application.lastUpdatedAt)}</dd>
          </dl>
          {application.status === 'INTERVIEW' && (
            <InterviewSchedulePanel
              key={application.interviewDateTime}
              application={application}
              onUpdate={onUpdate}
              autoFocus={focusSchedule}
            />
          )}
          {/* key = status: form di-reset setiap status berubah */}
          <StatusTransitionPanel key={application.status} application={application} onUpdate={onUpdate} />
        </>
      )}
      {tab === 'checklist' && <ChecklistPanel application={application} onUpdate={onUpdate} />}
      {tab === 'log' && <ActivityLogPanel application={application} onUpdate={onUpdate} />}
      {tab === 'prep' && <InterviewPrepTimer />}
    </Modal>
  )
}

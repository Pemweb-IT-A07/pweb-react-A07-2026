import { useState } from 'react'
import type { Application } from '../types'
import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'
import { formatDateTime, formatRupiah } from '../utils'

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
}

/** Modal Detail Lamaran. Isi tiap tab diisi oleh fitur 4 (status, checklist, log) & 5 (timer). */
export function ApplicationDetailModal({ application, onClose }: ApplicationDetailModalProps) {
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
          <dd>
            {formatRupiah(application.salaryOffer)}
          </dd>
          <dt>Terakhir Update</dt>
          <dd>{formatDateTime(application.lastUpdatedAt)}</dd>
        </dl>
      )}
      {tab === 'checklist' && <p className="empty">Checklist persiapan akan tampil di sini.</p>}
      {tab === 'log' && <p className="empty">Riwayat aktivitas akan tampil di sini.</p>}
      {tab === 'prep' && <p className="empty">Latihan interview akan tampil di sini.</p>}
    </Modal>
  )
}

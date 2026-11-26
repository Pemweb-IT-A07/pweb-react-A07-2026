import { useMemo, useState } from 'react'
import type { Application, ApplicationStatus } from '../types'
import { calculateSkillMatch, isGhostingRisk, normalizeText, STATUS_LABEL } from '../utils'
import { ApplicationCard } from './ApplicationCard'
import { useNow } from '../hooks/useNow'

type PipelineSort = 'newest' | 'interview' | 'offer'
type StatusFilter = ApplicationStatus | 'ALL'

const STATUS_OPTIONS = Object.keys(STATUS_LABEL) as ApplicationStatus[]

interface PipelineViewProps {
  applications: Application[]
  skills: string[]
  onOpen: (id: string) => void
  onSimulate: (id: string) => void
  onDelete: (id: string) => void
}

function interviewTime(app: Application): number {
  if (app.status !== 'INTERVIEW' || !app.interviewDateTime) return Number.POSITIVE_INFINITY
  const t = new Date(app.interviewDateTime).getTime()
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
}

export function PipelineView({ applications, skills, onOpen, onSimulate, onDelete }: PipelineViewProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [onlyGhosting, setOnlyGhosting] = useState(false)
  const [sortBy, setSortBy] = useState<PipelineSort>('newest')

  const now = useNow()

  // Derived state: match & ghosting dihitung langsung, tidak disimpan
  const rows = useMemo(() => {
    return applications.map((app) => ({
      app,
      match: calculateSkillMatch(skills, app.requiredSkills).score,
      ghosting: isGhostingRisk(app, now),
    }))
  }, [applications, skills, now])

  // Filter gabungan: teks + status + rawan ghosting, lalu sorting
  const visibleRows = useMemo(() => {
    const q = normalizeText(query)
    return rows
      .filter(({ app }) => !q || [app.company, app.role, app.cvVersion ?? ''].some((t) => normalizeText(t).includes(q)))
      .filter(({ app }) => statusFilter === 'ALL' || app.status === statusFilter)
      .filter(({ ghosting }) => !onlyGhosting || ghosting)
      .sort((a, b) => {
        if (sortBy === 'interview') return interviewTime(a.app) - interviewTime(b.app)
        if (sortBy === 'offer') return (b.app.salaryOffer ?? 0) - (a.app.salaryOffer ?? 0)
        return b.app.createdAt.localeCompare(a.app.createdAt)
      })
  }, [rows, query, statusFilter, onlyGhosting, sortBy])

  const isFiltered = query !== '' || statusFilter !== 'ALL' || onlyGhosting

  return (
    <section className="pipeline">
      <div className="toolbar toolbar--pipeline card">
        <label className="field toolbar__search">
          <span>Cari lamaran</span>
          <input
            className="input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Perusahaan, role, atau versi CV"
          />
        </label>
        <label className="field">
          <span>Status</span>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="ALL">Semua status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Urutkan</span>
          <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value as PipelineSort)}>
            <option value="newest">Terbaru</option>
            <option value="interview">Jadwal Interview Terdekat</option>
            <option value="offer">Offer Tertinggi</option>
          </select>
        </label>
        <label className="toggle">
          <input type="checkbox" checked={onlyGhosting} onChange={(e) => setOnlyGhosting(e.target.checked)} />
          <span>Hanya Rawan Ghosting</span>
        </label>
      </div>

      <p className="muted explorer__summary">
        Menampilkan {visibleRows.length} dari {applications.length} lamaran
      </p>

      {applications.length === 0 ? (
        <p className="empty">Belum ada lamaran. Simpan lowongan dari Eksplorasi atau isi form di atas.</p>
      ) : visibleRows.length === 0 ? (
        <p className="empty">Tidak ada lamaran yang cocok dengan filter{isFiltered ? ' saat ini' : ''}.</p>
      ) : (
        <div className="app-list">
          {visibleRows.map(({ app, match, ghosting }) => (
            <ApplicationCard
              key={app.id}
              application={app}
              skillMatch={match}
              isGhosting={ghosting}
              onOpen={onOpen}
              onSimulate={onSimulate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

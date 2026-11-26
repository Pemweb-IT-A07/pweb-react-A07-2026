import { useMemo, useState } from 'react'
import type { RefObject } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { useJobs } from '../hooks/useJobs'
import type { JobSource } from '../services/jobService'
import type { Application, JobListing } from '../types'
import { calculateSkillMatch, isDuplicateApplication, normalizeText } from '../utils'
import { JobCard } from './JobCard'

type JobSort = 'match' | 'newest'

interface JobExplorerProps {
  /** Ref input search, untuk shortcut "/" */
  searchRef?: RefObject<HTMLInputElement | null>
  skills: string[]
  applications: Application[]
  onSaveJob: (job: JobListing) => void
}

const ALL_CATEGORIES = 'ALL'

export function JobExplorer({ searchRef, skills, applications, onSaveJob }: JobExplorerProps) {
  const [source, setSource] = useState<JobSource>('remote')
  const { status, jobs, error, retry } = useJobs(source)

  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [sortBy, setSortBy] = useState<JobSort>('match')

  // Derived: daftar kategori dari data yang sedang dimuat
  const categories = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.category))).sort(),
    [jobs],
  )

  // Derived: match score dihitung ulang otomatis saat skill / data berubah
  const visibleJobs = useMemo(() => {
    const q = normalizeText(debouncedKeyword)
    return jobs
      .map((job) => ({ job, match: calculateSkillMatch(skills, job.tags) }))
      .filter(({ job }) => category === ALL_CATEGORIES || job.category === category)
      .filter(({ job }) => {
        if (!q) return true
        return [job.title, job.company_name, job.candidate_required_location, ...job.tags]
          .some((text) => normalizeText(text).includes(q))
      })
      .sort((a, b) =>
        sortBy === 'match'
          ? b.match.score - a.match.score
          : (b.job.publication_date ?? '').localeCompare(a.job.publication_date ?? ''),
      )
  }, [jobs, skills, debouncedKeyword, category, sortBy])

  const changeSource = (next: JobSource) => {
    setSource(next)
    setCategory(ALL_CATEGORIES)
  }

  return (
    <section className="explorer">
      <div className="toolbar card">
        <label className="field toolbar__search">
          <span>Cari lowongan</span>
          <input
            className="input"
            type="search"
            ref={searchRef}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Judul, perusahaan, lokasi, atau skill (tekan /)"
          />
        </label>
        <label className="field">
          <span>Kategori</span>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value={ALL_CATEGORIES}>Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Urutkan</span>
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as JobSort)}
          >
            <option value="match">Match tertinggi</option>
            <option value="newest">Terbaru</option>
          </select>
        </label>
        <div className="field">
          <span>Sumber data</span>
          <div className="segmented">
            <button
              type="button"
              className={source === 'remote' ? 'is-active' : ''}
              onClick={() => changeSource('remote')}
            >
              Remotive API
            </button>
            <button
              type="button"
              className={source === 'local' ? 'is-active' : ''}
              onClick={() => changeSource('local')}
            >
              Fallback Lokal
            </button>
          </div>
        </div>
      </div>

      <p className="muted explorer__summary">
        {status === 'success' &&
          `${visibleJobs.length} dari ${jobs.length} lowongan · sumber: ${
            source === 'remote' ? 'Remotive API' : 'magang-fallback.json'
          }`}
        {keyword !== debouncedKeyword && ' · mencari…'}
      </p>

      {status === 'loading' && (
        <div className="state state--loading" role="status">
          <span className="spinner" aria-hidden="true" />
          Memuat lowongan…
        </div>
      )}

      {status === 'error' && (
        <div className="state state--error" role="alert">
          <strong>Gagal memuat lowongan</strong>
          <p>{error}</p>
          <div className="state__actions">
            <button type="button" className="btn" onClick={retry}>
              Coba Lagi
            </button>
            {source !== 'local' && (
              <button type="button" className="btn btn--primary" onClick={() => changeSource('local')}>
                Pakai Fallback Lokal
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'success' && visibleJobs.length === 0 && (
        <p className="empty">
          {jobs.length === 0
            ? 'Belum ada lowongan dari sumber ini.'
            : 'Tidak ada lowongan yang cocok dengan pencarian / filter.'}
        </p>
      )}

      {status === 'success' && visibleJobs.length > 0 && (
        <div className="job-grid">
          {visibleJobs.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              isApplied={isDuplicateApplication(applications, job.company_name, job.title)}
              onSave={onSaveJob}
            />
          ))}
        </div>
      )}
    </section>
  )
}

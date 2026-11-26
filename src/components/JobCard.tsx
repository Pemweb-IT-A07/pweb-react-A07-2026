import { Check, ExternalLink, Plus } from 'lucide-react'
import type { JobListing, SkillMatchResult } from '../types'
import { getMatchLevel } from '../utils'

interface JobCardProps {
  job: JobListing
  match: SkillMatchResult
  isApplied: boolean
  onSave: (job: JobListing) => void
}

export function JobCard({ job, match, isApplied, onSave }: JobCardProps) {
  const level = getMatchLevel(match.score)

  return (
    <article className="card job-card">
      <header className="job-card__header">
        <div>
          <h3>{job.title}</h3>
          <p className="muted">{job.company_name}</p>
        </div>
        <div className={`badge badge--${level} match`} title="Skill Match">
          <span className="match__value">{match.score}%</span>
          <span className="match__label">match</span>
        </div>
      </header>

      <p className="job-card__meta muted">
        <span>{job.candidate_required_location}</span>
        <span>{job.category}</span>
        {job.salary && <span>{job.salary}</span>}
      </p>

      {job.tags.length === 0 ? (
        <p className="muted">Lowongan tidak mencantumkan skill</p>
      ) : (
        <ul className="chip-list" aria-label="Skill yang diminta">
          {match.matched.map((s) => (
            <li key={`ok-${s}`} className="chip chip--ok" title="Skill sudah kamu kuasai">
              <Check size={12} strokeWidth={2} aria-hidden="true" />
              {s}
            </li>
          ))}
          {match.missing.map((s) => (
            <li key={`miss-${s}`} className="chip chip--missing" title="Skill belum kamu kuasai">
              {s}
            </li>
          ))}
        </ul>
      )}

      <footer className="job-card__footer">
        {job.url ? (
          <a href={job.url} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
            Lihat lowongan
            <ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" />
          </a>
        ) : (
          <span />
        )}
        {/* Spec: tombol otomatis disabled "Sudah Dilamar" jika sudah ada di daftar lamaran */}
        <button
          type="button"
          className={`btn btn--sm ${isApplied ? 'btn--ghost' : ''}`}
          disabled={isApplied}
          onClick={() => onSave(job)}
        >
          {isApplied ? (
            <Check size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          {isApplied ? 'Sudah Dilamar' : 'Simpan ke Wishlist'}
        </button>
      </footer>
    </article>
  )
}

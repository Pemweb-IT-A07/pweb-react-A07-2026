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
        <span className={`badge badge--${level} match-badge`} title="Skill Match">
          {match.score}% Match
        </span>
      </header>

      <p className="job-card__meta muted">
        <span>{job.candidate_required_location}</span>
        <span>{job.category}</span>
        {job.salary && <span>{job.salary}</span>}
      </p>

      {job.tags.length === 0 ? (
        <p className="muted">Lowongan tidak mencantumkan skill.</p>
      ) : (
        <ul className="chip-list">
          {match.matched.map((s) => (
            <li key={`ok-${s}`} className="chip chip--ok" title="Skill cocok">
              ✓ {s}
            </li>
          ))}
          {match.missing.map((s) => (
            <li key={`miss-${s}`} className="chip chip--missing" title="Skill belum dikuasai">
              {s}
            </li>
          ))}
        </ul>
      )}

      <footer className="job-card__footer">
        {job.url ? (
          <a href={job.url} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
            Lihat lowongan
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={isApplied}
          onClick={() => onSave(job)}
        >
          {isApplied ? 'Sudah Dilamar' : 'Simpan ke Wishlist'}
        </button>
      </footer>
    </article>
  )
}

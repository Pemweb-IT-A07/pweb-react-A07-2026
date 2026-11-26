import type { InterviewConflict } from '../types'
import { formatDateTime } from '../utils'

interface ConflictBannerProps {
  /** Hasil findInterviewConflicts dari SELURUH lamaran (bukan yang ter-filter) */
  conflicts: InterviewConflict[]
}

export function ConflictBanner({ conflicts }: ConflictBannerProps) {
  if (conflicts.length === 0) return null

  return (
    <div className="banner banner--danger" role="alert">
      <strong>⚠ Jadwal interview bentrok ({conflicts.length})</strong>
      <ul>
        {conflicts.map(({ a, b, diffMinutes }) => (
          <li key={`${a.id}-${b.id}`}>
            {a.company} ({formatDateTime(a.interviewDateTime)}) dan {b.company} (
            {formatDateTime(b.interviewDateTime)}) hanya berselisih {diffMinutes} menit.
          </li>
        ))}
      </ul>
    </div>
  )
}

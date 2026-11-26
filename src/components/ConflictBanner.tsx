import { CalendarClock, TriangleAlert } from 'lucide-react'
import type { InterviewConflict } from '../types'
import { formatDateTime } from '../utils'

interface ConflictBannerProps {
  /** Hasil findInterviewConflicts dari SELURUH lamaran (bukan yang ter-filter) */
  conflicts: InterviewConflict[]
  /** Buka detail lamaran langsung di editor jadwal interview */
  onReschedule: (applicationId: string) => void
}

/** Jadwal yang lebih akhir yang disarankan untuk diubah. */
function laterOf({ a, b }: InterviewConflict) {
  return (a.interviewDateTime ?? '') >= (b.interviewDateTime ?? '') ? a : b
}

export function ConflictBanner({ conflicts, onReschedule }: ConflictBannerProps) {
  if (conflicts.length === 0) return null

  return (
    <div className="banner banner--danger" role="alert">
      <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" />
      <div className="banner__body">
        <strong>
          {conflicts.length === 1 ? 'Jadwal interview bentrok' : `${conflicts.length} jadwal interview bentrok`}
        </strong>
        <ul>
          {conflicts.map((conflict) => {
            const { a, b, diffMinutes } = conflict
            const target = laterOf(conflict)
            return (
              <li key={`${a.id}-${b.id}`}>
                <span>
                  {a.company} ({formatDateTime(a.interviewDateTime)}) dan {b.company} (
                  {formatDateTime(b.interviewDateTime)}), selisih {diffMinutes} menit
                </span>
                <button
                  type="button"
                  className="btn btn--sm banner__action"
                  onClick={() => onReschedule(target.id)}
                  title={`Ubah jadwal interview ${target.company}`}
                >
                  <CalendarClock size={16} strokeWidth={1.5} aria-hidden="true" />
                  Ubah jadwal {target.company}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

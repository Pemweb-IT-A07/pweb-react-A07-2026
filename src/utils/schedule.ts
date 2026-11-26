import type { Application, InterviewConflict } from '../types'

export const CONFLICT_WINDOW_MINUTES = 60

/**
 * Cari pasangan lamaran INTERVIEW yang jadwalnya berselisih < 60 menit.
 * Wajib dipanggil dengan SELURUH data, bukan data yang ter-filter.
 */
export function findInterviewConflicts(applications: Application[]): InterviewConflict[] {
  const interviews = applications
    .filter((app) => app.status === 'INTERVIEW' && app.interviewDateTime)
    .map((app) => ({ app, time: new Date(app.interviewDateTime ?? '').getTime() }))
    .filter((item) => !Number.isNaN(item.time))

  const conflicts: InterviewConflict[] = []
  interviews.forEach((x, i) => {
    interviews.slice(i + 1).forEach((y) => {
      const diffMinutes = Math.abs(x.time - y.time) / 60000
      if (diffMinutes < CONFLICT_WINDOW_MINUTES) {
        conflicts.push({ a: x.app, b: y.app, diffMinutes: Math.round(diffMinutes) })
      }
    })
  })
  return conflicts
}

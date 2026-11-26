import type { Application } from '../types'

export const GHOSTING_THRESHOLD_DAYS = 14
export const DAY_MS = 24 * 60 * 60 * 1000

/** true jika status APPLIED/SCREENING dan lastUpdatedAt > 14 hari dari `now`. */
export function isGhostingRisk(app: Application, now: Date = new Date()): boolean {
  if (app.status !== 'APPLIED' && app.status !== 'SCREENING') return false
  const last = new Date(app.lastUpdatedAt).getTime()
  if (Number.isNaN(last)) return false
  return now.getTime() - last > GHOSTING_THRESHOLD_DAYS * DAY_MS
}

import type { Application } from '../types'

export const GHOSTING_THRESHOLD_DAYS = 14

/** true jika status APPLIED/SCREENING dan lastUpdatedAt > 14 hari dari `now`. */
export function isGhostingRisk(app: Application, now: Date = new Date()): boolean {
  // TODO [T1]: implementasi
  void app
  void now
  return false
}

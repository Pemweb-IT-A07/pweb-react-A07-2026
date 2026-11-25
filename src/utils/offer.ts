import type { Application, OfferScore, WorkMode } from '../types'

export const WORK_MODE_SCORE: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
}

/**
 * Skor offer berbobot:
 * total = (gaji ternormalisasi x 50%) + (skor mode kerja x 25%) + (skill match % x 25%)
 * Gaji ternormalisasi = salaryOffer / maxSalary * 100 (maxSalary = gaji tertinggi
 * di antara offer yang dibandingkan).
 */
export function calculateOfferScore(
  app: Application,
  maxSalary: number,
  userSkills: string[],
): OfferScore {
  // TODO [T1]: implementasi
  void app
  void maxSalary
  void userSkills
  return { salaryScore: 0, workModeScore: 0, skillScore: 0, total: 0 }
}

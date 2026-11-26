import type { Application, OfferScore, WorkMode } from '../types'
import { calculateSkillMatch } from './skillMatch'

export const WORK_MODE_SCORE: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
}

const round1 = (n: number) => Math.round(n * 10) / 10

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
  const salary = app.salaryOffer ?? 0
  const normalizedSalary = maxSalary > 0 ? (salary / maxSalary) * 100 : 0
  const salaryScore = round1(normalizedSalary * 0.5)
  const workModeScore = round1(WORK_MODE_SCORE[app.workMode] * 0.25)
  const skillScore = round1(calculateSkillMatch(userSkills, app.requiredSkills).score * 0.25)
  return {
    salaryScore,
    workModeScore,
    skillScore,
    total: round1(salaryScore + workModeScore + skillScore),
  }
}

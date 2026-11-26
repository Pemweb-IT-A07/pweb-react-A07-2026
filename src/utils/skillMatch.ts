import type { SkillMatchResult } from '../types'
import { normalizeText } from './text'

/**
 * Skill match case-insensitive.
 * score = Math.round((jumlahCocok / totalRequired) * 100)
 * Contoh: skill [React, TypeScript, CSS], required [React, TypeScript, CSS, Docker]
 * -> { score: 75, matched: [React, TypeScript, CSS], missing: [Docker] }
 */
export function calculateSkillMatch(
  userSkills: string[],
  requiredSkills: string[],
): SkillMatchResult {
  const owned = new Set(userSkills.map(normalizeText))
  const required = requiredSkills.filter((s) => s.trim() !== '')
  const matched = required.filter((s) => owned.has(normalizeText(s)))
  const missing = required.filter((s) => !owned.has(normalizeText(s)))
  const score = required.length === 0 ? 0 : Math.round((matched.length / required.length) * 100)
  return { score, matched, missing }
}

/** Warna badge Match: hijau >= 70, kuning 40–69, merah < 40. */
export function getMatchLevel(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

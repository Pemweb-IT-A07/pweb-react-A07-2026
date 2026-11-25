import type { SkillMatchResult } from '../types'

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
  // TODO [T1]: implementasi
  void userSkills
  return { score: 0, matched: [], missing: [...requiredSkills] }
}

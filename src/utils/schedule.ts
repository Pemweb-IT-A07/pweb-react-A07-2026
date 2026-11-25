import type { Application, InterviewConflict } from '../types'

export const CONFLICT_WINDOW_MINUTES = 60

/**
 * Cari pasangan lamaran INTERVIEW yang jadwalnya berselisih < 60 menit.
 * Wajib dipanggil dengan SELURUH data, bukan data yang ter-filter.
 */
export function findInterviewConflicts(applications: Application[]): InterviewConflict[] {
  // TODO [T1]: implementasi
  void applications
  return []
}

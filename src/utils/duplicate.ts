import type { Application } from '../types'

/**
 * true jika sudah ada lamaran dengan company + role sama (case-insensitive, trim).
 * `excludeId` untuk mengabaikan lamaran itu sendiri saat edit.
 */
export function isDuplicateApplication(
  applications: Application[],
  company: string,
  role: string,
  excludeId?: string,
): boolean {
  // TODO [T1]: implementasi
  void applications
  void company
  void role
  void excludeId
  return false
}

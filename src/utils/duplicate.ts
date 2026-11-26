import type { Application } from '../types'
import { normalizeText } from './text'

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
  const c = normalizeText(company)
  const r = normalizeText(role)
  return applications.some(
    (app) => app.id !== excludeId && normalizeText(app.company) === c && normalizeText(app.role) === r,
  )
}

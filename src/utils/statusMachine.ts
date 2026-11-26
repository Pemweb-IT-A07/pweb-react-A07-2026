import type {
  Application,
  ApplicationStatus,
  StatusTransitionPayload,
} from '../types'
import { createActivityLog } from './factory'

/**
 * Status tujuan yang sah dari tiap status.
 * OFFER & REJECTED final. GHOSTED boleh kembali ke SCREENING.
 */
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ['APPLIED'],
  APPLIED: ['SCREENING', 'REJECTED', 'GHOSTED'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'GHOSTED'],
  INTERVIEW: ['OFFER', 'REJECTED', 'GHOSTED'],
  OFFER: [],
  REJECTED: [],
  GHOSTED: ['SCREENING'],
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
}

/** Daftar status tujuan yang sah dari `from`. */
export function getAllowedTransitions(from: ApplicationStatus): ApplicationStatus[] {
  return STATUS_TRANSITIONS[from]
}

/** true jika `from` -> `to` sesuai diagram state machine. */
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to)
}

/**
 * Validasi syarat pindah status.
 * Return daftar pesan error; array kosong = valid.
 * - APPLIED: cvVersion & appliedDate
 * - INTERVIEW: interviewDateTime
 * - OFFER: salaryOffer > 0 & workMode
 */
export function validateTransition(
  app: Application,
  to: ApplicationStatus,
  payload: StatusTransitionPayload,
): string[] {
  if (!canTransition(app.status, to)) {
    return [`Status ${STATUS_LABEL[app.status]} tidak bisa pindah ke ${STATUS_LABEL[to]}`]
  }

  const errors: string[] = []
  if (to === 'APPLIED') {
    if (!(payload.cvVersion ?? '').trim()) errors.push('Versi CV wajib diisi')
    if (!payload.appliedDate) errors.push('Tanggal melamar wajib diisi')
  }
  if (to === 'INTERVIEW') {
    if (!payload.interviewDateTime) errors.push('Jadwal interview wajib diisi')
  }
  if (to === 'OFFER') {
    if (!payload.salaryOffer || payload.salaryOffer <= 0) errors.push('Nominal offer harus lebih dari 0')
    if (!payload.workMode) errors.push('Mode kerja wajib dipilih')
  }
  return errors
}

/**
 * Hasilkan lamaran BARU dengan status `to` (tanpa mutasi `app`):
 * field payload digabung, lastUpdatedAt diperbarui, dan activity log ditambah.
 * Panggil validateTransition dulu; fungsi ini tidak memvalidasi ulang.
 */
export function applyTransition(
  app: Application,
  to: ApplicationStatus,
  payload: StatusTransitionPayload,
  now: Date = new Date(),
): Application {
  const timestamp = now.toISOString()
  const definedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as StatusTransitionPayload
  return {
    ...app,
    ...definedPayload,
    status: to,
    lastUpdatedAt: timestamp,
    activityLogs: [
      ...app.activityLogs,
      createActivityLog(`Status: ${STATUS_LABEL[app.status]} → ${STATUS_LABEL[to]}`, timestamp),
    ],
  }
}

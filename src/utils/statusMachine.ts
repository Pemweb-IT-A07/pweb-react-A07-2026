import type {
  Application,
  ApplicationStatus,
  StatusTransitionPayload,
} from '../types'

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
  // TODO [T1]: implementasi
  void from
  return []
}

/** true jika `from` -> `to` sesuai diagram state machine. */
export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  // TODO [T1]: implementasi
  void from
  void to
  return false
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
  // TODO [T1]: implementasi
  void app
  void to
  void payload
  return []
}

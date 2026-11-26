import type { Application, ApplicationStatus } from '../types'
import { isGhostingRisk } from './ghosting'

export interface DashboardStats {
  total: number
  /** % lamaran terkirim yang mendapat respons (Screening / Interview / Offer / Rejected) */
  responseRate: number
  /** % lamaran terkirim yang sampai tahap Interview atau Offer */
  interviewRate: number
  ghostingRisk: number
  totalOffer: number
}

const RESPONDED: ApplicationStatus[] = ['SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED']
const INTERVIEWED: ApplicationStatus[] = ['INTERVIEW', 'OFFER']

const percent = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100))

/** Statistik dashboard, dihitung langsung dari `applications` (derived state). */
export function calculateStats(applications: Application[], now: Date = new Date()): DashboardStats {
  // Lamaran yang sudah benar-benar dikirim (bukan sekadar wishlist)
  const sent = applications.filter((app) => app.status !== 'WISHLIST')
  return {
    total: applications.length,
    responseRate: percent(sent.filter((app) => RESPONDED.includes(app.status)).length, sent.length),
    interviewRate: percent(sent.filter((app) => INTERVIEWED.includes(app.status)).length, sent.length),
    ghostingRisk: applications.filter((app) => isGhostingRisk(app, now)).length,
    totalOffer: applications.filter((app) => app.status === 'OFFER').length,
  }
}

/** Status lamaran. Transisi yang sah ada di src/utils/statusMachine.ts. */
export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'GHOSTED'

export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface ActivityLog {
  id: string
  /** ISO string */
  timestamp: string
  message: string
}

export interface Application {
  id: string
  company: string
  role: string
  workMode: WorkMode
  status: ApplicationStatus
  requiredSkills: string[]
  /** Wajib saat pindah ke APPLIED */
  cvVersion?: string
  /** Wajib saat pindah ke APPLIED (YYYY-MM-DD) */
  appliedDate?: string
  /** Wajib saat pindah ke INTERVIEW (YYYY-MM-DDTHH:mm) */
  interviewDateTime?: string
  /** Uang saku / gaji (Rp), wajib > 0 saat pindah ke OFFER */
  salaryOffer?: number
  /** ISO string, dasar hitung Rawan Ghosting */
  lastUpdatedAt: string
  /** ISO string */
  createdAt: string
  checklist: ChecklistItem[]
  activityLogs: ActivityLog[]
}

/** Data dari form / lowongan sebelum jadi Application (id, log, dll dibuat otomatis). */
export interface NewApplicationInput {
  company: string
  role: string
  workMode: WorkMode
  status: Extract<ApplicationStatus, 'WISHLIST' | 'APPLIED'>
  requiredSkills: string[]
  cvVersion?: string
  appliedDate?: string
  /** Pesan log pertama, default "Lamaran dibuat" */
  initialLogMessage?: string
}

/** Field tambahan yang diisi saat pindah status. */
export interface StatusTransitionPayload {
  cvVersion?: string
  appliedDate?: string
  interviewDateTime?: string
  salaryOffer?: number
  workMode?: WorkMode
}

/** 1 item lowongan, format Remotive API & public/magang-fallback.json */
export interface JobListing {
  id: number
  title: string
  company_name: string
  category: string
  candidate_required_location: string
  salary: string
  tags: string[]
  url?: string
  job_type?: string
  publication_date?: string
}

export interface RemotiveResponse {
  'job-count'?: number
  jobs: JobListing[]
}

export interface SkillMatchResult {
  /** 0–100 */
  score: number
  matched: string[]
  missing: string[]
}

export interface InterviewConflict {
  a: Application
  b: Application
  diffMinutes: number
}

export interface OfferScore {
  /** Skor gaji ternormalisasi x 50% (0–50) */
  salaryScore: number
  /** Skor mode kerja x 25% (0–25) */
  workModeScore: number
  /** Skill match % x 25% (0–25) */
  skillScore: number
  /** 0–100 */
  total: number
}

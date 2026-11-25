import type { ActivityLog, Application, ChecklistItem, NewApplicationInput } from '../types'

export function createId(): string {
  return crypto.randomUUID()
}

export function createActivityLog(message: string, timestamp: string = new Date().toISOString()): ActivityLog {
  return { id: createId(), timestamp, message }
}

export function createChecklistItem(text: string): ChecklistItem {
  return { id: createId(), text, done: false }
}

/** Buat Application baru lengkap dengan id, timestamp, checklist kosong, dan log pertama. */
export function createApplication(input: NewApplicationInput): Application {
  const now = new Date().toISOString()
  const { initialLogMessage, ...data } = input
  return {
    ...data,
    company: data.company.trim(),
    role: data.role.trim(),
    requiredSkills: data.requiredSkills.map((s) => s.trim()).filter((s) => s !== ''),
    createdAt: now,
    lastUpdatedAt: now,
    checklist: [],
    activityLogs: [createActivityLog(initialLogMessage ?? 'Lamaran dibuat', now)],
    id: createId(),
  }
}

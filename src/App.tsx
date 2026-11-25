import { useCallback } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Application, NewApplicationInput } from './types'
import { createApplication } from './utils'
import './App.css'

const DEFAULT_SKILLS = ['React', 'TypeScript', 'CSS']

function App() {
  // State utama, persisten di localStorage
  const [applications, setApplications] = useLocalStorage<Application[]>('amm:applications', [])
  const [kaptenSkills] = useLocalStorage<string[]>('amm:kaptenSkills', DEFAULT_SKILLS)

  /** Tambah lamaran baru (id, timestamp, log pertama dibuat otomatis). */
  const addApplication = useCallback(
    (input: NewApplicationInput): Application => {
      const created = createApplication(input)
      setApplications((prev) => [created, ...prev])
      return created
    },
    [setApplications],
  )

  /**
   * Update 1 lamaran secara immutable lewat fungsi updater.
   * Updater wajib return objek baru (spread), bukan mutasi `app`.
   */
  const updateApplication = useCallback(
    (id: string, updater: (app: Application) => Application) => {
      setApplications((prev) => prev.map((app) => (app.id === id ? updater(app) : app)))
    },
    [setApplications],
  )

  /** Hapus lamaran; return data yang dihapus (untuk Undo). */
  const deleteApplication = useCallback(
    (id: string): Application | undefined => {
      const removed = applications.find((app) => app.id === id)
      setApplications((prev) => prev.filter((app) => app.id !== id))
      return removed
    },
    [applications, setApplications],
  )

  // --- Placeholder sementara: diganti layout/tab dari task [T0] layout ---
  return (
    <main className="skeleton">
      <h1>Aku Mw Magang</h1>
      <p>
        Skill Kapten: {kaptenSkills.join(', ')} · Total lamaran: {applications.length}
      </p>

      <button
        type="button"
        onClick={() =>
          addApplication({
            company: `Contoh Corp ${applications.length + 1}`,
            role: 'Frontend Intern',
            workMode: 'Hybrid',
            status: 'WISHLIST',
            requiredSkills: ['React', 'TypeScript', 'Docker'],
          })
        }
      >
        + Tambah contoh
      </button>

      <ul>
        {applications.map((app) => (
          <li key={app.id}>
            <strong>{app.company}</strong> — {app.role} [{app.status}] · log: {app.activityLogs.length}
            <button
              type="button"
              onClick={() =>
                updateApplication(app.id, (a) => ({ ...a, lastUpdatedAt: new Date().toISOString() }))
              }
            >
              Sentuh
            </button>
            <button type="button" onClick={() => deleteApplication(app.id)}>
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App

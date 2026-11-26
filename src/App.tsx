import { useCallback, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Application, JobListing, NewApplicationInput } from './types'
import { inferWorkMode } from './services/jobService'
import { createApplication } from './utils'
import { Navbar } from './components/Navbar'
import type { TabKey } from './components/Navbar'
import { StatusBadge } from './components/StatusBadge'
import { ApplicationDetailModal } from './components/ApplicationDetailModal'
import { SkillProfile } from './components/SkillProfile'
import { JobExplorer } from './components/JobExplorer'

const DEFAULT_SKILLS = ['React', 'TypeScript', 'CSS']

function App() {
  // State utama, persisten di localStorage
  const [applications, setApplications] = useLocalStorage<Application[]>('amm:applications', [])
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>('amm:kaptenSkills', DEFAULT_SKILLS)

  const [activeTab, setActiveTab] = useState<TabKey>('explore')
  /** Hanya simpan id; objek lamaran diambil dari `applications` (derived) agar selalu terbaru. */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedApp = applications.find((app) => app.id === selectedId) ?? null
  const closeDetail = useCallback(() => setSelectedId(null), [])

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
  /** Simpan lowongan ke daftar lamaran sebagai WISHLIST (`tags` -> requiredSkills). */
  const saveJobToWishlist = useCallback(
    (job: JobListing) => {
      addApplication({
        company: job.company_name,
        role: job.title,
        workMode: inferWorkMode(job),
        status: 'WISHLIST',
        requiredSkills: job.tags,
        initialLogMessage: 'Disimpan ke Wishlist dari Eksplorasi Lowongan',
      })
    },
    [addApplication],
  )

  const deleteApplication = useCallback(
    (id: string): Application | undefined => {
      const removed = applications.find((app) => app.id === id)
      setApplications((prev) => prev.filter((app) => app.id !== id))
      return removed
    },
    [applications, setApplications],
  )

  return (
    <>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} applicationCount={applications.length} />

      <main className="app-main">
        {activeTab === 'explore' && (
          <>
            <section className="section-header">
              <h1>Eksplorasi Lowongan</h1>
            </section>
            <SkillProfile skills={kaptenSkills} onChange={setKaptenSkills} />
            <JobExplorer skills={kaptenSkills} applications={applications} onSaveJob={saveJobToWishlist} />
          </>
        )}

        {activeTab === 'pipeline' && (
          <>
            <section className="section-header">
              <h1>War Room Pipeline</h1>
              <button
                type="button"
                className="btn btn--primary"
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
            </section>
            {applications.length === 0 ? (
              <p className="empty">Belum ada lamaran.</p>
            ) : (
              applications.map((app) => (
                <article key={app.id} className="card section-header">
                  <div>
                    <h3>{app.company}</h3>
                    <p className="muted">{app.role}</p>
                  </div>
                  <StatusBadge status={app.status} />
                  <div>
                    <button type="button" className="btn btn--sm" onClick={() => setSelectedId(app.id)}>
                      Detail
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() =>
                        updateApplication(app.id, (a) => ({ ...a, lastUpdatedAt: new Date().toISOString() }))
                      }
                    >
                      Sentuh
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => deleteApplication(app.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              ))
            )}
          </>
        )}

        {activeTab === 'offer' && (
          <section className="section-header">
            <h1>Bandingkan Offer</h1>
          </section>
        )}
      </main>

      {selectedApp && <ApplicationDetailModal application={selectedApp} onClose={closeDetail} />}
    </>
  )
}

export default App

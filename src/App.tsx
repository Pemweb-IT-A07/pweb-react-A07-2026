import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useSlashFocus } from './hooks/useSlashFocus'
import type { Application, JobListing, NewApplicationInput } from './types'
import { inferWorkMode } from './services/jobService'
import { createActivityLog, createApplication, DAY_MS, findInterviewConflicts } from './utils'
import { Navbar } from './components/Navbar'
import type { TabKey } from './components/Navbar'
import { ApplicationDetailModal } from './components/ApplicationDetailModal'
import { SkillProfile } from './components/SkillProfile'
import { JobExplorer } from './components/JobExplorer'
import { ApplicationForm } from './components/ApplicationForm'
import { PipelineView } from './components/PipelineView'
import { ConflictBanner } from './components/ConflictBanner'
import { Toast } from './components/Toast'
import { StatsCards } from './components/StatsCards'
import { OfferComparator } from './components/OfferComparator'

const DEFAULT_SKILLS = ['React', 'TypeScript', 'CSS']
const UNDO_DURATION_MS = 5000

/** Lamaran yang baru dihapus + posisinya, untuk dikembalikan utuh saat Undo. */
interface DeletedEntry {
  application: Application
  index: number
}

function App() {
  // State utama, persisten di localStorage
  const [applications, setApplications] = useLocalStorage<Application[]>('amm:applications', [])
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>('amm:kaptenSkills', DEFAULT_SKILLS)

  const [activeTab, setActiveTab] = useState<TabKey>('explore')
  /** Form Tambah Lamaran dilipat secara default supaya daftar lamaran langsung terlihat */
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Bonus: dark mode (useLocalStorage) + shortcut "/" fokus ke search bar (useRef)
  const { theme, toggleTheme } = useTheme()
  const searchRef = useRef<HTMLInputElement>(null)
  useSlashFocus(searchRef)
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

  /** Mundurkan lastUpdatedAt 15 hari (untuk demo badge Rawan Ghosting). */
  const simulateGhosting = useCallback(
    (id: string) => {
      updateApplication(id, (app) => ({
        ...app,
        lastUpdatedAt: new Date(new Date(app.lastUpdatedAt).getTime() - 15 * DAY_MS).toISOString(),
        activityLogs: [...app.activityLogs, createActivityLog('Simulasi: lastUpdatedAt dimundurkan 15 hari')],
      }))
    },
    [updateApplication],
  )

  // Derived: bentrok dicek dari SELURUH lamaran, tidak terpengaruh filter
  const conflicts = useMemo(() => findInterviewConflicts(applications), [applications])

  // ---------- Undo Delete (5 detik) ----------
  const [lastDeleted, setLastDeleted] = useState<DeletedEntry | null>(null)
  /** ID setTimeout disimpan di useRef: tidak memicu render & bisa di-clear kapan saja. */
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current !== null) {
      clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
  }, [])

  // Bersihkan timer jika App unmount
  useEffect(() => clearUndoTimer, [clearUndoTimer])

  /** Hapus lamaran + tampilkan toast Undo selama 5 detik. */
  const deleteApplication = useCallback(
    (id: string) => {
      const index = applications.findIndex((app) => app.id === id)
      if (index === -1) return

      // Hapus 2x berturut-turut < 5 detik -> timer lama dibersihkan dulu
      clearUndoTimer()
      setApplications((prev) => prev.filter((app) => app.id !== id))
      setLastDeleted({ application: applications[index], index })
      undoTimerRef.current = setTimeout(() => {
        setLastDeleted(null)
        undoTimerRef.current = null
      }, UNDO_DURATION_MS)
    },
    [applications, setApplications, clearUndoTimer],
  )

  /** Kembalikan lamaran terakhir yang dihapus (lengkap dengan checklist & log) ke posisi semula. */
  const undoDelete = useCallback(() => {
    if (!lastDeleted) return
    clearUndoTimer()
    const { application, index } = lastDeleted
    setApplications((prev) =>
      prev.some((app) => app.id === application.id)
        ? prev
        : [...prev.slice(0, index), application, ...prev.slice(index)],
    )
    setLastDeleted(null)
  }, [lastDeleted, setApplications, clearUndoTimer])

  const dismissToast = useCallback(() => {
    clearUndoTimer()
    setLastDeleted(null)
  }, [clearUndoTimer])

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        applicationCount={applications.length}
        isDark={theme === 'dark'}
        onToggleTheme={toggleTheme}
      />

      <main className="app-main">
        <ConflictBanner conflicts={conflicts} />

        {activeTab === 'explore' && (
          <>
            <section className="section-header">
              <h1>Eksplorasi Lowongan</h1>
            </section>
            <SkillProfile skills={kaptenSkills} onChange={setKaptenSkills} />
            <JobExplorer
              searchRef={searchRef}
              skills={kaptenSkills}
              applications={applications}
              onSaveJob={saveJobToWishlist}
            />
          </>
        )}

        {activeTab === 'pipeline' && (
          <>
            <section className="section-header">
              <h1>War Room Lamaran</h1>
              <button
                type="button"
                className={`btn ${isFormOpen ? '' : 'btn--primary'}`}
                aria-expanded={isFormOpen}
                onClick={() => setIsFormOpen((open) => !open)}
              >
                {isFormOpen ? <X size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
                {isFormOpen ? 'Tutup form' : 'Tambah lamaran'}
              </button>
            </section>
            <StatsCards applications={applications} />
            {isFormOpen && <ApplicationForm applications={applications} onSubmit={addApplication} />}
            <PipelineView
              searchRef={searchRef}
              applications={applications}
              skills={kaptenSkills}
              onOpen={setSelectedId}
              onSimulate={simulateGhosting}
              onDelete={deleteApplication}
            />
          </>
        )}

        {activeTab === 'offer' && (
          <>
            <section className="section-header">
              <h1>Statistik & Offer</h1>
            </section>
            <StatsCards applications={applications} />
            <OfferComparator applications={applications} skills={kaptenSkills} />
          </>
        )}
      </main>

      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          onClose={closeDetail}
          onUpdate={(updater) => updateApplication(selectedApp.id, updater)}
        />
      )}

      {lastDeleted && (
        <Toast
          // key baru tiap penghapusan -> progress bar mulai ulang dari penuh
          key={lastDeleted.application.id}
          message={`Lamaran ${lastDeleted.application.company} dihapus`}
          actionLabel="Undo"
          onAction={undoDelete}
          onClose={dismissToast}
          duration={UNDO_DURATION_MS}
        />
      )}
    </>
  )
}

export default App

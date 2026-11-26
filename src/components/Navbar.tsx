import { Moon, Sun } from 'lucide-react'

export type TabKey = 'explore' | 'pipeline' | 'offer'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'explore', label: 'Eksplorasi' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'offer', label: 'Bandingkan Offer' },
]

interface NavbarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  /** Jumlah lamaran, ditampilkan sebagai badge di tab Pipeline */
  applicationCount: number
  isDark: boolean
  onToggleTheme: () => void
}

export function Navbar({ activeTab, onTabChange, applicationCount, isDark, onToggleTheme }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            AMM
          </span>
          <span className="navbar__title">Aku Mw Magang</span>
        </div>

        <div className="navbar__right">
        <nav className="navbar__tabs" role="tablist" aria-label="Menu utama">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`navbar__tab ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
              {tab.key === 'pipeline' && applicationCount > 0 && (
                <span className="navbar__count">{applicationCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="btn btn--ghost btn--icon"
          onClick={onToggleTheme}
          aria-pressed={isDark}
          aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          title={isDark ? 'Mode terang' : 'Mode gelap'}
        >
          {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
        </div>
      </div>
    </header>
  )
}

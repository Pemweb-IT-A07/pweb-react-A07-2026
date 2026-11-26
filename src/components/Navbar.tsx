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
}

export function Navbar({ activeTab, onTabChange, applicationCount }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            AMM
          </span>
          <span className="navbar__title">Aku Mw Magang</span>
        </div>

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
      </div>
    </header>
  )
}

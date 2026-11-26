import { useMemo } from 'react'
import { useNow } from '../hooks/useNow'
import type { Application } from '../types'
import { calculateStats } from '../utils'

interface StatsCardsProps {
  applications: Application[]
}

/** 5 kartu statistik. Semua angka derived dari `applications`, tidak disimpan di state terpisah. */
export function StatsCards({ applications }: StatsCardsProps) {
  const now = useNow()
  const stats = useMemo(() => calculateStats(applications, now), [applications, now])

  const cards = [
    { label: 'Total Lamaran', value: String(stats.total), tone: '' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, tone: '' },
    { label: 'Interview Rate', value: `${stats.interviewRate}%`, tone: '' },
    { label: 'Rawan Ghosting', value: String(stats.ghostingRisk), tone: stats.ghostingRisk > 0 ? 'danger' : '' },
    { label: 'Total Offer', value: String(stats.totalOffer), tone: stats.totalOffer > 0 ? 'success' : '' },
  ]

  return (
    <section className="stats" aria-label="Statistik lamaran">
      {cards.map((card) => (
        <div key={card.label} className={`card stat ${card.tone ? `stat--${card.tone}` : ''}`}>
          <span className="stat__label">{card.label}</span>
          <strong className="stat__value">{card.value}</strong>
        </div>
      ))}
    </section>
  )
}

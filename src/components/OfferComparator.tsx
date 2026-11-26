import { useState } from 'react'
import type { Application, OfferScore } from '../types'
import { calculateOfferScore, calculateSkillMatch, formatRupiah, WORK_MODE_SCORE } from '../utils'

interface OfferComparatorProps {
  applications: Application[]
  skills: string[]
}

interface Side {
  app: Application
  skill: number
  score: OfferScore
}

export function OfferComparator({ applications, skills }: OfferComparatorProps) {
  const offers = applications.filter((app) => app.status === 'OFFER')
  const [pickA, setPickA] = useState<string>('')
  const [pickB, setPickB] = useState<string>('')

  if (offers.length < 2) {
    return (
      <section className="card comparator">
        <h2>Offer Comparator</h2>
        <p className="empty">
          Butuh minimal <strong>2 lamaran berstatus Offer</strong> untuk dibandingkan. Saat ini ada{' '}
          {offers.length} offer. Pindahkan lamaran ke status Offer dari Detail Lamaran di tab Pipeline.
        </p>
      </section>
    )
  }

  // Derived: pilihan yang tidak valid (terhapus / bukan offer lagi) jatuh ke default
  const idA = offers.some((o) => o.id === pickA) ? pickA : offers[0].id
  const idB = offers.some((o) => o.id === pickB) && pickB !== idA ? pickB : (offers.find((o) => o.id !== idA)?.id ?? '')
  const appA = offers.find((o) => o.id === idA)
  const appB = offers.find((o) => o.id === idB)
  if (!appA || !appB) return null

  // Normalisasi gaji terhadap gaji tertinggi dari 2 offer yang dibandingkan
  const maxSalary = Math.max(appA.salaryOffer ?? 0, appB.salaryOffer ?? 0)
  const toSide = (app: Application): Side => ({
    app,
    skill: calculateSkillMatch(skills, app.requiredSkills).score,
    score: calculateOfferScore(app, maxSalary, skills),
  })
  const a = toSide(appA)
  const b = toSide(appB)
  const winner = a.score.total === b.score.total ? null : a.score.total > b.score.total ? a.app.id : b.app.id

  const rows: { label: string; render: (s: Side) => string }[] = [
    { label: 'Gaji / Uang Saku', render: (s) => formatRupiah(s.app.salaryOffer) },
    { label: 'Mode Kerja', render: (s) => `${s.app.workMode} (${WORK_MODE_SCORE[s.app.workMode]})` },
    { label: 'Skill Match', render: (s) => `${s.skill}%` },
    { label: 'Skor Gaji (50%)', render: (s) => s.score.salaryScore.toFixed(1) },
    { label: 'Skor Mode (25%)', render: (s) => s.score.workModeScore.toFixed(1) },
    { label: 'Skor Skill (25%)', render: (s) => s.score.skillScore.toFixed(1) },
  ]

  const picker = (value: string, onChange: (id: string) => void, exclude: string, label: string) => (
    <label className="field">
      <span>{label}</span>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {offers.map((o) => (
          <option key={o.id} value={o.id} disabled={o.id === exclude}>
            {o.company} — {o.role}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <section className="card comparator">
      <h2>Offer Comparator</h2>
      <div className="form-grid">
        {picker(idA, setPickA, idB, 'Offer A')}
        {picker(idB, setPickB, idA, 'Offer B')}
      </div>

      <div className="table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">Kriteria</th>
              {[a, b].map((s) => (
                <th key={s.app.id} scope="col" className={winner === s.app.id ? 'is-winner' : ''}>
                  {s.app.company}
                  <span className="muted"> · {s.app.role}</span>
                  {winner === s.app.id && <span className="badge badge--green">Rekomendasi Terbaik</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td className={winner === a.app.id ? 'is-winner' : ''}>{row.render(a)}</td>
                <td className={winner === b.app.id ? 'is-winner' : ''}>{row.render(b)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total Skor</th>
              <td className={winner === a.app.id ? 'is-winner' : ''}>
                <strong>{a.score.total.toFixed(1)}</strong>
              </td>
              <td className={winner === b.app.id ? 'is-winner' : ''}>
                <strong>{b.score.total.toFixed(1)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="muted comparator__note">
        Total = (gaji ternormalisasi × 50%) + (skor mode × 25%) + (skill match × 25%). Gaji dinormalisasi
        terhadap gaji tertinggi di antara 2 offer. Mode: Remote 100, Hybrid 75, Onsite 50.
        {winner === null && ' Kedua offer memiliki skor sama.'}
      </p>
    </section>
  )
}

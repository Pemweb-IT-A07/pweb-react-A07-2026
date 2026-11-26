import { useState } from 'react'
import type { FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { Application, ApplicationUpdater } from '../types'
import { createChecklistItem } from '../utils'

interface ChecklistPanelProps {
  application: Application
  onUpdate: (updater: ApplicationUpdater) => void
}

/**
 * Nested checklist di dalam 1 lamaran.
 * Semua update immutable: spread lamaran + array baru (map / filter / spread), tanpa push / mutasi.
 */
export function ChecklistPanel({ application, onUpdate }: ChecklistPanelProps) {
  const [text, setText] = useState('')
  const { checklist } = application
  const done = checklist.filter((item) => item.done).length
  const percent = checklist.length === 0 ? 0 : Math.round((done / checklist.length) * 100)

  const addItem = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    const item = createChecklistItem(value)
    onUpdate((app) => ({ ...app, checklist: [...app.checklist, item] }))
    setText('')
  }

  const toggleItem = (itemId: string) => {
    onUpdate((app) => ({
      ...app,
      checklist: app.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
    }))
  }

  const removeItem = (itemId: string) => {
    onUpdate((app) => ({ ...app, checklist: app.checklist.filter((item) => item.id !== itemId) }))
  }

  return (
    <section className="panel">
      <div className="progress">
        <div className="progress__label">
          <span>Progress persiapan</span>
          <span>
            {done}/{checklist.length} selesai ({percent}%)
          </span>
        </div>
        <div className="progress__track">
          <div className="progress__bar" style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      </div>

      <form className="inline-form" onSubmit={addItem}>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Misal: Riset produk perusahaan"
          aria-label="Item checklist baru"
        />
        <button type="submit" className="btn btn--primary" disabled={!text.trim()}>
          Tambah
        </button>
      </form>

      {checklist.length === 0 ? (
        <p className="empty">Belum ada item checklist.</p>
      ) : (
        <ul className="checklist">
          {checklist.map((item) => (
            <li key={item.id} className={item.done ? 'is-done' : ''}>
              <label>
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} />
                <span>{item.text}</span>
              </label>
              <button
                type="button"
                className="btn btn--sm btn--ghost btn--icon btn--danger"
                aria-label={`Hapus ${item.text}`}
                title="Hapus"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

import { useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { normalizeText } from '../utils'

interface SkillProfileProps {
  skills: string[]
  onChange: (skills: string[]) => void
}

/** Profil Skill Kapten: tambah & hapus skill, tolak duplikat (case-insensitive). */
export function SkillProfile({ skills, onChange }: SkillProfileProps) {
  const [newSkill, setNewSkill] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const skill = newSkill.trim()
    if (!skill) {
      setError('Nama skill tidak boleh kosong')
      return
    }
    if (skills.some((s) => normalizeText(s) === normalizeText(skill))) {
      setError(`Skill "${skill}" sudah ada`)
      return
    }
    onChange([...skills, skill])
    setNewSkill('')
    setError(null)
  }

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <section className="card skill-profile">
      <div className="section-header">
        <h2>Profil Skill Kapten</h2>
        <span className="muted">{skills.length} skill</span>
      </div>

      <ul className="chip-list">
        {skills.length === 0 && <li className="muted">Belum ada skill. Tambahkan minimal satu.</li>}
        {skills.map((skill) => (
          <li key={skill} className="chip chip--removable">
            {skill}
            <button type="button" aria-label={`Hapus ${skill}`} onClick={() => removeSkill(skill)}>
              <X size={12} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          className={`input ${error ? 'is-invalid' : ''}`}
          value={newSkill}
          onChange={(e) => {
            setNewSkill(e.target.value)
            setError(null)
          }}
          placeholder="Tambah skill, misal Docker"
          aria-label="Skill baru"
        />
        <button type="submit" className="btn btn--primary">
          Tambah
        </button>
      </form>
      {error && <p className="field__error">{error}</p>}
    </section>
  )
}

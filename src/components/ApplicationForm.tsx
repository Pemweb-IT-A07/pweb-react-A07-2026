import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Application, NewApplicationInput, WorkMode } from '../types'
import { Check } from 'lucide-react'
import { isDuplicateApplication } from '../utils'

type InitialStatus = NewApplicationInput['status']

interface FormValues {
  company: string
  role: string
  workMode: WorkMode
  status: InitialStatus
  skills: string
  cvVersion: string
  appliedDate: string
}

type FieldName = keyof FormValues
type FormErrors = Partial<Record<FieldName, string>>

const INITIAL_VALUES: FormValues = {
  company: '',
  role: '',
  workMode: 'Remote',
  status: 'WISHLIST',
  skills: '',
  cvVersion: '',
  appliedDate: '',
}

/** Urutan field di form, dipakai untuk mencari input error PERTAMA. */
const FIELD_ORDER: FieldName[] = ['company', 'role', 'workMode', 'status', 'skills', 'cvVersion', 'appliedDate']

interface ApplicationFormProps {
  applications: Application[]
  onSubmit: (input: NewApplicationInput) => void
}

function parseSkills(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
}

function validate(values: FormValues, applications: Application[]): FormErrors {
  const errors: FormErrors = {}
  if (!values.company.trim()) errors.company = 'Nama perusahaan wajib diisi'
  if (!values.role.trim()) errors.role = 'Posisi / role wajib diisi'
  if (
    !errors.company &&
    !errors.role &&
    isDuplicateApplication(applications, values.company, values.role)
  ) {
    errors.company = `Lamaran ${values.company.trim()} — ${values.role.trim()} sudah ada`
  }
  if (parseSkills(values.skills).length === 0) errors.skills = 'Isi minimal 1 skill (pisahkan dengan koma)'
  if (values.status === 'APPLIED') {
    if (!values.cvVersion.trim()) errors.cvVersion = 'Versi CV wajib diisi untuk status Applied'
    if (!values.appliedDate) errors.appliedDate = 'Tanggal melamar wajib diisi untuk status Applied'
  }
  return errors
}

/** Form terkontrol Tambah Lamaran Manual. Gagal submit -> fokus ke input error pertama (useRef). */
export function ApplicationForm({ applications, onSubmit }: ApplicationFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState<string | null>(null)

  const companyRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLInputElement>(null)
  const workModeRef = useRef<HTMLSelectElement>(null)
  const statusRef = useRef<HTMLSelectElement>(null)
  const skillsRef = useRef<HTMLInputElement>(null)
  const cvVersionRef = useRef<HTMLInputElement>(null)
  const appliedDateRef = useRef<HTMLInputElement>(null)

  // Form baru dibuka -> langsung fokus ke input pertama
  useEffect(() => {
    companyRef.current?.focus()
  }, [])

  const fieldRefs = {
    company: companyRef,
    role: roleRef,
    workMode: workModeRef,
    status: statusRef,
    skills: skillsRef,
    cvVersion: cvVersionRef,
    appliedDate: appliedDateRef,
  }

  const setField = <K extends FieldName>(name: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSuccess(null)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validate(values, applications)
    setErrors(nextErrors)

    const firstError = FIELD_ORDER.find((name) => nextErrors[name])
    if (firstError) {
      fieldRefs[firstError].current?.focus()
      return
    }

    const isApplied = values.status === 'APPLIED'
    onSubmit({
      company: values.company.trim(),
      role: values.role.trim(),
      workMode: values.workMode,
      status: values.status,
      requiredSkills: parseSkills(values.skills),
      cvVersion: isApplied ? values.cvVersion.trim() : undefined,
      appliedDate: isApplied ? values.appliedDate : undefined,
      initialLogMessage: isApplied ? 'Lamaran dibuat (Applied) dari form manual' : 'Lamaran dibuat dari form manual',
    })
    setSuccess(`${values.company.trim()} — ${values.role.trim()} ditambahkan`)
    setValues(INITIAL_VALUES)
    companyRef.current?.focus()
  }

  const inputClass = (name: FieldName, base = 'input') => `${base} ${errors[name] ? 'is-invalid' : ''}`

  return (
    <form className="card app-form" onSubmit={handleSubmit} noValidate>
      <h2>Tambah lamaran manual</h2>

      <div className="form-grid">
        <label className="field">
          <span>Perusahaan</span>
          <input
            ref={companyRef}
            className={inputClass('company')}
            value={values.company}
            onChange={(e) => setField('company', e.target.value)}
            placeholder="Nusantara Cloud"
            aria-invalid={Boolean(errors.company)}
          />
          {errors.company && <small className="field__error">{errors.company}</small>}
        </label>

        <label className="field">
          <span>Posisi / Role</span>
          <input
            ref={roleRef}
            className={inputClass('role')}
            value={values.role}
            onChange={(e) => setField('role', e.target.value)}
            placeholder="Frontend Intern"
            aria-invalid={Boolean(errors.role)}
          />
          {errors.role && <small className="field__error">{errors.role}</small>}
        </label>

        <label className="field">
          <span>Mode Kerja</span>
          <select
            ref={workModeRef}
            className={inputClass('workMode', 'select')}
            value={values.workMode}
            onChange={(e) => setField('workMode', e.target.value as WorkMode)}
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </label>

        <label className="field">
          <span>Status Awal</span>
          <select
            ref={statusRef}
            className={inputClass('status', 'select')}
            value={values.status}
            onChange={(e) => setField('status', e.target.value as InitialStatus)}
          >
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
          </select>
        </label>

        <label className="field form-grid__full">
          <span>Required Skills (pisahkan dengan koma)</span>
          <input
            ref={skillsRef}
            className={inputClass('skills')}
            value={values.skills}
            onChange={(e) => setField('skills', e.target.value)}
            placeholder="React, TypeScript, CSS"
            aria-invalid={Boolean(errors.skills)}
          />
          {errors.skills && <small className="field__error">{errors.skills}</small>}
        </label>

        {values.status === 'APPLIED' && (
          <>
            <label className="field">
              <span>Versi CV</span>
              <input
                ref={cvVersionRef}
                className={inputClass('cvVersion')}
                value={values.cvVersion}
                onChange={(e) => setField('cvVersion', e.target.value)}
                placeholder="CV-v3-frontend"
                aria-invalid={Boolean(errors.cvVersion)}
              />
              {errors.cvVersion && <small className="field__error">{errors.cvVersion}</small>}
            </label>
            <label className="field">
              <span>Tanggal Melamar</span>
              <input
                ref={appliedDateRef}
                type="date"
                className={inputClass('appliedDate')}
                value={values.appliedDate}
                onChange={(e) => setField('appliedDate', e.target.value)}
                aria-invalid={Boolean(errors.appliedDate)}
              />
              {errors.appliedDate && <small className="field__error">{errors.appliedDate}</small>}
            </label>
          </>
        )}
      </div>

      <div className="app-form__footer">
        {success && (
          <span className="form-success">
            <Check size={16} strokeWidth={1.5} aria-hidden="true" />
            {success}
          </span>
        )}
        <button type="submit" className="btn btn--primary">
          Tambah Lamaran
        </button>
      </div>
    </form>
  )
}

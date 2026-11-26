import type { JobListing, RemotiveResponse } from '../types'

export const REMOTIVE_URL = 'https://remotive.com/api/remote-jobs?category=software-dev&limit=30'
export const FALLBACK_URL = '/magang-fallback.json'

export type JobSource = 'remote' | 'local'

/** Ambil JSON lowongan dari `url`. Melempar Error jika HTTP gagal / format tidak sesuai. */
async function fetchJobsFrom(url: string, signal?: AbortSignal): Promise<JobListing[]> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    throw new Error(`Gagal memuat lowongan (HTTP ${res.status})`)
  }
  const data: unknown = await res.json()
  return normalizeJobs(data)
}

/** Pastikan bentuk data sesuai JobListing; `tags` dipakai sebagai requiredSkills. */
function normalizeJobs(data: unknown): JobListing[] {
  const list: unknown = Array.isArray(data) ? data : (data as Partial<RemotiveResponse> | null)?.jobs
  if (!Array.isArray(list)) {
    throw new Error('Format data lowongan tidak dikenali')
  }
  return (list as Partial<JobListing>[]).map((job) => ({
    id: Number(job.id),
    title: job.title ?? '(Tanpa judul)',
    company_name: job.company_name ?? '(Tanpa nama)',
    category: job.category ?? 'Lainnya',
    candidate_required_location: job.candidate_required_location ?? '-',
    salary: job.salary ?? '',
    tags: Array.isArray(job.tags) ? job.tags.filter((t): t is string => typeof t === 'string') : [],
    url: job.url,
    job_type: job.job_type,
    publication_date: job.publication_date,
  }))
}

/** Lowongan dari Remotive API (live). */
export function fetchRemoteJobs(signal?: AbortSignal): Promise<JobListing[]> {
  return fetchJobsFrom(REMOTIVE_URL, signal)
}

/** Lowongan dari public/magang-fallback.json (lokal). */
export function fetchLocalJobs(signal?: AbortSignal): Promise<JobListing[]> {
  return fetchJobsFrom(FALLBACK_URL, signal)
}

/** Ambil lowongan sesuai sumber yang dipilih. */
export function fetchJobs(source: JobSource, signal?: AbortSignal): Promise<JobListing[]> {
  return source === 'remote' ? fetchRemoteJobs(signal) : fetchLocalJobs(signal)
}

/** Required skill sebuah lowongan = field `tags`. */
export function getRequiredSkills(job: JobListing): string[] {
  return job.tags
}

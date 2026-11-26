/** "2026-12-01T10:00" -> "1 Des 2026, 10.00" (locale id-ID). */
export function formatDateTime(value?: string): string {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

/** 4500000 -> "Rp 4.500.000" */
export function formatRupiah(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return '-'
  return `Rp ${value.toLocaleString('id-ID')}`
}

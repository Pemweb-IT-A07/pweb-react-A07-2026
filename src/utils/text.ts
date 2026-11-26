/** Normalisasi teks untuk perbandingan case-insensitive. */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

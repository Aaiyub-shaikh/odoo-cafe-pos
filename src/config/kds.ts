/** Full URL to the kitchen display (separate localhost in dev). */
export const KDS_URL = import.meta.env.VITE_KDS_URL ?? 'http://localhost:5174/kds'

export const KDS_BASE_URL = KDS_URL.replace(/\/kds\/?$/, '')

export function isKdsStandalonePort(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const expected = new URL(KDS_BASE_URL)
    return window.location.port === expected.port
  } catch {
    return window.location.port === '5174'
  }
}

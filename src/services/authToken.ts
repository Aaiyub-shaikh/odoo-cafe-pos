let token: string | null = null

export function getAuthToken(): string | null {
  return token
}

export function setAuthToken(value: string | null): void {
  token = value
}

/** Read token from zustand persist storage (used before store hydrates). */
export function getPersistedToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-storage')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed.state?.token ?? null
  } catch {
    return null
  }
}

export function resolveAuthToken(): string | null {
  return getAuthToken() ?? getPersistedToken()
}

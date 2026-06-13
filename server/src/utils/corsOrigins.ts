const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']

export function getAllowedOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGIN
  const extra = fromEnv ? fromEnv.split(',').map((o) => o.trim()) : []
  return [...new Set([...DEFAULT_ORIGINS, ...extra])]
}

export function serialize<T extends Record<string, unknown>>(doc: unknown): T {
  if (!doc || typeof doc !== 'object') return doc as T
  const obj = (doc as { toObject?: () => Record<string, unknown> }).toObject
    ? (doc as { toObject: () => Record<string, unknown> }).toObject()
    : { ...(doc as Record<string, unknown>) }

  if (obj._id) {
    obj.id = String(obj._id)
    delete obj._id
  }
  delete obj.__v
  delete obj.password

  return obj as T
}

export function serializeMany<T extends Record<string, unknown>>(docs: unknown[]): T[] {
  return docs.map((d) => serialize<T>(d))
}

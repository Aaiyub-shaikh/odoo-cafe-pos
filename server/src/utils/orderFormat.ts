import { serialize } from './serialize.js'

export function formatOrder(doc: Record<string, unknown>) {
  const obj = serialize<Record<string, unknown>>(doc)
  obj.customerId = obj.customerId ? String(obj.customerId) : undefined
  obj.employeeId = String(obj.employeeId)
  obj.sessionId = obj.sessionId ? String(obj.sessionId) : undefined
  obj.createdAt = (doc.createdAt as Date)?.toISOString?.() ?? obj.createdAt
  obj.updatedAt = (doc.updatedAt as Date)?.toISOString?.() ?? obj.updatedAt
  if (Array.isArray(obj.items)) {
    obj.items = (obj.items as Record<string, unknown>[]).map((item) => ({
      ...item,
      id: item.id || item._id,
    }))
  }
  return obj
}

import { api, ApiError } from './api'

export interface DemoPaymentResult {
  success: boolean
  transactionId: string
  amount: number
  method: string
}

function localDemoResult(amount: number, method: string): DemoPaymentResult {
  return {
    success: true,
    transactionId: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    amount,
    method,
  }
}

export async function processDemoPayment(amount: number, method = 'card'): Promise<DemoPaymentResult> {
  try {
    return await api<DemoPaymentResult>('/payments/demo/process', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) throw err
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return localDemoResult(amount, method)
  }
}

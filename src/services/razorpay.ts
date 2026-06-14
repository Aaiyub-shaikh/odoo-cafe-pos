import { APP_SHORT_NAME } from '@/config/brand'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance
  }
}

export interface RazorpayCheckoutOptions {
  key: string
  amount?: number
  currency?: string
  name?: string
  description?: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayInstance {
  open: () => void
  on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(script)
  })

  return scriptPromise
}

export interface OpenRazorpayCheckoutParams {
  keyId: string
  orderId: string
  amount: number
  currency?: string
  name?: string
  description?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export function openRazorpayCheckout(params: OpenRazorpayCheckoutParams): Promise<RazorpaySuccessResponse> {
  return loadRazorpayScript().then(
    () =>
      new Promise((resolve, reject) => {
        const options: RazorpayCheckoutOptions = {
          key: params.keyId,
          amount: Math.round(params.amount * 100),
          currency: params.currency || 'INR',
          name: params.name || APP_SHORT_NAME,
          description: params.description || 'Order payment',
          order_id: params.orderId,
          prefill: {
            name: params.customerName,
            email: params.customerEmail,
            contact: params.customerPhone,
          },
          theme: { color: '#DA291C' },
          handler: (response) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response) => {
          reject(new Error(response.error?.description || 'Payment failed'))
        })
        rzp.open()
      })
  )
}

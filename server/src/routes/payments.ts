import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import { getPaymentSettings, resolveRazorpayCredentials, PaymentSettings } from '../models/PaymentSettings.js'

const router = Router()

async function getRazorpayInstance() {
  const settings = await getPaymentSettings()
  const { keyId, keySecret, enabled } = resolveRazorpayCredentials(settings)
  if (!enabled || !keyId || !keySecret) {
    return null
  }
  return {
    instance: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keyId,
    keySecret,
  }
}

router.get('/razorpay/settings', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const settings = await getPaymentSettings()
    res.json({
      razorpayEnabled: settings.razorpayEnabled,
      razorpayKeyId: settings.razorpayKeyId,
      hasSecret: !!(settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.put('/razorpay/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { razorpayEnabled, razorpayKeyId, razorpayKeySecret } = req.body
    const update: Record<string, unknown> = {}

    if (razorpayEnabled !== undefined) update.razorpayEnabled = !!razorpayEnabled
    if (razorpayKeyId !== undefined) update.razorpayKeyId = String(razorpayKeyId).trim()
    if (razorpayKeySecret !== undefined && String(razorpayKeySecret).trim()) {
      update.razorpayKeySecret = String(razorpayKeySecret).trim()
    }

    const settings = await PaymentSettings.findOneAndUpdate({ key: 'default' }, update, {
      new: true,
      upsert: true,
    })

    res.json({
      razorpayEnabled: settings!.razorpayEnabled,
      razorpayKeyId: settings!.razorpayKeyId,
      hasSecret: !!settings!.razorpayKeySecret,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.get('/razorpay/config', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const settings = await getPaymentSettings()
    const { keyId, enabled } = resolveRazorpayCredentials(settings)
    if (!enabled) {
      return res.json({ enabled: false, keyId: '' })
    }
    res.json({ enabled: true, keyId })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/razorpay/create-order', authMiddleware, async (req: Request, res: Response) => {
  try {
    const razorpay = await getRazorpayInstance()
    if (!razorpay) {
      return res.status(400).json({ error: 'Razorpay is not configured or enabled' })
    }

    const amount = Number(req.body.amount)
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' })
    }

    const amountPaise = Math.round(amount * 100)
    const order = await razorpay.instance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: req.body.receipt || `rcpt_${Date.now()}`,
      notes: req.body.notes || {},
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpay.keyId,
    })
  } catch (err) {
    console.error('Razorpay create order error:', err)
    res.status(500).json({ error: 'Failed to create Razorpay order' })
  }
})

router.post('/razorpay/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const razorpay = await getRazorpayInstance()
    if (!razorpay) {
      return res.status(400).json({ error: 'Razorpay is not configured or enabled' })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto.createHmac('sha256', razorpay.keySecret).update(body).digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    res.json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

router.post('/demo/process', authMiddleware, async (req: Request, res: Response) => {
  try {
    const amount = Number(req.body.amount)
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' })
    }

    const method = String(req.body.method || 'card')
    await new Promise((resolve) => setTimeout(resolve, 1200))

    res.json({
      success: true,
      transactionId: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      amount,
      method,
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router

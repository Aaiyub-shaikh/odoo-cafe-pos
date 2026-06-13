import mongoose, { Schema } from 'mongoose'

const paymentSettingsSchema = new Schema(
  {
    key: { type: String, default: 'default', unique: true },
    razorpayEnabled: { type: Boolean, default: false },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
  },
  { timestamps: true }
)

export const PaymentSettings = mongoose.model('PaymentSettings', paymentSettingsSchema)

export async function getPaymentSettings() {
  let settings = await PaymentSettings.findOne({ key: 'default' })
  if (!settings) {
    settings = await PaymentSettings.create({
      key: 'default',
      razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
    })
  }
  return settings
}

export function resolveRazorpayCredentials(settings: InstanceType<typeof PaymentSettings>) {
  const keyId = settings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || ''
  const keySecret = settings.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || ''
  return {
    keyId,
    keySecret,
    enabled: settings.razorpayEnabled && !!keyId && !!keySecret,
  }
}

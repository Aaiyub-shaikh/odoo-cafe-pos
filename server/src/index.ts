import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import productRoutes from './routes/products.js'
import customerRoutes from './routes/customers.js'
import orderRoutes from './routes/orders.js'
import floorRoutes from './routes/floors.js'
import employeeRoutes from './routes/employees.js'
import sessionRoutes from './routes/sessions.js'
import couponRoutes from './routes/coupons.js'
import promotionRoutes from './routes/promotions.js'
import reportRoutes from './routes/reports.js'
import { createCrudRouter } from './routes/crud.js'
import paymentRoutes from './routes/payments.js'
import { PaymentMethod } from './models/PaymentMethod.js'
import { Coupon } from './models/Coupon.js'
import { Promotion } from './models/Promotion.js'
import { Booking } from './models/Booking.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'mongodb' })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/floors', floorRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/payment-methods', createCrudRouter(PaymentMethod))
app.use('/api/payments', paymentRoutes)
app.use('/api/promotions-list', createCrudRouter(Promotion))
app.use('/api/bookings', createCrudRouter(Booking))

// Coupon CRUD at /api/coupon-items
app.use('/api/coupon-items', createCrudRouter(Coupon))

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
  })
}

start().catch(console.error)

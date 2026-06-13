import 'dotenv/config'
import { connectDB } from './config/db.js'
import { User } from './models/User.js'
import { Category } from './models/Category.js'
import { Product } from './models/Product.js'
import { Customer } from './models/Customer.js'
import { Floor } from './models/Floor.js'
import { PaymentMethod } from './models/PaymentMethod.js'
import { Coupon } from './models/Coupon.js'
import { CouponUsage } from './models/CouponUsage.js'
import { Promotion } from './models/Promotion.js'
import { Booking } from './models/Booking.js'
import { Order } from './models/Order.js'

async function seed() {
  await connectDB()

  // Prevent accidental data loss: require explicit env var to run destructive deletes
  if (process.env.SEED_FORCE === 'true') {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Floor.deleteMany({}),
      PaymentMethod.deleteMany({}),
      Coupon.deleteMany({}),
      CouponUsage.deleteMany({}),
      Promotion.deleteMany({}),
      Booking.deleteMany({}),
      Order.deleteMany({}),
    ])
    console.log('Destructive seed: collections cleared (SEED_FORCE=true)')
  } else {
    console.log('SEED_FORCE not set — skipping destructive deletes. To wipe DB, run with SEED_FORCE=true npm run seed')
  }

  const categories = await Category.insertMany([
    { name: 'Starters', color: '#da291c' },
    { name: 'Main Course', color: '#3b82f6' },
    { name: 'Beverages', color: '#22c55e' },
    { name: 'Desserts', color: '#a855f7' },
    { name: 'Combos', color: '#ffc72c' },
  ])

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c._id]))

  await Product.insertMany([
    { name: 'Paneer Tikka', categoryId: catMap['Starters'], price: 280, unit: 'plate', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
    { name: 'Chicken Wings', categoryId: catMap['Starters'], price: 320, unit: 'plate', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
    { name: 'Butter Chicken', categoryId: catMap['Main Course'], price: 380, unit: 'plate', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop' },
    { name: 'Biryani', categoryId: catMap['Main Course'], price: 350, unit: 'plate', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
    { name: 'Fresh Lime Soda', categoryId: catMap['Beverages'], price: 80, unit: 'glass', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop' },
    { name: 'Mango Lassi', categoryId: catMap['Beverages'], price: 120, unit: 'glass', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop' },
    { name: 'Chocolate Brownie', categoryId: catMap['Desserts'], price: 180, unit: 'piece', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
    { name: 'Family Combo', categoryId: catMap['Combos'], price: 1299, unit: 'set', tax: 5, active: true, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop' },
  ])

  await Customer.insertMany([
    { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', totalOrders: 24, totalSpent: 18500 },
    { name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43211', totalOrders: 18, totalSpent: 14200 },
    { name: 'Amit Patel', email: 'amit@email.com', phone: '+91 98765 43212', totalOrders: 31, totalSpent: 24800 },
  ])

  await Floor.insertMany([
    {
      name: 'Ground Floor',
      tables: [
        { number: 1, seats: 2, active: true, status: 'available', x: 50, y: 50 },
        { number: 2, seats: 4, active: true, status: 'occupied', x: 200, y: 50 },
        { number: 3, seats: 4, active: true, status: 'reserved', x: 350, y: 50 },
        { number: 4, seats: 6, active: true, status: 'available', x: 50, y: 200 },
      ],
    },
    {
      name: 'First Floor',
      tables: [
        { number: 9, seats: 4, active: true, status: 'available', x: 80, y: 80 },
        { number: 10, seats: 6, active: true, status: 'occupied', x: 250, y: 80 },
      ],
    },
    { name: 'Terrace', tables: [{ number: 15, seats: 4, active: true, status: 'available', x: 100, y: 100 }] },
  ])

  await PaymentMethod.insertMany([
    { type: 'cash', name: 'Cash', enabled: true },
    { type: 'card', name: 'Card', enabled: true },
    { type: 'upi', name: 'UPI', enabled: true, upiId: 'restmana@upi' },
    { type: 'razorpay', name: 'Razorpay', enabled: false },
  ])

  await Coupon.insertMany([
    { code: 'SAVE10', percentage: 10, active: true, usageCount: 45 },
    { code: 'FLAT50', fixedAmount: 50, active: true, usageCount: 23 },
    {
      code: 'WELCOME20',
      percentage: 20,
      active: true,
      usageCount: 12,
      firstTimeUserOnly: true,
      maxUsesPerUser: 1,
    },
    { code: 'LOYAL1', percentage: 5, active: true, usageCount: 0, maxUsesPerUser: 3 },
  ])

  await Promotion.insertMany([
    { name: 'Buy 2 Get 1 Free - Starters', type: 'product', minQuantity: 2, discount: 100, discountType: 'percentage', active: true },
    { name: 'Orders above ₹1000', type: 'order', minOrderAmount: 1000, discount: 15, discountType: 'percentage', active: true },
    {
      name: '10% off Starters & Beverages',
      type: 'category',
      categoryIds: [catMap['Starters'].toString(), catMap['Beverages'].toString()],
      minQuantity: 2,
      discount: 10,
      discountType: 'percentage',
      active: true,
    },
  ])

  await Booking.insertMany([
    { customerName: 'Rajesh Kumar', customerPhone: '+91 98765 43210', tableId: '3', tableNumber: 3, date: '2025-06-13', time: '19:00', guests: 4, status: 'confirmed' },
  ])

  console.log('Database seeded successfully!')
  console.log('Register an admin account at /signup to get started.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})

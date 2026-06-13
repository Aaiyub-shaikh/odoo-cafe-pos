import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rest_mana'
  await mongoose.connect(uri)
  console.log(`MongoDB connected: ${uri}`)
}

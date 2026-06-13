import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'

import { getAllowedOrigins } from './utils/corsOrigins.js'

let io: Server | null = null

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id)
    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id)
    })
  })

  return io
}

export function getIO(): Server | null {
  return io
}

export function emitKitchenNewOrder(order: Record<string, unknown>) {
  if (!io) {
    console.warn('[Socket] IO not initialized — skipping newOrder emit')
    return
  }
  io.emit('newOrder', order)
}

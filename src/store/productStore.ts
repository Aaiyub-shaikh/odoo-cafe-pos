import { create } from 'zustand'
import type { Product } from '@/types'
import { mockProducts } from '@/mock/products'

interface ProductState {
  products: Product[]
  isLoading: boolean
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, data: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getProduct: (id: string) => Product | undefined
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [...mockProducts],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 500))
    set({ products: [...mockProducts], isLoading: false })
  },
  addProduct: (product) => {
    const newProduct: Product = { ...product, id: crypto.randomUUID() }
    set((s) => ({ products: [...s.products, newProduct] }))
  },
  updateProduct: (id, data) => {
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  },
  deleteProduct: (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
  },
  getProduct: (id) => get().products.find((p) => p.id === id),
}))

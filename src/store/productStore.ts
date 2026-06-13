import { create } from 'zustand'
import type { Product } from '@/types'
import { productsApi } from '@/services/api'

interface ProductState {
  products: Product[]
  isLoading: boolean
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProduct: (id: string) => Product | undefined
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true })
    try {
      const data = await productsApi.getAll()
      set({ products: data as unknown as Product[], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
  addProduct: async (product) => {
    const created = (await productsApi.create(product)) as unknown as Product
    set((s) => ({ products: [...s.products, created] }))
    return created
  },
  updateProduct: async (id, data) => {
    const updated = (await productsApi.update(id, data)) as unknown as Product
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? updated : p)),
    }))
  },
  deleteProduct: async (id) => {
    await productsApi.delete(id)
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
  },
  getProduct: (id) => get().products.find((p) => p.id === id),
}))

import { create } from 'zustand'
import type { Category } from '@/types'
import { mockCategories } from '@/mock/products'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id'>) => Category
  updateCategory: (id: string, data: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getCategory: (id: string) => Category | undefined
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [...mockCategories],
  isLoading: false,
  fetchCategories: async () => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 400))
    set({ categories: [...mockCategories], isLoading: false })
  },
  addCategory: (category) => {
    const newCategory: Category = { ...category, id: crypto.randomUUID() }
    set((s) => ({ categories: [...s.categories, newCategory] }))
    return newCategory
  },
  updateCategory: (id, data) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }))
  },
  deleteCategory: (id) => {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
  },
  getCategory: (id) => get().categories.find((c) => c.id === id),
}))

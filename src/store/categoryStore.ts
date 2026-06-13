import { create } from 'zustand'
import type { Category } from '@/types'
import { categoriesApi } from '@/services/api'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getCategory: (id: string) => Category | undefined
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  fetchCategories: async () => {
    set({ isLoading: true })
    try {
      const data = await categoriesApi.getAll()
      set({ categories: data as unknown as Category[], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
  addCategory: async (category) => {
    const created = (await categoriesApi.create(category)) as unknown as Category
    set((s) => ({ categories: [...s.categories, created] }))
    return created
  },
  updateCategory: async (id, data) => {
    const updated = (await categoriesApi.update(id, data)) as unknown as Category
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? updated : c)),
    }))
  },
  deleteCategory: async (id) => {
    await categoriesApi.delete(id)
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
  },
  getCategory: (id) => get().categories.find((c) => c.id === id),
}))

import type { Category, Product } from '@/types'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Starters', color: '#da291c', productCount: 8 },
  { id: 'cat-2', name: 'Main Course', color: '#3b82f6', productCount: 12 },
  { id: 'cat-3', name: 'Beverages', color: '#22c55e', productCount: 10 },
  { id: 'cat-4', name: 'Desserts', color: '#a855f7', productCount: 6 },
  { id: 'cat-5', name: 'Combos', color: '#ffc72c', productCount: 4 },
]

const productImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
]

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Paneer Tikka', categoryId: 'cat-1', price: 280, unit: 'plate', tax: 5, description: 'Grilled cottage cheese with spices', image: productImages[0], active: true },
  { id: 'prod-2', name: 'Chicken Wings', categoryId: 'cat-1', price: 320, unit: 'plate', tax: 5, description: 'Crispy fried chicken wings', image: productImages[1], active: true },
  { id: 'prod-3', name: 'Spring Rolls', categoryId: 'cat-1', price: 180, unit: 'plate', tax: 5, description: 'Crispy vegetable spring rolls', image: productImages[2], active: true },
  { id: 'prod-4', name: 'Butter Chicken', categoryId: 'cat-2', price: 380, unit: 'plate', tax: 5, description: 'Creamy tomato-based curry', image: productImages[3], active: true },
  { id: 'prod-5', name: 'Biryani', categoryId: 'cat-2', price: 350, unit: 'plate', tax: 5, description: 'Aromatic rice with spices', image: productImages[4], active: true },
  { id: 'prod-6', name: 'Pasta Alfredo', categoryId: 'cat-2', price: 320, unit: 'plate', tax: 5, description: 'Creamy white sauce pasta', image: productImages[5], active: true },
  { id: 'prod-7', name: 'Grilled Salmon', categoryId: 'cat-2', price: 520, unit: 'plate', tax: 5, description: 'Fresh grilled salmon fillet', image: productImages[6], active: true },
  { id: 'prod-8', name: 'Fresh Lime Soda', categoryId: 'cat-3', price: 80, unit: 'glass', tax: 5, description: 'Refreshing lime soda', image: productImages[7], active: true },
  { id: 'prod-9', name: 'Mango Lassi', categoryId: 'cat-3', price: 120, unit: 'glass', tax: 5, description: 'Sweet mango yogurt drink', image: productImages[0], active: true },
  { id: 'prod-10', name: 'Cold Coffee', categoryId: 'cat-3', price: 150, unit: 'glass', tax: 5, description: 'Iced blended coffee', image: productImages[1], active: true },
  { id: 'prod-11', name: 'Masala Chai', categoryId: 'cat-3', price: 60, unit: 'cup', tax: 5, description: 'Spiced Indian tea', image: productImages[2], active: true },
  { id: 'prod-12', name: 'Chocolate Brownie', categoryId: 'cat-4', price: 180, unit: 'piece', tax: 5, description: 'Rich chocolate brownie', image: productImages[3], active: true },
  { id: 'prod-13', name: 'Ice Cream Sundae', categoryId: 'cat-4', price: 220, unit: 'bowl', tax: 5, description: 'Vanilla ice cream with toppings', image: productImages[4], active: true },
  { id: 'prod-14', name: 'Gulab Jamun', categoryId: 'cat-4', price: 120, unit: 'plate', tax: 5, description: 'Sweet milk dumplings', image: productImages[5], active: true },
  { id: 'prod-15', name: 'Family Combo', categoryId: 'cat-5', price: 1299, unit: 'set', tax: 5, description: '4 starters + 4 mains + 4 drinks', image: productImages[6], active: true },
  { id: 'prod-16', name: 'Lunch Special', categoryId: 'cat-5', price: 299, unit: 'set', tax: 5, description: '1 main + 1 drink + dessert', image: productImages[7], active: true },
  { id: 'prod-17', name: 'Soup of the Day', categoryId: 'cat-1', price: 150, unit: 'bowl', tax: 5, description: 'Chef special soup', image: productImages[0], active: true },
  { id: 'prod-18', name: 'Caesar Salad', categoryId: 'cat-1', price: 220, unit: 'bowl', tax: 5, description: 'Fresh greens with dressing', image: productImages[1], active: true },
  { id: 'prod-19', name: 'Veg Thali', categoryId: 'cat-2', price: 280, unit: 'plate', tax: 5, description: 'Complete vegetarian meal', image: productImages[2], active: true },
  { id: 'prod-20', name: 'Fresh Juice', categoryId: 'cat-3', price: 100, unit: 'glass', tax: 5, description: 'Seasonal fresh fruit juice', image: productImages[3], active: true },
]

export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find((c) => c.id === id)
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id)
}

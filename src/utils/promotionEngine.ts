import type { CartItem, Promotion } from '@/types'

export function evaluatePromotionDiscount(
  promo: Promotion,
  cart: CartItem[],
  subtotal: number
): number {
  if (!promo.active) return 0

  let base = 0

  if (promo.type === 'order') {
    if (promo.minOrderAmount != null && subtotal < promo.minOrderAmount) return 0
    base = subtotal
  } else if (promo.type === 'product') {
    const eligible = cart.filter(
      (item) => !promo.productIds?.length || promo.productIds.includes(item.productId)
    )
    const qty = eligible.reduce((s, i) => s + i.quantity, 0)
    if (promo.minQuantity != null && qty < promo.minQuantity) return 0
    base = eligible.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  } else if (promo.type === 'category') {
    if (!promo.categoryIds?.length) return 0
    const eligible = cart.filter(
      (item) => item.categoryId && promo.categoryIds!.includes(item.categoryId)
    )
    const qty = eligible.reduce((s, i) => s + i.quantity, 0)
    if (promo.minQuantity != null && qty < promo.minQuantity) return 0
    if (qty === 0) return 0
    base = eligible.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  }

  if (base <= 0) return 0

  if (promo.discountType === 'percentage') {
    return Math.round(base * (promo.discount / 100) * 100) / 100
  }
  return Math.min(promo.discount, base)
}

export function findBestPromotion(
  promotions: Promotion[],
  cart: CartItem[],
  subtotal: number
): { promotion: Promotion; discount: number } | null {
  let best: { promotion: Promotion; discount: number } | null = null

  for (const promo of promotions) {
    const discount = evaluatePromotionDiscount(promo, cart, subtotal)
    if (discount > 0 && (!best || discount > best.discount)) {
      best = { promotion: promo, discount }
    }
  }

  return best
}

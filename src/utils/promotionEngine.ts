import type { CartItem, Promotion } from '@/types'

export function evaluatePromotionDiscount(
  promo: Promotion,
  cart: CartItem[],
  subtotal: number
): number {
  if (!promo.active) return 0

  // Check if it's a "Buy X Get Y Free" style promotion
  let buyQty = 0
  let getQty = 0
  const match1 = /buy\s+(\d+)\s+get\s+(\d+)/i.exec(promo.name)
  if (match1) {
    buyQty = parseInt(match1[1], 10)
    getQty = parseInt(match1[2], 10)
  } else {
    const match2 = /\bb(\d+)g(\d+)\b/i.exec(promo.name)
    if (match2) {
      buyQty = parseInt(match2[1], 10)
      getQty = parseInt(match2[2], 10)
    }
  }

  if (buyQty > 0 && getQty > 0) {
    const cycleSize = buyQty + getQty
    let eligible = cart
    if (promo.type === 'product') {
      eligible = cart.filter(
        (item) => !promo.productIds?.length || promo.productIds.includes(item.productId)
      )
    } else if (promo.type === 'category') {
      if (!promo.categoryIds?.length) return 0
      eligible = cart.filter(
        (item) => item.categoryId && promo.categoryIds!.includes(item.categoryId)
      )
    }

    const prices: number[] = []
    for (const item of eligible) {
      for (let i = 0; i < item.quantity; i++) {
        prices.push(item.unitPrice)
      }
    }

    const totalQty = prices.length
    if (promo.minQuantity != null && totalQty < promo.minQuantity) return 0
    if (totalQty < cycleSize) return 0

    // Sort prices in ascending order to make the cheapest items free
    prices.sort((a, b) => a - b)

    const freeCount = Math.floor(totalQty / cycleSize) * getQty
    const discount = prices.slice(0, freeCount).reduce((sum, p) => sum + p, 0)
    return discount
  }

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

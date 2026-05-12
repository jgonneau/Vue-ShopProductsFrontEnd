import type { PublicProduct } from '../public-catalog/types'
import type { Product } from './types'

export const mapPublicProductToShopProduct = (product: PublicProduct): Product => {
  const numericPrice = Number.parseFloat(product.price)
  const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0

  return {
    id: product.id,
    name: product.title,
    category: product.store_name || 'General',
    price: safePrice,
    image: product?.image || `https://placehold.co/800x1000`,
    description: product.description,
    tag: product.in_stock ? 'In stock' : 'Limited',
    store: product.store,
    storeId: product.store,
  }
}

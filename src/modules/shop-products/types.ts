/**
 * Raw product item shape returned by backend catalog endpoints.
 * Example: { price: "400.99", store: "<uuid>" }.
 */
export type ProductApiItem = {
  id: string
  reference: string
  title: string
  description: string
  price: string
  in_stock: boolean
  store: string
  store_name: string
}

export type Product = {
  id: string
  name: string
  category: string
  price: number
  image: string
  tag?: string
  description: string
  /** Store UUID (normalized). */
  store?: string
  /** Legacy alias kept for backwards compatibility. */
  storeId?: string
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

export type Order = {
  id: string
  date: string
  status: OrderStatus
  total: number
  items: Array<{ productId: string; name: string; qty: number; price: number }>
  shipping: { name: string; address: string; city: string; country: string }
}

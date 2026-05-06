export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type InvoiceStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'partially_refunded'

export type CustomerOrderProduct = {
  id: string
  reference: string
  title: string
  price: string
}

export type CustomerOrder = {
  id: string
  reference: string
  content: Record<string, unknown> | null
  products: CustomerOrderProduct[]
  product_count: number
  total: string
  status: OrderStatus
  store_name: string
  invoice: string | null
  delivery_date: string | null
  created_at: string
  updated_at: string
}

export type CustomerInvoice = {
  id: string
  reference: string
  content: Record<string, unknown> | null
  total: string
  status: InvoiceStatus
  store: string
  store_name: string
  created_at: string
  updated_at: string
}

export type CreateOrderPayload = {
  reference: string
  store: string
  products: string[]
  content?: Record<string, unknown> | null
  delivery_date?: string | null
}

export type ChangePasswordPayload = {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export type DeleteAccountPayload = {
  password: string
}

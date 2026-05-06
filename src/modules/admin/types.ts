export type AdminRole = 'admin' | 'vendor' | 'customer' | 'guest'

export type AdminUser = {
  id: string
  email: string
  username: string | null
  role: AdminRole | null
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  token: string | null
  created_at: string
  updated_at: string
}

export type AdminStore = {
  id: string
  name: string
  city: string | null
  country: string | null
  owner: string
  owner_email: string
}

export type AdminProduct = {
  id: string
  reference: string
  title: string
  price: string
  stock_quantity: number
  in_stock: boolean
  store: string
  store_name: string
  activated: boolean
}

export type AdminOrder = {
  id: string
  reference: string
  total: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  customer: string
  customer_email: string
  store: string
  store_name: string
  delivery_date: string | null
  created_at: string
}

export type AdminInvoice = {
  id: string
  reference: string
  content: Record<string, unknown> | null
  total: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'partially_refunded'
  customer: string
  customer_email: string
  store: string
  store_name: string
  created_at: string
  updated_at: string
}

export type AdminLog = {
  id: string
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical' | null
  source: string | null
  created_at: string
}

export type AdminLogStats = {
  total: number
  by_severity: Array<{ severity: string; count: number }>
  top_sources: Array<{ source: string; count: number }>
}

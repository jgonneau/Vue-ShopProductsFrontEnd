export type VendorStore = {
  id: string
  name: string
  description: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  created_at: string
  updated_at: string
}

export type VendorProduct = {
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

export type CreateVendorStorePayload = {
  name: string
  description?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
}

export type CreateVendorProductPayload = {
  reference: string
  title: string
  description?: string
  price: string
  stock_quantity: number
  activated?: boolean
}

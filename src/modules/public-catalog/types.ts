export type PublicProduct = {
  id: string
  reference: string
  title: string
  description: string
  price: string
  in_stock: boolean
  store_name: string
}

export type PublicStoreListItem = {
  id: string
  name: string
  city: string
  country: string
}

export type PublicStoreDetail = {
  id: string
  name: string
  description: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
}

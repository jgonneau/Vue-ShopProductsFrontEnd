import type { Order, Product } from './types'

const img = (seed: string, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Linen Overshirt',
    category: 'Apparel',
    price: 148,
    image: img('1591047139829-d91aecb6caea'),
    tag: 'New',
    description: 'Garment-dyed linen with horn buttons and a soft camp collar.',
  },
  {
    id: 'p2',
    name: 'Wide-Leg Trouser',
    category: 'Apparel',
    price: 195,
    image: img('1490481651871-ab68de25d43d'),
    description: 'Heavyweight twill, pleated front, tailored in Portugal.',
  },
  {
    id: 'p3',
    name: 'Ceramic Carafe',
    category: 'Home',
    price: 64,
    image: img('1578749556568-bc2c40e68b61'),
    tag: "Editor's pick",
    description: 'Hand-thrown stoneware in a warm sand glaze.',
  },
  {
    id: 'p4',
    name: 'Brass Desk Lamp',
    category: 'Home',
    price: 220,
    image: img('1507473885765-e6ed057f782c'),
    description: 'Articulated brass arm with a frosted opal shade.',
  },
  {
    id: 'p5',
    name: 'Suede Loafer',
    category: 'Footwear',
    price: 285,
    image: img('1542291026-7eec264c27ff'),
    description: 'Italian suede on a stitched leather sole.',
  },
  {
    id: 'p6',
    name: 'Wool Crewneck',
    category: 'Apparel',
    price: 168,
    image: img('1620799140408-edc6dcb6d633'),
    description: 'Mid-weight merino in a relaxed silhouette.',
  },
  {
    id: 'p7',
    name: 'Travel Tote',
    category: 'Accessories',
    price: 320,
    image: img('1548036328-c9fa89d128fa'),
    tag: 'Bestseller',
    description: 'Vegetable-tanned leather, room for a 15" laptop.',
  },
  {
    id: 'p8',
    name: 'Pour-Over Kettle',
    category: 'Home',
    price: 95,
    image: img('1495474472287-4d71bcdd2085'),
    description: 'Precision spout, matte black finish.',
  },
  {
    id: 'p9',
    name: 'Linen Throw',
    category: 'Home',
    price: 110,
    image: img('1522771739844-6a9f6d5f14af'),
    description: 'Stonewashed linen with hand-knotted fringe.',
  },
  {
    id: 'p10',
    name: 'Cashmere Scarf',
    category: 'Accessories',
    price: 180,
    image: img('1601924994987-69e26d50dc26'),
    description: 'Mongolian cashmere, woven in Scotland.',
  },
  {
    id: 'p11',
    name: 'Walnut Stool',
    category: 'Home',
    price: 340,
    image: img('1532372576444-dda954194ad0'),
    description: 'Solid walnut with a hand-rubbed oil finish.',
  },
  {
    id: 'p12',
    name: 'Canvas Sneaker',
    category: 'Footwear',
    price: 120,
    image: img('1525966222134-fcfa99b8ae77'),
    description: 'Heavy canvas upper on a vulcanized sole.',
  },
]

export const categories = ['All', 'Apparel', 'Home', 'Footwear', 'Accessories']

export const orders: Order[] = [
  {
    id: 'ORD-10421',
    date: '2026-05-04',
    status: 'Shipped',
    total: 343,
    items: [
      { productId: 'p1', name: 'Linen Overshirt', qty: 1, price: 148 },
      { productId: 'p5', name: 'Suede Loafer', qty: 1, price: 195 },
    ],
    shipping: { name: 'Ada Lovelace', address: '12 Marais St.', city: 'Paris', country: 'France' },
  },
  {
    id: 'ORD-10408',
    date: '2026-04-22',
    status: 'Delivered',
    total: 64,
    items: [{ productId: 'p3', name: 'Ceramic Carafe', qty: 1, price: 64 }],
    shipping: { name: 'Ada Lovelace', address: '12 Marais St.', city: 'Paris', country: 'France' },
  },
  {
    id: 'ORD-10395',
    date: '2026-04-11',
    status: 'Processing',
    total: 500,
    items: [
      { productId: 'p7', name: 'Travel Tote', qty: 1, price: 320 },
      { productId: 'p10', name: 'Cashmere Scarf', qty: 1, price: 180 },
    ],
    shipping: { name: 'Ada Lovelace', address: '12 Marais St.', city: 'Paris', country: 'France' },
  },
  {
    id: 'ORD-10380',
    date: '2026-03-29',
    status: 'Cancelled',
    total: 220,
    items: [{ productId: 'p4', name: 'Brass Desk Lamp', qty: 1, price: 220 }],
    shipping: { name: 'Ada Lovelace', address: '12 Marais St.', city: 'Paris', country: 'France' },
  },
]

export const adminMetrics = {
  revenue: 184_230,
  orders: 1_284,
  customers: 902,
  conversion: 3.4,
  weekly: [12, 18, 15, 22, 28, 24, 31, 27, 35, 33, 41, 38],
  topProducts: [
    { name: 'Travel Tote', units: 142, revenue: 45_440 },
    { name: 'Linen Overshirt', units: 118, revenue: 17_464 },
    { name: 'Suede Loafer', units: 96, revenue: 27_360 },
    { name: 'Ceramic Carafe', units: 84, revenue: 5_376 },
  ],
  recent: [
    { id: 'ORD-10421', customer: 'Ada Lovelace', total: 343, status: 'Shipped' },
    { id: 'ORD-10420', customer: 'Marcus Aurelius', total: 1240, status: 'Processing' },
    { id: 'ORD-10419', customer: 'Yuki Tanaka', total: 95, status: 'Delivered' },
    { id: 'ORD-10418', customer: 'Ines Moreau', total: 580, status: 'Shipped' },
    { id: 'ORD-10417', customer: 'Karim Salah', total: 220, status: 'Processing' },
  ],
}

export const currentUser = {
  name: 'Ada Lovelace',
  email: 'ada@analytical.engine',
  memberSince: '2024',
}

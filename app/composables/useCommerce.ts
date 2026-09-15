import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from '~/data/currency'
import { PRODUCTS, type Product } from '~/data/products'

export type ShipmentType = 'standard' | 'express' | 'pickup'

export interface CartLine {
  id: string
  qty: number
}

export interface Order {
  id: string
  createdAt: number
  name: string
  phone: string
  city: string
  address: string
  shipmentType: ShipmentType
  lines: CartLine[]
  subtotal: number
  shipping: number
  total: number
}

export interface CheckoutPayload {
  name: string
  phone: string
  city: string
  address: string
  shipmentType: ShipmentType
}

const CART_KEY = 'aura_cart_v2'
const USER_KEY = 'aura_user_v1'
const ORDERS_KEY = 'aura_orders_v2'
const NEWS_KEY = 'aura_newsletter_v1'

export function shippingCostFor(method: ShipmentType, subtotal: number): number {
  if (method === 'pickup') return 0
  if (method === 'express') {
    return subtotal >= FREE_SHIPPING_THRESHOLD
      ? SHIPPING_RATES.expressReduced
      : SHIPPING_RATES.express
  }
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES.standard
}

export function useCommerce() {
  const cart = useState<CartLine[]>('cart', () => [])
  const user = useState<{ email: string; name: string } | null>('user', () => null)
  const hydrated = useState('commerce-hydrated', () => false)
  const cartRevision = useState('cart-revision', () => 0)

  const productMap = new Map(PRODUCTS.map((p) => [p.id, p]))

  function bumpCart() {
    cartRevision.value += 1
  }

  function hydrateFromStorage() {
    if (!import.meta.client || hydrated.value) return
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[]
        cart.value = Array.isArray(parsed) ? parsed.filter((l) => productMap.has(l.id)) : []
      }
      const legacy = localStorage.getItem('aura_cart_v1')
      if (legacy && !raw) {
        cart.value = JSON.parse(legacy).filter((l: CartLine) => productMap.has(l.id))
        persistCart()
      }
      const u = localStorage.getItem(USER_KEY)
      if (u) user.value = JSON.parse(u)
    } catch {
      cart.value = []
    }
    hydrated.value = true
    bumpCart()
  }

  function persistCart() {
    if (!import.meta.client) return
    localStorage.setItem(CART_KEY, JSON.stringify(cart.value))
    bumpCart()
  }

  function getProduct(id: string): Product | undefined {
    return productMap.get(id)
  }

  function addToCart(id: string, qty = 1) {
    if (!productMap.has(id)) return false
    const line = cart.value.find((l) => l.id === id)
    if (line) line.qty += qty
    else cart.value = [...cart.value, { id, qty }]
    persistCart()
    return true
  }

  function setQty(id: string, qty: number) {
    if (qty <= 0) cart.value = cart.value.filter((l) => l.id !== id)
    else {
      const line = cart.value.find((l) => l.id === id)
      if (line) {
        line.qty = qty
        cart.value = [...cart.value]
      }
    }
    persistCart()
  }

  function clearCart() {
    cart.value = []
    persistCart()
  }

  function lineTotal(line: CartLine) {
    const p = productMap.get(line.id)
    return (p?.price ?? 0) * line.qty
  }

  const count = computed(() => cart.value.reduce((n, l) => n + l.qty, 0))

  const subtotal = computed(() =>
    cart.value.reduce((sum, line) => sum + lineTotal(line), 0),
  )

  function shippingFor(method: ShipmentType) {
    return shippingCostFor(method, subtotal.value)
  }

  const shipping = computed(() => shippingFor('standard'))

  const total = computed(() => subtotal.value + shipping.value)

  function formatMoney(amount: number) {
    const { locale } = useI18n()
    const tag = locale.value === 'ar' ? 'ar-DZ' : 'fr-DZ'
    return new Intl.NumberFormat(tag, {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function signIn(email: string, password: string) {
    if (!email.includes('@') || password.length < 6) return false
    user.value = { email, name: email.split('@')[0] ?? 'client' }
    if (import.meta.client) localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    return true
  }

  function signOut() {
    user.value = null
    if (import.meta.client) localStorage.removeItem(USER_KEY)
  }

  function placeOrder(payload: CheckoutPayload) {
    if (!cart.value.length) return null
    const ship = shippingCostFor(payload.shipmentType, subtotal.value)
    const order: Order = {
      id: `AB-${Date.now().toString(36).toUpperCase()}`,
      createdAt: Date.now(),
      ...payload,
      lines: cart.value.map((l) => ({ ...l })),
      subtotal: subtotal.value,
      shipping: ship,
      total: subtotal.value + ship,
    }
    if (import.meta.client) {
      const list: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
      list.unshift(order)
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list))
    }
    clearCart()
    return order
  }

  function getOrders(): Order[] {
    if (!import.meta.client) return []
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
    } catch {
      return []
    }
  }

  function subscribeNewsletter(email: string) {
    if (!email.includes('@')) return false
    const list: string[] = JSON.parse(localStorage.getItem(NEWS_KEY) ?? '[]')
    if (!list.includes(email)) list.push(email)
    localStorage.setItem(NEWS_KEY, JSON.stringify(list))
    return true
  }

  function searchProducts(query: string) {
    const q = query.trim().toLowerCase()
    if (!q) return PRODUCTS
    const { t } = useI18n()
    return PRODUCTS.filter((p) => {
      const blob = [t(`products.${p.id}.name`), t(`products.${p.id}.origin`), p.id]
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
  }

  if (import.meta.client && !hydrated.value) {
    onMounted(hydrateFromStorage)
  }

  return {
    cart,
    cartRevision,
    user,
    count,
    subtotal,
    shipping,
    total,
    lineTotal,
    shippingFor,
    addToCart,
    setQty,
    clearCart,
    getProduct,
    formatMoney,
    signIn,
    signOut,
    placeOrder,
    getOrders,
    subscribeNewsletter,
    searchProducts,
    hydrateFromStorage,
    FREE_SHIPPING_THRESHOLD,
  }
}

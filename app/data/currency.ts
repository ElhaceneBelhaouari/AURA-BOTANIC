/** All storefront amounts are in Algerian dinar (DZD). */
export const CURRENCY_CODE = 'DZD'

/** Free standard shipping from this cart subtotal (DZD). */
export const FREE_SHIPPING_THRESHOLD = 10_000

export const SHIPPING_RATES = {
  standard: 1_200,
  express: 2_200,
  expressReduced: 1_800,
} as const

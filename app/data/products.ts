export type ProductCategory = 'all' | 'facial' | 'single' | 'body'

export interface Product {
  id: string
  price: number
  category: Exclude<ProductCategory, 'all'>
  image: string
  rating: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'moroccan-argan',
    price: 7_200,
    category: 'single',
    rating: '4.9 (312)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAAlONj-lsfNnJt0fENnHeTdFbUUkhoT3lDRQXCrlfzxnwQAVG-0HkKLB7DGxzOreACGSrEFwyJnmzj486gqTUKdGyqHpEIOXbv6uzli88a9ve0HQc8i5-t6biiPL8CZQjojCFfZO0GCFWIZzuAuX5cyvkWXYNYz3t_Pi3nILla3veIxpTWsopB1t2sNT0_nOaY7EdkuwWAAIB4Hi5Btjd0oNiVEVdAafw9HoS5GvSolBaNnUFiEYDA',
  },
  {
    id: 'olive-squalane',
    price: 6_300,
    category: 'facial',
    rating: '5.0 (184)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAx-5yBNLv-4pTK40yXxXdNjgpHqz6YcciazIUeQdymh97kZAmJ-cSobefSb5ROFbBv_VZQEYiqp5ngH4eb3qi5S6j_HJHtDQaI_Ghjxjr_q_9Y1AbY17UUFslIHVXBKpZymwDUor2im4oe4gVN7HIMnEGXiQjLVromHxaMAMtkNWgfgSRbXKeuNY4Cw9ppCVTDfKAZHNYTmn4y7EXXOOMV65aJ8cPzFHN7FIFSMUO51He7iV27q11c',
  },
  {
    id: 'lavender-oil',
    price: 5_400,
    category: 'body',
    rating: '4.8 (98)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCzsCIIDcP4BTGZCFtRm7bO0sY5MXm9R5vHN6BocK3xpvlBhYUFWAaLqM9w6wERv3BeZ4fQBDAIvByAHN3_mPVZJ_67vAA2uPS6VMSo5UrDhA8VQH7yS9eE1sgpD1GEg_DQZFFBqTbgXqwYYKNkPotgVb2FrRi9v6h6_gMLJ0WgWyl1FHDvM6k504ASJzMXr-3l_pzhPmaEjkFTeFQgaQPPeUkiT6grNJINGcgC-3b_rWkQTAK0Kz3',
  },
  {
    id: 'rosehip-oil',
    price: 6_900,
    category: 'facial',
    rating: '4.9 (245)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbhDul2sj5dR7sjKPdcGLcMiTXDuWFAMH9sWgSoKosuroWferAqKorsVnETrjlsiIkcCBXZIoxUdp_HWt_8LoI6h_0YYObr7MLUeSHpmNSVdPw69Dj183_Z5jZUImXVbSVuXjQvOJ3D31D3zbUxCZSwRrts2TqqXnY7bFYqr3GSO0Lds8S0Tjdk8JZy_wsvqbh1DEVAw_1KazedpYMAPegFGoNwcJXmPzU2V_YnBueJhJ96mLRLolZ',
  },
  {
    id: 'jojoba-oil',
    price: 5_700,
    category: 'body',
    rating: '4.9 (173)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAxjz9cvq-dM78fxjOQ1bwhMO9g1VADXpjhK5qRj1pl2w8ORxwLmLZ9fBtOmt_X-EGmwRjo9-eb0cLWd3B7H1Q2We42ARZ9YA8K-zQ15K8744YS_Wu8fWqOgC2J2XKFbMuXojxIL51yIyQAS8dLfdnewFVsIdWEg_HBzgyvckZlkydItrOqZ-hNRQuQTDZzhvMbKleDtEvpggwkICjx93bK7ESFbb95dnvfThaKBGntOqdQcmwK2SBE',
  },
  {
    id: 'prickly-pear',
    price: 11_700,
    category: 'facial',
    rating: '5.0 (64)',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSBxSv7M1sMOXQwb_HTUCICrtd5hsLgMvu5LwdJ9Prb19efZPsiiFd8RWkizIpelUX6RDNMj0M7Ykv8-0IgLGYzXFkxWQF2DR5I8rQhFbN6cuPwAUXv0eXFn36vUjHZL7i91c307_uVwAv1AvPilee_sZmXFCkky8Y_FXkFjkigpraEMpZ0PPQBkmFEB0XBUlpVkOyHyvnU0KCAKWHqhVXW_n1Hz5Sl3qLaSF9UliSE6S2rLXY_606',
  },
]

export const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgGbLW-uycPvh1KtyJfxVso6p3edyAeVYyO47DPdYMBPvclCs5c7ZiI6Ayo6AbisKCGZ7Ff1S4IgeswkV4PlEMDV8fJOWNoi8JgzK7iIJp__tC9GKTyG8TeeV2hIAyzpREnOXDHheyOuFlH3OpBKU6wjtY8MFb0e9gKs5nbbzlCEM9JrO1pBqBcRs_ZoC6l-EK5swc4j_ZnKqHiXWF_aeSQSkFFLRUZ-d2efitvKib8ULEbQVCrNb8'

export { FREE_SHIPPING_THRESHOLD } from './currency'

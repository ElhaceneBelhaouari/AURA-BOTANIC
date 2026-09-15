<script setup lang="ts">
import { Minus, Plus, Trash2, ShoppingBag, X, Truck, Sparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { ShipmentType } from '~/composables/useCommerce'

const props = defineProps<{
  searchOpen: boolean
  accountOpen: boolean
  cartOpen: boolean
  checkoutOpen: boolean
  videoOpen: boolean
}>()

const emit = defineEmits<{
  'update:searchOpen': [boolean]
  'update:accountOpen': [boolean]
  'update:cartOpen': [boolean]
  'update:checkoutOpen': [boolean]
  'update:videoOpen': [boolean]
}>()

const { t, locale } = useI18n()
const {
  cart,
  count,
  user,
  subtotal,
  shipping,
  total,
  setQty,
  clearCart,
  getProduct,
  formatMoney,
  signIn,
  signOut,
  placeOrder,
  getOrders,
  searchProducts,
  shippingFor,
  lineTotal,
  cartRevision,
  hydrateFromStorage,
  FREE_SHIPPING_THRESHOLD,
} = useCommerce()

const searchQuery = ref('')
const searchResults = computed(() => searchProducts(searchQuery.value))

const accountEmail = ref('')
const accountPassword = ref('')
const checkoutName = ref('')
const checkoutPhone = ref('')
const checkoutCity = ref('')
const checkoutAddress = ref('')
const checkoutShipment = ref<ShipmentType>('standard')

watch(
  () => props.cartOpen,
  (open) => {
    if (open) hydrateFromStorage()
  },
)

const checkoutShipping = computed(() => shippingFor(checkoutShipment.value))
const checkoutTotal = computed(() => subtotal.value + checkoutShipping.value)

const cartLines = computed(() => {
  void cartRevision.value
  return cart.value
})

function pickSearch(id: string) {
  emit('update:searchOpen', false)
  nextTick(() => {
    const el = document.getElementById(`product-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.classList.add('ring-2', 'ring-primary')
    setTimeout(() => el?.classList.remove('ring-2', 'ring-primary'), 2000)
  })
}

function handleSignIn() {
  if (!signIn(accountEmail.value, accountPassword.value)) return
  toast.success(t('account.welcome'), { description: user.value?.email })
  emit('update:accountOpen', false)
}

function startCheckout() {
  if (!cart.value.length) {
    toast.error(t('toast.bagEmpty'), { description: t('toast.addFirst') })
    return
  }
  emit('update:cartOpen', false)
  emit('update:checkoutOpen', true)
}

function submitOrder() {
  const phone = checkoutPhone.value.replace(/\s/g, '')
  if (phone.length < 8) {
    toast.error(t('checkout.phone'))
    return
  }
  const order = placeOrder({
    name: checkoutName.value.trim(),
    phone,
    city: checkoutCity.value.trim(),
    address: checkoutAddress.value.trim(),
    shipmentType: checkoutShipment.value,
  })
  if (!order) return
  toast.success(t('checkout.confirmed', { id: order.id }), {
    description: t('checkout.totalLine', {
      total: formatMoney(order.total),
      shipping: order.shipping === 0 ? t('cart.free') : formatMoney(order.shipping),
    }),
  })
  emit('update:checkoutOpen', false)
  checkoutName.value = ''
  checkoutPhone.value = ''
  checkoutCity.value = ''
  checkoutAddress.value = ''
  checkoutShipment.value = 'standard'
}

const shippingLabel = computed(() => {
  const away = FREE_SHIPPING_THRESHOLD - subtotal.value
  if (subtotal.value >= FREE_SHIPPING_THRESHOLD) return t('cart.shippingUnlocked')
  return t('cart.shippingAway', { amount: formatMoney(Math.max(0, away)) })
})

const shippingProgress = computed(() =>
  Math.min(100, (subtotal.value / FREE_SHIPPING_THRESHOLD) * 100),
)

const shippingUnlocked = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD)

const cartSide = computed(() => (locale.value === 'ar' ? 'left' : 'right'))

const itemsCountLabel = computed(() =>
  count.value === 1 ? t('cart.oneItem') : t('cart.manyItems', { count: count.value }),
)

function browseHarvest() {
  emit('update:cartOpen', false)
  nextTick(() => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const orders = computed(() => {
  if (!user.value) return []
  return getOrders().slice(0, 10)
})

onMounted(() => {
  if (!import.meta.client) return
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      emit('update:searchOpen', true)
    }
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})
</script>

<template>
  <Dialog :open="searchOpen" @update:open="emit('update:searchOpen', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ t('nav.search') }}</DialogTitle>
      </DialogHeader>
      <Input v-model="searchQuery" :placeholder="t('search.placeholder')" autofocus />
      <div class="max-h-64 space-y-1 overflow-y-auto">
        <button
          v-for="p in searchResults"
          :key="p.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg p-2 text-start hover:bg-muted"
          @click="pickSearch(p.id)"
        >
          <img :src="p.image" alt="" class="size-12 rounded-md object-cover" />
          <div>
            <p class="text-sm font-medium">{{ t(`products.${p.id}.name`) }}</p>
            <p class="text-xs text-muted-foreground">
              {{ t(`products.${p.id}.volume`) }} · {{ formatMoney(p.price) }}
            </p>
          </div>
        </button>
        <p v-if="searchQuery && !searchResults.length" class="p-3 text-sm text-muted-foreground">
          {{ t('search.empty', { query: searchQuery }) }}
        </p>
      </div>
      <p class="text-xs text-muted-foreground">{{ t('search.tip') }}</p>
    </DialogContent>
  </Dialog>

  <Dialog :open="accountOpen" @update:open="emit('update:accountOpen', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t('account.title') }}</DialogTitle>
      </DialogHeader>
      <template v-if="user">
        <p class="text-sm text-muted-foreground">
          {{ t('account.signedIn', { email: user.email }) }}
        </p>
        <div class="max-h-40 space-y-2 overflow-y-auto">
          <div
            v-for="o in orders"
            :key="o.id"
            class="rounded-lg border p-2 text-sm"
          >
            <p class="font-medium">{{ o.id }}</p>
            <p class="text-muted-foreground">{{ formatMoney(o.total) }}</p>
          </div>
          <p v-if="!orders.length" class="text-sm text-muted-foreground">{{ t('account.noOrders') }}</p>
        </div>
        <Button variant="outline" class="w-full" @click="signOut(); emit('update:accountOpen', false); toast.message(t('toast.signedOut'))">
          {{ t('account.signOut') }}
        </Button>
      </template>
      <form v-else class="space-y-4" @submit.prevent="handleSignIn">
        <div class="space-y-2">
          <Label for="acc-email">{{ t('account.email') }}</Label>
          <Input id="acc-email" v-model="accountEmail" type="email" required />
        </div>
        <div class="space-y-2">
          <Label for="acc-pass">{{ t('account.password') }}</Label>
          <Input id="acc-pass" v-model="accountPassword" type="password" minlength="6" required />
        </div>
        <Button type="submit" class="w-full">{{ t('account.signIn') }}</Button>
        <p class="text-center text-xs text-muted-foreground">{{ t('account.demo') }}</p>
      </form>
    </DialogContent>
  </Dialog>

  <Sheet :open="cartOpen" @update:open="emit('update:cartOpen', $event)">
    <SheetContent
      :side="cartSide"
      :show-close-button="false"
      class="flex w-[min(100%,24rem)] flex-col gap-0 border-border/60 bg-gradient-to-b from-background via-card/95 to-muted/50 p-0 shadow-2xl duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:max-w-md"
    >
      <div class="relative shrink-0 overflow-hidden border-b border-border/50 px-5 pb-4 pt-5">
        <div
          class="pointer-events-none absolute -end-12 -top-12 size-40 rounded-full bg-primary/12 blur-3xl"
          aria-hidden="true"
        />
        <div class="relative flex items-start justify-between gap-3">
          <SheetHeader class="space-y-1.5 p-0 text-start">
            <div class="flex flex-wrap items-center gap-2">
              <span class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingBag class="size-4" aria-hidden="true" />
              </span>
              <Badge v-if="count > 0" variant="secondary" class="rounded-full px-2 py-0 text-[10px] font-semibold">
                {{ itemsCountLabel }}
              </Badge>
            </div>
            <SheetTitle class="font-display text-2xl leading-tight">{{ t('cart.title') }}</SheetTitle>
            <SheetDescription class="text-sm text-muted-foreground">
              {{ t('cart.subtitle') }}
            </SheetDescription>
          </SheetHeader>
          <SheetClose as-child>
            <Button
              variant="outline"
              size="icon-sm"
              class="shrink-0 rounded-full border-border/70 bg-background/80 shadow-sm backdrop-blur-sm"
              :aria-label="t('nav.close')"
            >
              <X class="size-4" />
            </Button>
          </SheetClose>
        </div>

        <div
          v-if="cartLines.length"
          class="relative mt-4 rounded-xl border border-border/50 bg-background/70 p-3 backdrop-blur-sm"
        >
          <div class="mb-2 flex items-center gap-2 text-xs">
            <Truck
              class="size-3.5 shrink-0"
              :class="shippingUnlocked ? 'text-primary' : 'text-muted-foreground'"
              aria-hidden="true"
            />
            <p
              class="leading-snug"
              :class="shippingUnlocked ? 'font-medium text-primary' : 'text-muted-foreground'"
            >
              {{ shippingLabel }}
            </p>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-muted/80">
            <div
              class="h-full rounded-full transition-[width] duration-500 ease-out"
              :class="shippingUnlocked ? 'bg-primary' : 'bg-gradient-to-r from-secondary/80 to-primary'"
              :style="{ width: `${shippingProgress}%` }"
            />
          </div>
        </div>
      </div>

      <div v-if="!cartLines.length" class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-14 text-center">
        <span
          class="flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-background/80 text-primary shadow-sm"
          aria-hidden="true"
        >
          <Sparkles class="size-7 opacity-80" />
        </span>
        <div class="space-y-2">
          <p class="font-display text-lg">{{ t('cart.emptyTitle') }}</p>
          <p class="text-sm leading-relaxed text-muted-foreground">{{ t('cart.empty') }}</p>
        </div>
        <Button class="w-full max-w-xs rounded-xl" @click="browseHarvest">
          {{ t('cart.emptyCta') }}
        </Button>
      </div>

      <ul v-else class="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="list">
        <li
          v-for="(line, index) in cartLines"
          :key="`${line.id}-${line.qty}`"
          class="cart-sheet-line rounded-xl border border-border/50 bg-background/75 p-3 shadow-sm backdrop-blur-sm"
          :style="{ '--cart-i': index }"
        >
          <div class="flex gap-3">
            <img
              v-if="getProduct(line.id)"
              :src="getProduct(line.id)!.image"
              alt=""
              class="size-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-border/40"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold leading-tight">
                {{ t(`products.${line.id}.name`) }}
              </p>
              <p class="mt-0.5 text-xs text-muted-foreground">{{ t(`products.${line.id}.volume`) }}</p>
              <p class="mt-1.5 text-sm">
                <span class="text-muted-foreground">{{ formatMoney(getProduct(line.id)?.price ?? 0) }}</span>
                <span class="text-muted-foreground"> × {{ line.qty }}</span>
              </p>
              <p class="font-display text-base font-semibold text-primary">
                {{ formatMoney(lineTotal(line)) }}
              </p>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
            <div class="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
              <Button
                variant="ghost"
                size="icon"
                class="size-8 rounded-md"
                :aria-label="t('cart.remove')"
                @click="setQty(line.id, line.qty - 1)"
              >
                <Minus class="size-4" />
              </Button>
              <span class="min-w-8 text-center text-sm font-medium tabular-nums">{{ line.qty }}</span>
              <Button variant="ghost" size="icon" class="size-8 rounded-md" @click="setQty(line.id, line.qty + 1)">
                <Plus class="size-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="ms-auto text-xs text-muted-foreground hover:text-destructive"
              @click="setQty(line.id, 0); toast.message(t('toast.removed'))"
            >
              <Trash2 class="size-3.5 me-1" />{{ t('cart.remove') }}
            </Button>
          </div>
        </li>
      </ul>

      <div
        v-if="cartLines.length"
        class="cart-sheet-footer shrink-0 space-y-3 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-md"
      >
        <div class="space-y-2 rounded-xl border border-border/50 bg-card/80 p-3 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-muted-foreground">{{ t('cart.subtotal') }}</span>
            <span class="font-medium tabular-nums">{{ formatMoney(subtotal) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-muted-foreground">{{ t('cart.shipping') }}</span>
            <span
              class="font-medium tabular-nums"
              :class="shipping === 0 ? 'text-primary' : ''"
            >
              {{ shipping === 0 ? t('cart.free') : formatMoney(shipping) }}
            </span>
          </div>
          <div class="flex justify-between gap-4 border-t border-border/40 pt-2 text-base">
            <span class="font-semibold">{{ t('cart.total') }}</span>
            <span class="font-display text-lg font-semibold tabular-nums">{{ formatMoney(total) }}</span>
          </div>
        </div>
        <Button class="h-11 w-full rounded-xl text-base shadow-md" @click="startCheckout">
          {{ t('cart.checkout') }}
        </Button>
        <Button
          variant="ghost"
          class="w-full text-muted-foreground"
          @click="clearCart(); toast.message(t('toast.cleared'))"
        >
          {{ t('cart.clear') }}
        </Button>
      </div>
    </SheetContent>
  </Sheet>

  <Dialog :open="checkoutOpen" @update:open="emit('update:checkoutOpen', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('checkout.title') }}</DialogTitle>
      </DialogHeader>
      <form class="space-y-4" @submit.prevent="submitOrder">
        <div class="space-y-2">
          <Label for="co-name">{{ t('checkout.name') }}</Label>
          <Input id="co-name" v-model="checkoutName" required autocomplete="name" />
        </div>
        <div class="space-y-2">
          <Label for="co-phone">{{ t('checkout.phone') }}</Label>
          <Input id="co-phone" v-model="checkoutPhone" type="tel" required autocomplete="tel" />
        </div>
        <div class="space-y-2">
          <Label for="co-city">{{ t('checkout.city') }}</Label>
          <Input id="co-city" v-model="checkoutCity" required autocomplete="address-level2" />
        </div>
        <div class="space-y-2">
          <Label for="co-address">{{ t('checkout.address') }}</Label>
          <Textarea id="co-address" v-model="checkoutAddress" required rows="3" autocomplete="street-address" />
        </div>
        <div class="space-y-2">
          <Label>{{ t('checkout.shipmentType') }}</Label>
          <Select v-model="checkoutShipment">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">{{ t('checkout.shipmentStandard') }}</SelectItem>
              <SelectItem value="express">{{ t('checkout.shipmentExpress') }}</SelectItem>
              <SelectItem value="pickup">{{ t('checkout.shipmentPickup') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
          <p class="font-medium">{{ t('checkout.summary') }}</p>
          <div class="flex justify-between">
            <span>{{ t('cart.subtotal') }}</span>
            <span>{{ formatMoney(subtotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span>{{ t('cart.shipping') }}</span>
            <span>{{ checkoutShipping === 0 ? t('cart.free') : formatMoney(checkoutShipping) }}</span>
          </div>
          <div class="flex justify-between font-semibold pt-1 border-t">
            <span>{{ t('cart.total') }}</span>
            <span>{{ formatMoney(checkoutTotal) }}</span>
          </div>
        </div>
        <Button type="submit" class="w-full" :disabled="!cartLines.length">{{ t('checkout.place') }}</Button>
        <p class="text-center text-xs text-muted-foreground">{{ t('checkout.demo') }}</p>
      </form>
    </DialogContent>
  </Dialog>

  <Dialog :open="videoOpen" @update:open="emit('update:videoOpen', $event)">
    <DialogContent class="sm:max-w-3xl p-0 overflow-hidden">
      <DialogHeader class="p-4 pb-0">
        <DialogTitle>{{ t('video.title') }}</DialogTitle>
      </DialogHeader>
      <video
        class="aspect-video w-full bg-black"
        controls
        playsinline
        src="https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4"
      />
      <p class="p-4 text-sm text-muted-foreground">{{ t('video.caption') }}</p>
    </DialogContent>
  </Dialog>
</template>

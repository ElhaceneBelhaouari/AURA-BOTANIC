<script setup lang="ts">
import { Play, Leaf, ShieldCheck, Timer, Droplets, Star } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { PRODUCTS, HERO_IMAGE, type ProductCategory } from '~/data/products'

const { t } = useI18n()
const localePath = useLocalePath()
const { addToCart, formatMoney, subscribeNewsletter } = useCommerce()

useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('hero.subtitle'),
})

const searchOpen = ref(false)
const accountOpen = ref(false)
const cartOpen = ref(false)
const checkoutOpen = ref(false)
const videoOpen = ref(false)

const activeFilter = ref<ProductCategory>('all')
const filteredProducts = computed(() =>
  activeFilter.value === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeFilter.value),
)

const filters: ProductCategory[] = ['all', 'facial', 'single', 'body']

const newsletterEmail = ref('')

function addProduct(id: string) {
  if (!addToCart(id)) return
  cartOpen.value = true
  toast.success(t(`products.${id}.name`), { description: t('cart.addedToast') })
}

function onNewsletter(e: Event) {
  e.preventDefault()
  if (!subscribeNewsletter(newsletterEmail.value)) return
  toast.success(t('toast.welcomeRitual'), {
    description: t('toast.promo', { email: newsletterEmail.value }),
  })
  newsletterEmail.value = ''
}
</script>

<template>
  <div class="min-h-screen">
    <SiteHeader
      @open-search="searchOpen = true"
      @open-account="accountOpen = true"
      @open-cart="cartOpen = true"
    />

    <SiteCommerceOverlays
      v-model:search-open="searchOpen"
      v-model:account-open="accountOpen"
      v-model:cart-open="cartOpen"
      v-model:checkout-open="checkoutOpen"
      v-model:video-open="videoOpen"
    />

    <main>
      <!-- Hero -->
      <section class="relative overflow-hidden py-12 md:py-20">
        <div class="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_top,rgba(183,205,168,0.35),transparent_70%)]" />
        <div class="relative mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-8">
          <div class="space-y-6">
            <Badge variant="secondary" class="gap-1.5 rounded-full px-3 py-1">
              <Leaf class="size-3.5" />
              {{ t('hero.badge') }}
            </Badge>
            <h1 class="font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
              {{ t('hero.title') }}
            </h1>
            <p class="max-w-xl text-muted-foreground text-lg">{{ t('hero.subtitle') }}</p>
            <div class="flex flex-wrap gap-3">
              <Button as-child size="lg" class="rounded-xl">
                <NuxtLink :to="localePath('/#products')">{{ t('hero.ctaShop') }}</NuxtLink>
              </Button>
              <Button variant="ghost" size="lg" class="gap-2 rounded-xl" @click="videoOpen = true">
                <span class="flex size-8 items-center justify-center rounded-full border">
                  <Play class="size-4" />
                </span>
                {{ t('hero.ctaVideo') }}
              </Button>
            </div>
            <div class="flex flex-wrap gap-4 border-t pt-6 text-sm text-muted-foreground">
              <span class="inline-flex items-center gap-1.5"><ShieldCheck class="size-4 text-primary" />{{ t('hero.trustOrganic') }}</span>
              <span class="inline-flex items-center gap-1.5"><Timer class="size-4 text-primary" />{{ t('hero.trustCold') }}</span>
              <span class="inline-flex items-center gap-1.5"><Droplets class="size-4 text-primary" />{{ t('hero.trustZero') }}</span>
            </div>
          </div>
          <div class="relative">
            <img :src="HERO_IMAGE" alt="" class="h-[420px] w-full rounded-2xl border object-cover shadow-lg md:h-[520px]" />
            <Card class="absolute bottom-4 start-4 end-4 max-w-sm border-border/60 bg-background/95 backdrop-blur md:end-auto">
              <CardContent class="flex gap-3 p-4">
                <div class="flex size-12 items-center justify-center rounded-lg bg-muted">
                  <ShieldCheck class="size-6 text-primary" />
                </div>
                <div>
                  <p class="font-medium">{{ t('hero.floatTitle') }}</p>
                  <p class="text-sm text-muted-foreground">{{ t('hero.floatDesc') }}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Products -->
      <section id="products" class="py-16 md:py-20">
        <div class="mx-auto max-w-6xl px-4 md:px-8">
          <div class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-secondary">{{ t('products.eyebrow') }}</p>
              <h2 class="mt-1 font-display text-3xl md:text-4xl">{{ t('products.title') }}</h2>
              <p class="mt-2 max-w-xl text-muted-foreground">{{ t('products.subtitle') }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="f in filters"
                :key="f"
                size="sm"
                :variant="activeFilter === f ? 'default' : 'secondary'"
                class="rounded-full"
                @click="activeFilter = f"
              >
                {{ t(`products.filters.${f}`) }}
              </Button>
            </div>
          </div>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              v-for="p in filteredProducts"
              :id="`product-${p.id}`"
              :key="p.id"
              class="overflow-hidden border-border/60 transition-shadow hover:shadow-lg"
            >
              <div class="relative aspect-square overflow-hidden bg-muted">
                <img :src="p.image" :alt="t(`products.${p.id}.name`)" class="size-full object-cover transition-transform duration-500 hover:scale-105" />
                <Badge class="absolute start-3 top-3">{{ t(`products.${p.id}.badge`) }}</Badge>
                <Badge variant="secondary" class="absolute bottom-3 end-3 gap-1">
                  <Star class="size-3 fill-current" />{{ p.rating }}
                </Badge>
              </div>
              <CardHeader>
                <p class="text-xs font-semibold uppercase tracking-wide text-secondary">{{ t(`products.${p.id}.origin`) }}</p>
                <CardTitle class="text-lg">{{ t(`products.${p.id}.name`) }}</CardTitle>
                <CardDescription>{{ t(`products.${p.id}.desc`) }}</CardDescription>
              </CardHeader>
              <CardFooter class="flex items-center justify-between border-t pt-4">
                <div>
                  <p class="text-xs text-muted-foreground">{{ t(`products.${p.id}.volume`) }}</p>
                  <p class="text-lg font-semibold">{{ formatMoney(p.price) }}</p>
                </div>
                <Button class="rounded-xl" @click="addProduct(p.id)">{{ t('products.addToCart') }}</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <!-- Story -->
      <section id="story" class="border-y bg-muted/30 py-16 md:py-20">
        <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-8">
          <img :src="HERO_IMAGE" alt="" class="h-80 w-full rounded-2xl object-cover md:h-[420px]" />
          <div class="space-y-5">
            <p class="text-xs font-semibold uppercase tracking-widest text-secondary">{{ t('story.eyebrow') }}</p>
            <h2 class="font-display text-3xl leading-tight md:text-4xl">{{ t('story.title') }}</h2>
            <p class="text-muted-foreground">{{ t('story.p1') }}</p>
            <p class="text-muted-foreground">{{ t('story.p2') }}</p>
            <div class="grid grid-cols-3 gap-4 border-y py-4 text-center">
              <div><p class="text-2xl font-semibold text-primary">98%</p><p class="text-xs text-muted-foreground">{{ t('story.statGlass') }}</p></div>
              <div><p class="text-2xl font-semibold text-primary">0%</p><p class="text-xs text-muted-foreground">{{ t('story.statHexane') }}</p></div>
              <div><p class="text-2xl font-semibold text-primary">14</p><p class="text-xs text-muted-foreground">{{ t('story.statCoops') }}</p></div>
            </div>
            <Button variant="link" class="px-0" as-child>
              <NuxtLink :to="localePath('/#charter')">{{ t('story.link') }}</NuxtLink>
            </Button>
          </div>
        </div>
      </section>

      <!-- Reviews -->
      <section class="py-16 md:py-20">
        <div class="mx-auto max-w-6xl px-4 md:px-8">
          <div class="mx-auto mb-12 max-w-2xl text-center">
            <p class="text-xs font-semibold uppercase tracking-wider text-secondary">{{ t('reviews.eyebrow') }}</p>
            <h2 class="mt-2 font-display text-3xl">{{ t('reviews.title') }}</h2>
            <p class="mt-2 text-muted-foreground">{{ t('reviews.subtitle') }}</p>
          </div>
          <div class="grid gap-6 md:grid-cols-3">
            <Card v-for="review in ['t1', 't2', 't3']" :key="review">
              <CardContent class="space-y-4 pt-6">
                <div class="flex gap-0.5 text-amber-600">
                  <Star v-for="i in 5" :key="i" class="size-4 fill-current" />
                </div>
                <p class="text-sm italic">{{ t(`reviews.${review}`) }}</p>
                <Separator />
                <p class="font-medium">{{ t(`reviews.${review}Name`) }}</p>
                <p class="text-xs text-muted-foreground">{{ t(`reviews.${review}Meta`) }}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section id="newsletter" class="bg-muted/50 py-16 md:py-20">
        <Card class="mx-auto max-w-2xl border-border/60">
          <CardHeader class="text-center">
            <CardTitle class="font-display text-3xl">{{ t('newsletter.title') }}</CardTitle>
            <CardDescription>{{ t('newsletter.subtitle') }}</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="flex flex-col gap-3 sm:flex-row" @submit="onNewsletter">
              <Input v-model="newsletterEmail" type="email" required :placeholder="t('newsletter.placeholder')" class="h-11" />
              <Button type="submit" class="h-11 shrink-0 rounded-xl px-8">{{ t('newsletter.submit') }}</Button>
            </form>
            <p class="mt-3 text-center text-xs text-muted-foreground">{{ t('newsletter.fine') }}</p>
          </CardContent>
        </Card>
      </section>
    </main>

    <footer id="charter" class="border-t bg-muted/30 py-14">
      <div class="mx-auto max-w-6xl px-4 md:px-8">
        <div class="grid gap-10 md:grid-cols-4">
          <div class="md:col-span-2 space-y-3">
            <p class="font-display text-lg font-semibold">AURA BOTANICA</p>
            <p class="max-w-sm text-sm text-muted-foreground">{{ t('footer.blurb') }}</p>
          </div>
          <div>
            <p class="mb-3 font-medium text-primary">{{ t('footer.collections') }}</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li><NuxtLink :to="localePath('/#products')" class="hover:text-primary">{{ t('products.filters.all') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/#products')" class="hover:text-primary">{{ t('products.filters.single') }}</NuxtLink></li>
            </ul>
          </div>
          <div>
            <p class="mb-3 font-medium text-primary">{{ t('footer.purity') }}</p>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li><button type="button" class="hover:text-primary" @click="videoOpen = true">{{ t('video.title') }}</button></li>
              <li><NuxtLink :to="localePath('/#story')" class="hover:text-primary">{{ t('nav.story') }}</NuxtLink></li>
            </ul>
          </div>
        </div>
        <Separator class="my-8" />
        <p class="text-center text-sm text-muted-foreground">{{ t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-display {
  font-family: var(--font-display);
}
html[dir='rtl'] .font-display {
  font-family: 'Amiri', 'Noto Sans Arabic', serif;
}
</style>

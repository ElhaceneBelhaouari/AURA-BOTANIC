<script setup lang="ts">

import {

  Menu,

  Search,

  User,

  ShoppingBag,

  X,

  Globe,

  ChevronRight,

  Leaf,

  BookOpen,

  Flower2,

  Sparkles,

} from 'lucide-vue-next'

import type { Component } from 'vue'



const { t, locale, locales, setLocale } = useI18n()

const localePath = useLocalePath()



const { count } = useCommerce()

const mobileOpen = ref(false)

const announceDismissed = useState('announce-dismissed', () => false)



onMounted(() => {

  if (import.meta.client && localStorage.getItem('aura_announcement') === '1') {

    announceDismissed.value = true

  }

})



function dismissAnnounce() {

  announceDismissed.value = true

  if (import.meta.client) localStorage.setItem('aura_announcement', '1')

}



const emit = defineEmits<{

  openSearch: []

  openAccount: []

  openCart: []

}>()



const availableLocales = computed(() =>

  locales.value.filter((l) => l.code === 'fr' || l.code === 'ar'),

)



type MobileLink = {

  hash: string

  labelKey: 'shop' | 'story' | 'botanicals' | 'rituals'

  icon: Component

  featured?: boolean

}



const mobileLinks: MobileLink[] = [

  { hash: '#products', labelKey: 'shop', icon: ShoppingBag, featured: true },

  { hash: '#story', labelKey: 'story', icon: BookOpen },

  { hash: '#products', labelKey: 'botanicals', icon: Flower2 },

  { hash: '#newsletter', labelKey: 'rituals', icon: Sparkles },

]



async function changeLocale(code: string) {

  await setLocale(code)

  mobileOpen.value = false

}



function closeMobile() {

  mobileOpen.value = false

}



function openFromMenu(action: 'search' | 'account' | 'cart') {

  mobileOpen.value = false

  nextTick(() => {

    if (action === 'search') emit('openSearch')

    else if (action === 'account') emit('openAccount')

    else emit('openCart')

  })

}



const sheetSide = computed(() => (locale.value === 'ar' ? 'left' : 'right'))

</script>



<template>

  <div

    v-if="!announceDismissed"

    class="relative bg-primary text-primary-foreground py-2.5 px-4 text-center text-xs md:text-sm"

  >

    <p class="pe-8">{{ t('announcement') }}</p>

    <button

      type="button"

      class="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-white/10"

      :aria-label="t('nav.menu')"

      @click="dismissAnnounce"

    >

      <X class="size-4" />

    </button>

  </div>



  <header class="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">

    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">

      <NuxtLink :to="localePath('/')" class="font-display text-lg font-semibold tracking-tight md:text-xl">

        AURA BOTANICA

      </NuxtLink>



      <nav class="hidden items-center gap-6 text-sm font-medium md:flex">

        <NuxtLink :to="localePath('/#products')" class="text-primary underline-offset-4 hover:underline">

          {{ t('nav.shop') }}

        </NuxtLink>

        <NuxtLink :to="localePath('/#story')" class="text-muted-foreground hover:text-primary">

          {{ t('nav.story') }}

        </NuxtLink>

        <NuxtLink :to="localePath('/#products')" class="text-muted-foreground hover:text-primary">

          {{ t('nav.botanicals') }}

        </NuxtLink>

        <NuxtLink :to="localePath('/#newsletter')" class="text-muted-foreground hover:text-primary">

          {{ t('nav.rituals') }}

        </NuxtLink>

      </nav>



      <div class="flex items-center gap-1 md:gap-2">

        <DropdownMenu>

          <DropdownMenuTrigger as-child>

            <Button variant="ghost" size="icon" :aria-label="t('nav.language')">

              <Globe class="size-5" />

            </Button>

          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            <DropdownMenuItem

              v-for="loc in availableLocales"

              :key="loc.code"

              :class="{ 'font-semibold': locale === loc.code }"

              @click="changeLocale(loc.code)"

            >

              {{ loc.name }}

            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>



        <Button variant="ghost" size="icon" :aria-label="t('nav.search')" @click="emit('openSearch')">

          <Search class="size-5" />

        </Button>

        <Button variant="ghost" size="icon" :aria-label="t('nav.account')" @click="emit('openAccount')">

          <User class="size-5" />

        </Button>

        <Button variant="ghost" size="icon" class="relative" :aria-label="t('nav.cart')" @click="emit('openCart')">

          <ShoppingBag class="size-5" />

          <Badge

            v-if="count > 0"

            class="absolute -top-0.5 -end-0.5 size-4 justify-center rounded-full p-0 text-[10px]"

          >

            {{ count }}

          </Badge>

        </Button>

        <Button

          variant="ghost"

          size="icon"

          class="md:hidden"

          :aria-label="t('nav.menu')"

          @click="mobileOpen = true"

        >

          <Menu class="size-5" />

        </Button>

      </div>

    </div>

  </header>



  <Sheet v-model:open="mobileOpen">

    <SheetContent

      :side="sheetSide"

      :show-close-button="false"

      class="flex w-[min(100%,22rem)] flex-col gap-0 border-border/60 bg-gradient-to-b from-background via-card/95 to-muted/50 p-0 shadow-2xl duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:max-w-sm"

    >

      <div class="relative shrink-0 overflow-hidden border-b border-border/50 px-6 pb-5 pt-6">

        <div

          class="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"

          aria-hidden="true"

        />

        <div

          class="pointer-events-none absolute -bottom-8 start-0 size-32 rounded-full bg-secondary/10 blur-2xl"

          aria-hidden="true"

        />

        <div class="relative flex items-start justify-between gap-3">

          <SheetHeader class="space-y-2 p-0 text-start">

            <div class="flex items-center gap-2 text-primary">

              <span class="flex size-8 items-center justify-center rounded-full bg-primary/10">

                <Leaf class="size-4" aria-hidden="true" />

              </span>

              <span class="text-[10px] font-semibold uppercase tracking-[0.2em]">{{ t('nav.menuExplore') }}</span>

            </div>

            <SheetTitle class="font-display text-2xl leading-tight tracking-tight">AURA BOTANICA</SheetTitle>

            <SheetDescription class="text-sm leading-relaxed text-muted-foreground">

              {{ t('nav.menuSubtitle') }}

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

      </div>



      <nav class="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-5" :aria-label="t('nav.menuExplore')">

        <NuxtLink

          v-for="(link, index) in mobileLinks"

          :key="`${link.labelKey}-${index}`"

          :to="`${localePath('/')}${link.hash}`"

          class="mobile-nav-link group flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors active:scale-[0.99]"

          :class="

            link.featured

              ? 'border-primary/25 bg-primary/8 text-foreground shadow-sm hover:bg-primary/12'

              : 'border-border/50 bg-background/60 hover:border-primary/20 hover:bg-accent/80'

          "

          :style="{ '--nav-i': index }"

          @click="closeMobile"

        >

          <span

            class="flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"

            :class="link.featured ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary group-hover:bg-primary/10'"

          >

            <component :is="link.icon" class="size-[1.125rem]" aria-hidden="true" />

          </span>

          <span class="min-w-0 flex-1">

            <span class="block text-base font-medium leading-tight">{{ t(`nav.${link.labelKey}`) }}</span>

          </span>

          <ChevronRight

            class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5"

            aria-hidden="true"

          />

        </NuxtLink>

      </nav>



      <div class="mobile-nav-footer shrink-0 space-y-4 border-t border-border/50 bg-background/70 px-4 py-5 backdrop-blur-sm">

        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">

          {{ t('nav.menuQuick') }}

        </p>

        <div class="grid grid-cols-3 gap-2">

          <Button

            type="button"

            variant="secondary"

            class="h-auto flex-col gap-1.5 rounded-xl py-3 text-xs"

            @click="openFromMenu('search')"

          >

            <Search class="size-4" />

            {{ t('nav.search') }}

          </Button>

          <Button

            type="button"

            variant="secondary"

            class="h-auto flex-col gap-1.5 rounded-xl py-3 text-xs"

            @click="openFromMenu('account')"

          >

            <User class="size-4" />

            {{ t('nav.account') }}

          </Button>

          <Button

            type="button"

            variant="secondary"

            class="relative h-auto flex-col gap-1.5 rounded-xl py-3 text-xs"

            @click="openFromMenu('cart')"

          >

            <ShoppingBag class="size-4" />

            {{ t('nav.cart') }}

            <Badge

              v-if="count > 0"

              class="absolute end-2 top-2 size-4 justify-center rounded-full p-0 text-[9px]"

            >

              {{ count }}

            </Badge>

          </Button>

        </div>

        <div class="flex gap-2">

          <Button

            v-for="loc in availableLocales"

            :key="loc.code"

            type="button"

            size="sm"

            :variant="locale === loc.code ? 'default' : 'outline'"

            class="flex-1 rounded-full"

            @click="changeLocale(loc.code)"

          >

            {{ loc.name }}

          </Button>

        </div>

      </div>

    </SheetContent>

  </Sheet>

</template>



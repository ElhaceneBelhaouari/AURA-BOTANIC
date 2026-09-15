<script setup lang="ts">
const { locale, locales } = useI18n()

useHead(() => {
  const current = locales.value.find((l) => l.code === locale.value)
  return {
    htmlAttrs: {
      lang: locale.value,
      dir: current?.dir ?? 'ltr',
    },
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Sonner rich-colors position="top-center" />
  </div>
</template>

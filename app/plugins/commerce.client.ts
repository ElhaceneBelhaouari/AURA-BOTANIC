export default defineNuxtPlugin(() => {
  const { hydrateFromStorage } = useCommerce()
  hydrateFromStorage()
})

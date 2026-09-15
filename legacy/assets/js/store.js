const STORAGE = {
  cart: "aura_cart_v1",
  user: "aura_user_v1",
  newsletter: "aura_newsletter_v1",
  announcement: "aura_announcement_dismissed",
  orders: "aura_orders_v1",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** @type {Map<string, { id: string, name: string, price: number, volume: string, category: string, image: string }>} */
let catalog = new Map();

export function registerCatalogFromDom() {
  catalog = new Map();
  document.querySelectorAll("[data-product-card]").forEach((card) => {
    const id = card.dataset.productId;
    if (!id) return;
    const img = card.querySelector("img");
    catalog.set(id, {
      id,
      name: card.querySelector("h3")?.textContent?.trim() || id,
      price: parseFloat(card.dataset.productPrice || "0"),
      volume: card.querySelector("[data-product-volume]")?.textContent?.trim() || "",
      category: card.dataset.category || "all",
      image: img?.getAttribute("src") || "",
    });
  });
}

export function getProduct(id) {
  return catalog.get(id);
}

export function getAllProducts() {
  return [...catalog.values()];
}

export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return getAllProducts();
  return getAllProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.volume.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function getCart() {
  return read(STORAGE.cart, { lines: [] });
}

function saveCart(cart) {
  write(STORAGE.cart, cart);
  window.dispatchEvent(new CustomEvent("aura:cart"));
}

export function getCartCount() {
  return getCart().lines.reduce((n, line) => n + line.qty, 0);
}

export function getCartSubtotal() {
  return getCart().lines.reduce((sum, line) => {
    const p = getProduct(line.id);
    return sum + (p?.price || 0) * line.qty;
  }, 0);
}

export function addToCart(productId, qty = 1) {
  if (!getProduct(productId)) return false;
  const cart = getCart();
  const existing = cart.lines.find((l) => l.id === productId);
  if (existing) existing.qty += qty;
  else cart.lines.push({ id: productId, qty });
  saveCart(cart);
  return true;
}

export function setLineQty(productId, qty) {
  const cart = getCart();
  const line = cart.lines.find((l) => l.id === productId);
  if (!line) return;
  if (qty <= 0) {
    cart.lines = cart.lines.filter((l) => l.id !== productId);
  } else {
    line.qty = qty;
  }
  saveCart(cart);
}

export function removeFromCart(productId) {
  setLineQty(productId, 0);
}

export function clearCart() {
  saveCart({ lines: [] });
}

export function getUser() {
  return read(STORAGE.user, null);
}

export function signIn({ email, password }) {
  if (!email?.includes("@") || !password || password.length < 6) {
    return { ok: false, error: "Enter a valid email and password (6+ characters)." };
  }
  const user = { email, name: email.split("@")[0], signedInAt: Date.now() };
  write(STORAGE.user, user);
  window.dispatchEvent(new CustomEvent("aura:user"));
  return { ok: true, user };
}

export function signOut() {
  localStorage.removeItem(STORAGE.user);
  window.dispatchEvent(new CustomEvent("aura:user"));
}

export function subscribeNewsletter(email) {
  if (!email?.includes("@")) return { ok: false, error: "Enter a valid email." };
  const list = read(STORAGE.newsletter, []);
  if (!list.includes(email)) list.push(email);
  write(STORAGE.newsletter, list);
  return { ok: true };
}

export function isAnnouncementDismissed() {
  return localStorage.getItem(STORAGE.announcement) === "1";
}

export function dismissAnnouncement() {
  localStorage.setItem(STORAGE.announcement, "1");
}

export function placeOrder({ name, email, address }) {
  const cart = getCart();
  if (!cart.lines.length) return { ok: false, error: "Your ritual bag is empty." };
  if (!name?.trim() || !email?.includes("@") || !address?.trim()) {
    return { ok: false, error: "Complete all checkout fields." };
  }
  const order = {
    id: `AB-${Date.now().toString(36).toUpperCase()}`,
    createdAt: Date.now(),
    name,
    email,
    address,
    lines: cart.lines.map((l) => ({ ...l, product: getProduct(l.id) })),
    subtotal: getCartSubtotal(),
    shipping: getCartSubtotal() >= 65 ? 0 : 8,
  };
  order.total = order.subtotal + order.shipping;
  const orders = read(STORAGE.orders, []);
  orders.unshift(order);
  write(STORAGE.orders, orders);
  clearCart();
  return { ok: true, order };
}

export function getOrders(email) {
  const orders = read(STORAGE.orders, []);
  if (!email) return orders;
  return orders.filter((o) => o.email === email);
}

export function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

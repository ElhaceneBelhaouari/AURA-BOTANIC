import {
  addToCart,
  clearCart,
  formatMoney,
  getCart,
  getCartCount,
  getCartSubtotal,
  getOrders,
  getProduct,
  getUser,
  placeOrder,
  removeFromCart,
  searchProducts,
  setLineQty,
  signIn,
  signOut,
  subscribeNewsletter,
} from "./store.js";

let scrollToSection = (selector) => {
  const el = document.querySelector(selector);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export function setScrollHandler(fn) {
  scrollToSection = fn;
}

export function showToast({ icon = "info", title, message }) {
  const stack = document.querySelector(".toast-stack");
  if (!stack) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span class="material-symbols-outlined text-primary text-xl">${icon}</span>
    <div>
      <p class="font-label-md text-label-md text-on-surface">${title}</p>
      ${message ? `<p class="font-body-sm text-body-sm text-on-surface-variant">${message}</p>` : ""}
    </div>`;
  stack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 450);
  }, 3200);
}

function trapFocus(panel) {
  const focusable = panel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

function openOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  const focusTarget = el.querySelector("[data-autofocus]") || el.querySelector("button, input");
  focusTarget?.focus();
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".app-overlay.is-open")) {
    document.body.classList.remove("overlay-open");
  }
}

export function initOverlays() {
  document.querySelectorAll("[data-close-overlay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close-overlay");
      if (id) closeOverlay(id);
      if (id === "video-overlay") pauseVideo();
    });
  });

  document.querySelectorAll(".app-overlay").forEach((overlay) => {
    trapFocus(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay.querySelector("[data-overlay-backdrop]")) {
        closeOverlay(overlay.id);
        if (overlay.id === "video-overlay") pauseVideo();
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".app-overlay.is-open").forEach((o) => {
        closeOverlay(o.id);
        if (o.id === "video-overlay") pauseVideo();
      });
      if (document.getElementById("cart-drawer")?.classList.contains("is-open")) {
        closeCart();
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
  });
}

function pauseVideo() {
  const video = document.querySelector("#video-overlay video");
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
}

export function openSearch() {
  openOverlay("search-overlay");
  const input = document.querySelector("#search-input");
  input?.focus();
  renderSearchResults(input?.value || "");
}

export function openAccount() {
  openOverlay("account-overlay");
  renderAccountPanel();
}

export function openVideo() {
  openOverlay("video-overlay");
  const video = document.querySelector("#video-overlay video");
  video?.play().catch(() => {});
}

export function openCart() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.querySelector("[data-cart-backdrop]");
  drawer?.classList.add("is-open");
  backdrop?.classList.add("is-open");
  drawer?.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  renderCart();
}

export function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.querySelector("[data-cart-backdrop]");
  drawer?.classList.remove("is-open");
  backdrop?.classList.remove("is-open");
  drawer?.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".app-overlay.is-open")) {
    document.body.classList.remove("overlay-open");
  }
}

export function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = String(count);
  badge.classList.toggle("hidden", count === 0);
  if (count > 0) {
    badge.classList.remove("is-bump");
    void badge.offsetWidth;
    badge.classList.add("is-bump");
  }
}

export function renderCart() {
  const list = document.querySelector("[data-cart-lines]");
  const subtotalEl = document.querySelector("[data-cart-subtotal]");
  const shippingEl = document.querySelector("[data-cart-shipping]");
  const totalEl = document.querySelector("[data-cart-total]");
  const progressEl = document.querySelector("[data-shipping-progress]");
  const emptyEl = document.querySelector("[data-cart-empty]");
  const footerEl = document.querySelector("[data-cart-footer]");
  if (!list) return;

  const cart = getCart();
  const subtotal = getCartSubtotal();
  const shipping = subtotal >= 65 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  if (!cart.lines.length) {
    list.innerHTML = "";
    emptyEl?.classList.remove("hidden");
    footerEl?.classList.add("hidden");
    return;
  }

  emptyEl?.classList.add("hidden");
  footerEl?.classList.remove("hidden");

  list.innerHTML = cart.lines
    .map((line) => {
      const p = getProduct(line.id);
      if (!p) return "";
      return `
        <li class="flex gap-3 py-4 border-b border-outline-variant/30" data-cart-line="${p.id}">
          <img alt="" class="w-16 h-16 rounded-lg object-cover bg-surface-container" src="${p.image}" width="64" height="64"/>
          <div class="flex-1 min-w-0">
            <p class="font-label-lg text-label-lg text-on-surface truncate">${p.name}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">${p.volume}</p>
            <p class="font-label-md text-label-md text-on-surface mt-1">${formatMoney(p.price)}</p>
            <div class="flex items-center gap-2 mt-2">
              <button type="button" class="qty-btn w-8 h-8 rounded-lg border border-outline-variant/50 flex items-center justify-center" data-qty-dec aria-label="Decrease quantity">
                <span class="material-symbols-outlined text-base">remove</span>
              </button>
              <span class="font-label-md text-label-md w-6 text-center tabular-nums" data-qty-display>${line.qty}</span>
              <button type="button" class="qty-btn w-8 h-8 rounded-lg border border-outline-variant/50 flex items-center justify-center" data-qty-inc aria-label="Increase quantity">
                <span class="material-symbols-outlined text-base">add</span>
              </button>
              <button type="button" class="ml-auto text-on-surface-variant hover:text-secondary text-sm font-label-sm" data-remove-line>Remove</button>
            </div>
          </div>
        </li>`;
    })
    .join("");

  list.querySelectorAll("[data-cart-line]").forEach((row) => {
    const id = row.getAttribute("data-cart-line");
    row.querySelector("[data-qty-dec]")?.addEventListener("click", () => {
      const line = getCart().lines.find((l) => l.id === id);
      if (line) setLineQty(id, line.qty - 1);
      renderCart();
      updateCartBadge();
    });
    row.querySelector("[data-qty-inc]")?.addEventListener("click", () => {
      const line = getCart().lines.find((l) => l.id === id);
      if (line) setLineQty(id, line.qty + 1);
      renderCart();
      updateCartBadge();
    });
    row.querySelector("[data-remove-line]")?.addEventListener("click", () => {
      removeFromCart(id);
      renderCart();
      updateCartBadge();
      showToast({ icon: "delete", title: "Removed from bag" });
    });
  });

  subtotalEl.textContent = formatMoney(subtotal);
  shippingEl.textContent = shipping === 0 ? "Free" : formatMoney(shipping);
  totalEl.textContent = formatMoney(total);

  if (progressEl) {
    const pct = Math.min(100, (subtotal / 65) * 100);
    progressEl.style.width = `${pct}%`;
    const label = document.querySelector("[data-shipping-label]");
    if (label) {
      label.textContent =
        subtotal >= 65
          ? "You unlocked free carbon-neutral shipping"
          : `${formatMoney(65 - subtotal)} away from free shipping`;
    }
  }
}

function renderSearchResults(query) {
  const results = document.querySelector("[data-search-results]");
  if (!results) return;
  const items = searchProducts(query);
  if (!items.length) {
    results.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant p-4">No botanicals match “${query}”.</p>`;
    return;
  }
  results.innerHTML = items
    .map(
      (p) => `
    <button type="button" class="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors" data-search-pick="${p.id}">
      <img alt="" class="w-12 h-12 rounded-lg object-cover" src="${p.image}" width="48" height="48"/>
      <div>
        <p class="font-label-lg text-label-lg text-on-surface">${p.name}</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${p.volume} · ${formatMoney(p.price)}</p>
      </div>
    </button>`
    )
    .join("");

  results.querySelectorAll("[data-search-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-search-pick");
      closeOverlay("search-overlay");
      const card = document.querySelector(`[data-product-id="${id}"]`);
      if (card) {
        scrollToSection(`[data-product-id="${id}"]`);
        card.classList.add("ring-2", "ring-primary-container");
        setTimeout(() => card.classList.remove("ring-2", "ring-primary-container"), 2000);
      }
    });
  });
}

function renderAccountPanel() {
  const root = document.querySelector("[data-account-root]");
  if (!root) return;
  const user = getUser();

  if (user) {
    const orders = getOrders(user.email);
    root.innerHTML = `
      <p class="font-body-md text-body-md text-on-surface-variant mb-4">Signed in as <strong class="text-on-surface">${user.email}</strong></p>
      <div class="space-y-3 mb-6 max-h-48 overflow-y-auto" data-lenis-prevent>
        ${
          orders.length
            ? orders
                .map(
                  (o) => `
          <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <p class="font-label-md text-label-md text-on-surface">${o.id}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">${new Date(o.createdAt).toLocaleDateString()} · ${formatMoney(o.total)}</p>
          </div>`
                )
                .join("")
            : `<p class="font-body-sm text-body-sm text-on-surface-variant">No orders yet — your harvest awaits.</p>`
        }
      </div>
      <button type="button" class="w-full h-11 rounded-xl border border-outline-variant/60 font-label-lg text-label-lg" data-sign-out>Sign out</button>`;
    root.querySelector("[data-sign-out]")?.addEventListener("click", () => {
      signOut();
      showToast({ icon: "logout", title: "Signed out" });
      closeOverlay("account-overlay");
      renderAccountPanel();
    });
    return;
  }

  root.innerHTML = `
    <form class="space-y-4" data-sign-in-form>
      <div>
        <label class="font-label-md text-label-md text-on-surface-variant block mb-1" for="account-email">Email</label>
        <input class="w-full h-11 px-4 rounded-xl bg-surface border border-outline-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" id="account-email" name="email" type="email" required autocomplete="email" data-autofocus/>
      </div>
      <div>
        <label class="font-label-md text-label-md text-on-surface-variant block mb-1" for="account-password">Password</label>
        <input class="w-full h-11 px-4 rounded-xl bg-surface border border-outline-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" id="account-password" name="password" type="password" required minlength="6" autocomplete="current-password"/>
      </div>
      <p class="font-body-sm text-body-sm text-error hidden" data-form-error></p>
      <button type="submit" class="btn-primary w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg">Sign in</button>
      <p class="font-body-sm text-body-sm text-on-surface-variant text-center">Demo account — credentials stay on this device only.</p>
    </form>`;

  root.querySelector("[data-sign-in-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const err = form.querySelector("[data-form-error]");
    const result = signIn({ email, password });
    if (!result.ok) {
      err.textContent = result.error;
      err.classList.remove("hidden");
      return;
    }
    err.classList.add("hidden");
    showToast({ icon: "person", title: "Welcome back", message: result.user.email });
    closeOverlay("account-overlay");
  });
}

export function initCommerceUi() {
  document.querySelector("[data-open-search]")?.addEventListener("click", openSearch);
  document.querySelector("[data-open-account]")?.addEventListener("click", openAccount);
  document.querySelector("[data-open-cart]")?.addEventListener("click", openCart);
  document.querySelector("[data-close-cart]")?.addEventListener("click", closeCart);
  document.querySelector("[data-cart-backdrop]")?.addEventListener("click", closeCart);

  document.querySelector("[data-open-video]")?.addEventListener("click", openVideo);

  const searchInput = document.querySelector("#search-input");
  searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));

  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest("[data-product-card]");
      const id = card?.dataset.productId;
      if (!id || !addToCart(id)) return;
      const p = getProduct(id);
      updateCartBadge();
      showToast({
        icon: "shopping_bag",
        title: p?.name || "Added",
        message: "Added to your ritual bag",
      });
      btn.disabled = true;
      const label = btn.querySelector("span:last-child");
      const prev = label?.textContent;
      if (label) label.textContent = "Added";
      setTimeout(() => {
        btn.disabled = false;
        if (label && prev) label.textContent = prev;
      }, 1200);
    });
  });

  document.querySelector("[data-checkout-open]")?.addEventListener("click", () => {
    if (!getCart().lines.length) {
      showToast({ icon: "shopping_bag", title: "Bag is empty", message: "Add a harvest first." });
      return;
    }
    closeCart();
    openOverlay("checkout-overlay");
    const user = getUser();
    const form = document.querySelector("[data-checkout-form]");
    if (form && user) {
      form.email.value = user.email;
    }
  });

  document.querySelector("[data-checkout-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const err = form.querySelector("[data-checkout-error]");
    const result = placeOrder({
      name: form.name.value,
      email: form.email.value,
      address: form.address.value,
    });
    if (!result.ok) {
      err.textContent = result.error;
      err.classList.remove("hidden");
      return;
    }
    err.classList.add("hidden");
    closeOverlay("checkout-overlay");
    updateCartBadge();
    renderCart();
    showToast({
      icon: "local_shipping",
      title: `Order ${result.order.id} confirmed`,
      message: `Total ${formatMoney(result.order.total)} — shipping ${result.order.shipping === 0 ? "free" : formatMoney(result.order.shipping)}.`,
    });
    form.reset();
  });

  document.querySelector("[data-clear-cart]")?.addEventListener("click", () => {
    clearCart();
    updateCartBadge();
    renderCart();
    showToast({ icon: "delete_sweep", title: "Bag cleared" });
  });

  document.querySelectorAll("[data-footer-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const action = el.dataset.footerAction;
      if (action === "shop-all") {
        scrollToSection("#featured-products");
        document.querySelector('.filter-pill[data-filter="all"]')?.click();
      } else if (action.startsWith("filter:")) {
        const f = action.split(":")[1];
        scrollToSection("#featured-products");
        document.querySelector(`.filter-pill[data-filter="${f}"]`)?.click();
      } else if (action.startsWith("scroll:")) {
        scrollToSection(`#${action.split(":")[1]}`);
      } else if (action === "video") {
        openVideo();
      } else if (action === "account") {
        openAccount();
      } else if (action === "newsletter") {
        scrollToSection("#ritual-newsletter");
      } else if (action === "external-instagram") {
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      } else {
        showToast({
          icon: "menu_book",
          title: el.textContent.trim(),
          message: "Full content ships with the apothecary journal soon.",
        });
      }
    });
  });

  window.addEventListener("aura:cart", () => {
    updateCartBadge();
    if (document.getElementById("cart-drawer")?.classList.contains("is-open")) {
      renderCart();
    }
  });

  updateCartBadge();
  renderCart();
}

export function initNewsletterForm() {
  const form = document.querySelector("[data-newsletter]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type=email]");
    const result = subscribeNewsletter(input?.value);
    if (!result.ok) {
      showToast({ icon: "error", title: "Subscription failed", message: result.error });
      return;
    }
    showToast({
      icon: "spa",
      title: "Welcome to the ritual",
      message: `15% off sent to ${input.value}`,
    });
    form.reset();
  });
}

import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm";
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.18/+esm";
import { dismissAnnouncement, isAnnouncementDismissed, registerCatalogFromDom } from "./store.js";
import {
  initCommerceUi,
  initNewsletterForm,
  initOverlays,
  setScrollHandler,
} from "./ui.js";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lenisInstance = null;

function initSmoothScroll() {
  if (prefersReducedMotion) {
    setScrollHandler((selector) => {
      document.querySelector(selector)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return null;
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenisInstance = lenis;

  setScrollHandler((selector) => {
    const target = document.querySelector(selector);
    if (target) lenis.scrollTo(target, { offset: -80 });
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80 });
    });
  });

  return lenis;
}

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    if (y > 120 && y > lastY + 8) {
      header.classList.add("is-hidden");
    } else if (y < lastY - 8 || y < 80) {
      header.classList.remove("is-hidden");
    }
    lastY = y;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero || prefersReducedMotion) return;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from("[data-hero-badge]", { y: 16, opacity: 0, duration: 0.6 })
    .from(
      "[data-hero-title] .line",
      { yPercent: 110, opacity: 0, duration: 0.85, stagger: 0.08 },
      "-=0.2"
    )
    .from("[data-hero-copy]", { y: 20, opacity: 0, duration: 0.7 }, "-=0.45")
    .from("[data-hero-cta]", { y: 16, opacity: 0, duration: 0.55, stagger: 0.1 }, "-=0.4")
    .from("[data-hero-trust] > *", { y: 12, opacity: 0, duration: 0.45, stagger: 0.06 }, "-=0.35")
    .from(
      "[data-hero-media]",
      { scale: 0.96, opacity: 0, duration: 1.1, ease: "power2.out" },
      "-=0.9"
    )
    .from("[data-hero-float]", { y: 24, opacity: 0, duration: 0.65 }, "-=0.5");
}

function initReveals() {
  const items = gsap.utils.toArray("[data-reveal]");
  if (!items.length) return;

  if (prefersReducedMotion) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  items.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
      y: 36,
      opacity: 0,
      duration: 0.75,
      ease: "power3.out",
    });
  });
}

function initStaggerGrids() {
  if (prefersReducedMotion) return;

  document.querySelectorAll("[data-stagger]").forEach((grid) => {
    const children = grid.children;
    gsap.from(children, {
      scrollTrigger: {
        trigger: grid,
        start: "top 85%",
      },
      y: 28,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power3.out",
    });
  });
}

function initStats() {
  const stats = document.querySelectorAll("[data-stat]");
  if (!stats.length) return;

  stats.forEach((el) => {
    const end = parseInt(el.dataset.stat, 10);
    const suffix = el.dataset.statSuffix || "";
    if (prefersReducedMotion) {
      el.textContent = `${end}${suffix}`;
      return;
    }

    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: end,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(obj.val)}${suffix}`;
          },
        });
      },
    });
  });
}

function initFilters() {
  const pills = document.querySelectorAll(".filter-pill");
  const cards = document.querySelectorAll("[data-product-card]");
  if (!pills.length || !cards.length) return;

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => {
        p.classList.remove("is-active", "bg-primary-container", "text-on-primary");
        p.classList.add("bg-surface-container", "text-on-surface");
      });
      pill.classList.add("is-active", "bg-primary-container", "text-on-primary");
      pill.classList.remove("bg-surface-container", "text-on-surface");

      const filter = pill.dataset.filter || "all";
      cards.forEach((card) => {
        const cat = card.dataset.category || "all";
        const show = filter === "all" || cat === filter;
        if (prefersReducedMotion) {
          card.style.display = show ? "" : "none";
          card.setAttribute("aria-hidden", show ? "false" : "true");
          return;
        }
        gsap.to(card, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.96,
          duration: 0.35,
          ease: "power2.out",
          onComplete: () => {
            card.style.display = show ? "" : "none";
          },
        });
        if (show) card.style.display = "";
        card.setAttribute("aria-hidden", show ? "false" : "true");
      });
    });
  });
}

function initMobileNav() {
  const openBtn = document.querySelector("[data-mobile-open]");
  const closeBtn = document.querySelector("[data-mobile-close]");
  const panel = document.querySelector(".mobile-nav-panel");
  const backdrop = document.querySelector(".mobile-nav-backdrop");
  if (!openBtn || !panel || !backdrop) return;

  const setOpen = (open) => {
    panel.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  };

  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn?.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
}

function initAnnouncement() {
  const bar = document.querySelector(".announcement-bar");
  const close = document.querySelector("[data-announcement-close]");
  if (!bar || !close) return;
  if (isAnnouncementDismissed()) bar.classList.add("is-dismissed");
  close.addEventListener("click", () => {
    bar.classList.add("is-dismissed");
    dismissAnnouncement();
  });
}

function splitHeroTitle() {
  const title = document.querySelector("[data-hero-title]");
  if (!title || prefersReducedMotion) return;
  const text = title.textContent.trim();
  const parts = text.split(",").map((s) => s.trim());
  title.innerHTML = parts
    .map((part, i) => {
      const comma = i < parts.length - 1 ? "," : "";
      return `<span class="line block">${part}${comma}</span>`;
    })
    .join("");
  title.classList.add("line-clamp-hero");
}

document.addEventListener("DOMContentLoaded", () => {
  registerCatalogFromDom();
  initSmoothScroll();
  initOverlays();
  initCommerceUi();
  initNewsletterForm();
  splitHeroTitle();
  initHeader();
  initHero();
  initReveals();
  initStaggerGrids();
  initStats();
  initFilters();
  initMobileNav();
  initAnnouncement();
});

export { lenisInstance };

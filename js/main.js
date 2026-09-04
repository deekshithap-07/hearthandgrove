/* Hearth & Grove — interactions */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".nav-mobile-panel");

  // Sticky header shadow
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Hero text travels with scroll, fades out before next section (image untouched)
  const heroSection = document.querySelector("#hero");
  const heroTextPin = document.querySelector(".hero-center-pin");
  if (heroSection && heroTextPin) {
    const reduceHeroTextMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const updateHeroTextScroll = () => {
      if (reduceHeroTextMotion) {
        heroTextPin.style.opacity = "";
        heroTextPin.style.transform = "";
        return;
      }

      const rect = heroSection.getBoundingClientRect();
      const vh = window.innerHeight;
      // Stay fully visible while hero still fills most of the screen
      const fadeStart = vh * 0.72;
      const fadeEnd = vh * 0.22;
      let opacity = 1;
      let drift = 0;

      if (rect.bottom <= fadeEnd) {
        opacity = 0;
        drift = 28;
      } else if (rect.bottom < fadeStart) {
        const t = (rect.bottom - fadeEnd) / (fadeStart - fadeEnd);
        opacity = Math.min(1, Math.max(0, t));
        drift = (1 - opacity) * 28;
      }

      heroTextPin.style.opacity = String(opacity);
      heroTextPin.style.transform = `translate3d(0, ${drift}px, 0)`;
      heroTextPin.style.pointerEvents = opacity < 0.08 ? "none" : "";
      heroTextPin.setAttribute("aria-hidden", opacity < 0.08 ? "true" : "false");
    };

    updateHeroTextScroll();
    window.addEventListener("scroll", updateHeroTextScroll, { passive: true });
    window.addEventListener("resize", updateHeroTextScroll, { passive: true });
  }

  // Mobile menu
  menuToggle?.addEventListener("click", () => {
    mobilePanel?.classList.toggle("open");
    menuToggle.setAttribute(
      "aria-expanded",
      mobilePanel?.classList.contains("open") ? "true" : "false"
    );
  });

  // Header search (Root & Roast–style)
  const searchBtn = document.querySelector(".header-search-btn");
  const searchPanel = document.querySelector("#header-search");
  const searchClose = document.querySelector(".header-search-close");
  const searchInput = document.querySelector("#site-search");

  const setSearchOpen = (open) => {
    if (!searchPanel || !searchBtn) return;
    searchPanel.hidden = !open;
    searchBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      searchInput?.focus();
      mobilePanel?.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  };

  searchBtn?.addEventListener("click", () => {
    setSearchOpen(searchPanel?.hidden !== false);
  });
  searchClose?.addEventListener("click", () => setSearchOpen(false));

  // —— Cart (drawer + localStorage) ——
  const CART_KEY = "hg-cart";
  const CATALOGUE = window.HG_PRODUCT_BY_ID || {
    cashew: {
      id: "cashew",
      name: "Cashew Nuts",
      price: 12,
      img: "images/cashews.jpg",
    },
    almond: {
      id: "almond",
      name: "Almonds",
      price: 14,
      img: "images/almonds-pile.jpg",
    },
  };

  const cartBtn = document.querySelector(".header-cart");
  const cartCounts = () => document.querySelectorAll(".cart-count");

  const readCart = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const cartQtyTotal = (items) =>
    items.reduce((sum, item) => sum + (item.qty || 0), 0);

  const cartMoneyTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const formatMoney = (n) => `$${n.toFixed(2)}`;

  const normalizeImg = (img) => (img || "").replace(/^\.\.\//, "");

  const siteAssetBase = () => {
    const href =
      document
        .querySelector('link[rel="stylesheet"][href*="styles.css"]')
        ?.getAttribute("href") || "";
    return href.replace(/css\/styles\.css.*$/, "");
  };

  const cartImgSrc = (img) => {
    const path = normalizeImg(img);
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `${siteAssetBase()}${path}`;
  };

  const ensureCartDom = () => {
    if (document.getElementById("cart-drawer")) return;

    const overlay = document.createElement("div");
    overlay.className = "cart-overlay";
    overlay.id = "cart-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.id = "cart-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "cart-drawer-title");
    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h2 id="cart-drawer-title">Your cart</h2>
        <button type="button" class="cart-drawer-close" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-drawer-body" id="cart-drawer-body"></div>
      <div class="cart-drawer-footer" id="cart-drawer-footer" hidden>
        <div class="cart-total">
          <span>Total</span>
          <strong id="cart-total-value">$0.00</strong>
        </div>
        <button type="button" class="btn btn-gold" id="cart-buy-now">Buy now</button>
        <button type="button" class="btn btn-outline" id="cart-keep-shopping">Keep shopping</button>
        <form class="cart-checkout" id="cart-checkout" novalidate>
          <label for="cart-name">Full name</label>
          <input id="cart-name" name="name" type="text" required autocomplete="name" />
          <label for="cart-phone">Phone</label>
          <input id="cart-phone" name="phone" type="tel" required autocomplete="tel" placeholder="+254…" />
          <label for="cart-email">Email</label>
          <input id="cart-email" name="email" type="email" required autocomplete="email" />
          <button type="submit" class="btn btn-gold">Place order</button>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  };

  const setCartOpen = (open) => {
    ensureCartDom();
    const overlay = document.getElementById("cart-overlay");
    const drawer = document.getElementById("cart-drawer");
    overlay?.classList.toggle("is-open", open);
    drawer?.classList.toggle("is-open", open);
    document.body.classList.toggle("cart-open", open);
    cartBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) {
      document.getElementById("cart-checkout")?.classList.remove("is-open");
    }
  };

  const updateCartBadge = () => {
    const items = readCart();
    const qty = cartQtyTotal(items);
    cartCounts().forEach((el) => {
      el.textContent = String(qty);
      el.dataset.empty = qty === 0 ? "true" : "false";
    });
    if (cartBtn) {
      cartBtn.setAttribute(
        "aria-label",
        qty === 0 ? "Cart, empty" : `Cart, ${qty} item${qty === 1 ? "" : "s"}`
      );
    }
  };

  const renderCart = () => {
    ensureCartDom();
    const body = document.getElementById("cart-drawer-body");
    const footer = document.getElementById("cart-drawer-footer");
    const totalEl = document.getElementById("cart-total-value");
    if (!body || !footer || !totalEl) return;

    const items = readCart();
    updateCartBadge();

    if (!items.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <p><a href="catalogue.html">Browse the catalogue</a></p>
        </div>
      `;
      footer.hidden = true;
      document.getElementById("cart-checkout")?.classList.remove("is-open");
      return;
    }

    footer.hidden = false;
    totalEl.textContent = formatMoney(cartMoneyTotal(items));
    body.innerHTML = items
      .map(
        (item) => `
      <div class="cart-line" data-id="${item.id}">
        <div class="cart-line-media">
          <img src="${cartImgSrc(item.img)}" alt="" />
        </div>
        <div class="cart-line-info">
          <h3>${item.name}</h3>
          <p class="cart-line-price">${formatMoney(item.price)} each</p>
          <div class="cart-qty">
            <button type="button" data-qty-delta="-1" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button type="button" data-qty-delta="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button type="button" class="cart-line-remove" data-remove>Remove</button>
      </div>`
      )
      .join("");
  };

  const addToCart = (product, qty = 1) => {
    if (!product?.id) return;
    const amount = Math.max(1, Number(qty) || 1);
    const items = readCart();
    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += amount;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        img: normalizeImg(product.img),
        qty: amount,
      });
    }
    writeCart(items);
    renderCart();
    setCartOpen(true);
  };

  const productFromEl = (el) => {
    const root = el.closest("[data-product]");
    if (!root) return null;
    const id = root.dataset.product;
    const fromCatalogue = CATALOGUE[id] || {};
    return {
      id,
      name: root.dataset.name || fromCatalogue.name || id,
      price: Number(root.dataset.price || fromCatalogue.price || 0),
      img: root.dataset.img || fromCatalogue.img || "",
    };
  };

  ensureCartDom();
  renderCart();

  cartBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const drawer = document.getElementById("cart-drawer");
    const opening = !drawer?.classList.contains("is-open");
    if (opening) {
      setSearchOpen(false);
      mobilePanel?.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
      renderCart();
    }
    setCartOpen(opening);
  });

  document.getElementById("cart-overlay")?.addEventListener("click", () =>
    setCartOpen(false)
  );
  document
    .querySelector(".cart-drawer-close")
    ?.addEventListener("click", () => setCartOpen(false));
  document.getElementById("cart-keep-shopping")?.addEventListener("click", () =>
    setCartOpen(false)
  );
  document.getElementById("cart-buy-now")?.addEventListener("click", () => {
    document.getElementById("cart-checkout")?.classList.add("is-open");
    document.getElementById("cart-name")?.focus();
  });

  document.getElementById("cart-drawer-body")?.addEventListener("click", (e) => {
    const line = e.target.closest(".cart-line");
    if (!line) return;
    const id = line.dataset.id;
    let items = readCart();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (e.target.closest("[data-remove]")) {
      items = items.filter((i) => i.id !== id);
      writeCart(items);
      renderCart();
      return;
    }

    const deltaBtn = e.target.closest("[data-qty-delta]");
    if (deltaBtn) {
      const delta = Number(deltaBtn.dataset.qtyDelta);
      item.qty += delta;
      if (item.qty <= 0) items = items.filter((i) => i.id !== id);
      writeCart(items);
      renderCart();
    }
  });

  document.getElementById("cart-checkout")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const items = readCart();
    if (!items.length) return;

    const name = document.getElementById("cart-name")?.value.trim() || "";
    const phone = document.getElementById("cart-phone")?.value.trim() || "";
    const email = document.getElementById("cart-email")?.value.trim() || "";
    if (!name || !phone || !email) return;

    const lines = items
      .map((i) => `• ${i.name} × ${i.qty} — ${formatMoney(i.price * i.qty)}`)
      .join("\n");
    const total = formatMoney(cartMoneyTotal(items));
    const message = encodeURIComponent(
      `Hearth & Grove order\n\n${lines}\n\nTotal: ${total}\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`
    );
    writeCart([]);
    renderCart();
    setCartOpen(false);
    window.open(`https://wa.me/254700000000?text=${message}`, "_blank");
  });

  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-cart]");
    if (!addBtn) return;
    e.preventDefault();
    e.stopPropagation();
    const product = productFromEl(addBtn);
    if (product) addToCart(product);
  });

  document.addEventListener("hg-add-to-cart", (e) => {
    const { id, name, price, img, qty } = e.detail || {};
    if (!id) return;
    addToCart({ id, name, price, img }, qty);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setCartOpen(false);
    }
  });

  // Scroll reveal
  const reveals = document.querySelectorAll(
    ".reveal, .reveal-over, .reveal-slide-left, .reveal-slide-right"
  );
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  // Shop page — navigate to product detail; preserve return state
  const SHOP_RETURN_KEY = "hg-shop-return";

  const saveShopReturnState = () => {
    const activeFilter =
      document.querySelector(".shop-filters button.active")?.dataset.filter || "all";
    sessionStorage.setItem(
      SHOP_RETURN_KEY,
      JSON.stringify({ scrollY: window.scrollY, filter: activeFilter })
    );
  };

  const restoreShopReturnState = () => {
    if (!document.querySelector(".shop-grid")) return;
    const raw = sessionStorage.getItem(SHOP_RETURN_KEY);
    if (!raw) return;
    try {
      const { scrollY, filter } = JSON.parse(raw);
      if (filter) {
        const btn = document.querySelector(`.shop-filters button[data-filter="${filter}"]`);
        if (btn) {
          filterBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          applyShopFilter(filter);
        }
      }
      if (typeof scrollY === "number") {
        requestAnimationFrame(() => window.scrollTo(0, scrollY));
      }
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem(SHOP_RETURN_KEY);
  };

  document.querySelectorAll(".shop-item-link").forEach((link) => {
    link.addEventListener("click", () => saveShopReturnState());
  });

  document.querySelector("[data-pd-back]")?.addEventListener("click", (e) => {
    const fromProducts =
      document.referrer.includes("catalogue") || sessionStorage.getItem(SHOP_RETURN_KEY);
    if (fromProducts) {
      e.preventDefault();
      if (window.history.length > 1) {
        history.back();
      } else {
        window.location.href = e.currentTarget.getAttribute("href");
      }
    }
  });

  // Catalogue filters (All | Cashews | Almonds | Recently Added)
  const filterBtns = document.querySelectorAll(".shop-filters button[data-filter]");
  const shopItems = document.querySelectorAll(".shop-item[data-tags]");
  const shopEmpty = document.querySelector(".shop-empty");

  const applyShopFilter = (filter) => {
    let visible = 0;
    shopItems.forEach((item) => {
      const tags = (item.dataset.tags || "").split(/\s+/);
      const show = filter === "all" || tags.includes(filter);
      item.classList.toggle("is-hidden", !show);
      if (show) {
        visible += 1;
        item.classList.add("is-inview");
      }
    });
    if (shopEmpty) shopEmpty.hidden = visible > 0;
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyShopFilter(btn.dataset.filter || "all");
    });
  });

  restoreShopReturnState();

  // Nutrition compare data (per 28g / 1oz)
  const nutritionData = {
    cashew: {
      name: "Cashew",
      img: "images/cashews.jpg",
      energy: "553 kJ / 132 kcal",
      fat: "10.4 g",
      carb: "7.6 g",
      sugars: "1.7 g",
      fibre: "0.9 g",
      protein: "4.3 g",
    },
    almond: {
      name: "Almond",
      img: "images/almonds-pile.jpg",
      energy: "687 kJ / 164 kcal",
      fat: "14.2 g",
      carb: "6.1 g",
      sugars: "1.2 g",
      fibre: "3.5 g",
      protein: "6.0 g",
    },
  };

  function renderCompare(selectId, photoId, listId) {
    const select = document.getElementById(selectId);
    const photo = document.getElementById(photoId);
    const list = document.getElementById(listId);
    if (!select || !photo || !list) return;

    const apply = () => {
      const data = nutritionData[select.value];
      if (!data) return;
      photo.style.opacity = "0";
      photo.style.transform = "scale(1.04)";
      setTimeout(() => {
        photo.src = data.img;
        photo.alt = data.name;
        list.innerHTML = `
          <div class="nutrient"><span>Energy</span><span>${data.energy}</span></div>
          <div class="nutrient"><span>Fat</span><span>${data.fat}</span></div>
          <div class="nutrient"><span>Carbohydrate</span><span>${data.carb}</span></div>
          <div class="nutrient"><span>Sugars</span><span>${data.sugars}</span></div>
          <div class="nutrient"><span>Fibre</span><span>${data.fibre}</span></div>
          <div class="nutrient"><span>Protein</span><span>${data.protein}</span></div>
        `;
        photo.style.opacity = "1";
        photo.style.transform = "scale(1)";
      }, 180);
    };

    select.addEventListener("change", apply);
    apply();
  }

  renderCompare("nut-left", "nut-photo-left", "nut-list-left");
  renderCompare("nut-right", "nut-photo-right", "nut-list-right");

  // Allergy flip cards — click locks flip; hover also flips on fine pointers
  document.querySelectorAll(".flip-card").forEach((card) => {
    const syncPressed = () => {
      card.setAttribute(
        "aria-pressed",
        card.classList.contains("is-flipped") ? "true" : "false"
      );
    };

    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
      syncPressed();
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
        syncPressed();
      }
    });
  });

  // Nutrition page — section tabs + leaf dividers
  const nutritionTabs = document.querySelectorAll("[data-nutrition-tab]");
  const nutritionSections = ["fact", "compare", "allergies"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (nutritionTabs.length && nutritionSections.length) {
    const nutritionSectionOrder = ["fact", "compare", "allergies"];
    const visibleNutritionSections = new Set();

    const setActiveNutritionTab = (id) => {
      nutritionTabs.forEach((tab) => {
        tab.classList.toggle("is-active", Boolean(id) && tab.getAttribute("data-nutrition-tab") === id);
      });
    };

    nutritionTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const id = tab.getAttribute("data-nutrition-tab");
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveNutritionTab(id);
        history.replaceState(null, "", `#${id}`);
      });
    });

    if ("IntersectionObserver" in window) {
      const nutritionTabIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleNutritionSections.add(entry.target.id);
            } else {
              visibleNutritionSections.delete(entry.target.id);
            }
          });

          if (visibleNutritionSections.size === 0) {
            setActiveNutritionTab(null);
            return;
          }

          const activeId = nutritionSectionOrder.find((id) => visibleNutritionSections.has(id));
          if (activeId) setActiveNutritionTab(activeId);
        },
        { threshold: 0.28, rootMargin: "-15% 0px -45% 0px" }
      );
      nutritionSections.forEach((section) => nutritionTabIo.observe(section));
    }
  }

  const nutritionDyk = document.querySelector(".nutrition-dyk");
  if (nutritionDyk) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if ("IntersectionObserver" in window && !reducedMotion) {
      const dykIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              nutritionDyk.classList.add("is-inview");
              dykIo.unobserve(nutritionDyk);
            }
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
      );
      dykIo.observe(nutritionDyk);
    } else {
      nutritionDyk.classList.add("is-inview");
    }

    const dykImg = nutritionDyk.querySelector("[data-dyk-parallax]");
    if (dykImg && !reducedMotion) {
      let ticking = false;
      const updateParallax = () => {
        const rect = nutritionDyk.getBoundingClientRect();
        const viewH = window.innerHeight;
        if (rect.bottom > 0 && rect.top < viewH) {
          const progress = (viewH - rect.top) / (viewH + rect.height);
          const offset = (progress - 0.5) * 20;
          dykImg.style.setProperty("--dyk-parallax", `${offset}px`);
        }
        ticking = false;
      };
      updateParallax();
      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(updateParallax);
        },
        { passive: true }
      );
    }
  }

  document.querySelectorAll(".section-leaf").forEach((leaf) => {
    if (leaf.classList.contains("is-inview")) return;
    if ("IntersectionObserver" in window) {
      const leafIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              leafIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.45 }
      );
      leafIo.observe(leaf);
    } else {
      leaf.classList.add("is-inview");
    }
  });

  // Single bowl in hero → travels to next section; nuts splash out/back with scroll
  const journey = document.querySelector(".bowl-journey");
  const hero = document.querySelector("#hero");
  const offer = document.querySelector("#offer");
  const bowl = document.querySelector("[data-bowl]");
  const nuts = document.querySelectorAll(".scroll-nut");

  if (journey && hero && offer && bowl) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targetP = 0;
    let curP = 0;
    let ticking = false;
    let home = null;

    const measureHome = () => {
      const wasFixed = bowl.classList.contains("is-fixed");
      if (wasFixed) {
        bowl.classList.remove("is-fixed");
        bowl.style.top = "";
        bowl.style.left = "";
        bowl.style.width = "";
      }
      // force layout
      void bowl.offsetWidth;
      const r = bowl.getBoundingClientRect();
      home = {
        docTop: r.top + window.scrollY,
        docLeft: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      };
      if (wasFixed) bowl.classList.add("is-fixed");
    };

    const apply = (p) => {
      journey.style.setProperty("--p", p.toFixed(4));

      nuts.forEach((nut) => {
        const i = Number(nut.dataset.i || 0);
        const start = 0.06 + i * 0.035;
        const span = 0.22;
        const local = Math.min(1, Math.max(0, (p - start) / span));
        const eased = local * local * (3 - 2 * local);
        nut.style.setProperty("--local", eased.toFixed(4));
      });

      if (!home) measureHome();

      const offerRect = offer.getBoundingClientRect();
      const headerH =
        document.querySelector(".site-header")?.offsetHeight || 72;

      const startTop = home.docTop - window.scrollY;
      const startLeft = home.docLeft - window.scrollX;
      const endTop = Math.min(
        Math.max(offerRect.top - home.height * 0.45, headerH + 12),
        window.innerHeight * 0.42
      );
      const endLeft = startLeft;

      if (p > 0.02) {
        bowl.classList.add("is-fixed");
        bowl.style.top = `${startTop + (endTop - startTop) * p}px`;
        bowl.style.left = `${startLeft + (endLeft - startLeft) * p}px`;
        bowl.style.width = `${home.width}px`;
      } else {
        bowl.classList.remove("is-fixed");
        bowl.style.top = "";
        bowl.style.left = "";
        bowl.style.width = "";
      }
    };

    const computeProgress = () => {
      const heroRect = hero.getBoundingClientRect();
      // 0 at top of page; 1 when we've scrolled through most of the hero
      // toward the start of the offer section
      const range = Math.max(hero.offsetHeight * 0.7, window.innerHeight * 0.55);
      targetP = Math.min(Math.max(-heroRect.top / range, 0), 1);
    };

    const tick = () => {
      curP += (targetP - curP) * (reduceMotion ? 1 : 0.16);
      apply(curP);
      if (Math.abs(targetP - curP) > 0.0007) {
        requestAnimationFrame(tick);
      } else {
        apply(targetP);
        ticking = false;
      }
    };

    const onScroll = () => {
      computeProgress();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    };

    // Cursor parallax (subtle) while not fighting scroll travel
    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    const parallaxTick = () => {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      bowl.style.setProperty("--px", `${cx.toFixed(2)}px`);
      bowl.style.setProperty("--py", `${cy.toFixed(2)}px`);
      requestAnimationFrame(parallaxTick);
    };
    requestAnimationFrame(parallaxTick);

    window.addEventListener(
      "mousemove",
      (e) => {
        const r = bowl.getBoundingClientRect();
        mx = ((e.clientX - r.left) / Math.max(r.width, 1) - 0.5) * 28;
        my = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 18;
      },
      { passive: true }
    );

    const boot = () => {
      measureHome();
      computeProgress();
      apply(targetP);
    };

    window.addEventListener("load", boot);
    window.addEventListener("resize", () => {
      measureHome();
      onScroll();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    boot();
  }

  // About page — section tabs + floating leaf divider
  const aboutTabs = document.querySelectorAll("[data-about-tab]");
  const aboutSections = ["our-story", "who-we-are"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (aboutTabs.length && aboutSections.length) {
    const aboutSectionOrder = ["our-story", "who-we-are"];
    const visibleAboutSections = new Set();

    const setActiveTab = (id) => {
      aboutTabs.forEach((tab) => {
        tab.classList.toggle("is-active", Boolean(id) && tab.getAttribute("data-about-tab") === id);
      });
    };

    aboutTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const id = tab.getAttribute("data-about-tab");
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const headerOffset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveTab(id);
        history.replaceState(null, "", `#${id}`);
      });
    });

    if ("IntersectionObserver" in window) {
      const tabIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleAboutSections.add(entry.target.id);
            } else {
              visibleAboutSections.delete(entry.target.id);
            }
          });

          if (visibleAboutSections.size === 0) {
            setActiveTab(null);
            return;
          }

          const activeId = aboutSectionOrder.find((id) => visibleAboutSections.has(id));
          if (activeId) setActiveTab(activeId);
        },
        { threshold: 0.35, rootMargin: "-15% 0px -45% 0px" }
      );
      aboutSections.forEach((section) => tabIo.observe(section));
    }
  }

  const aboutStoryEnter = document.querySelector(".about-story-enter");
  if (aboutStoryEnter) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      aboutStoryEnter.classList.add("is-settled");
      aboutStoryEnter.style.setProperty("--about-enter", "1");
    } else {
      let ticking = false;
      const updateAboutStoryEnter = () => {
        const rect = aboutStoryEnter.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.94;
        const end = vh * 0.14;
        const range = start - end;
        const progress =
          range <= 0 ? 1 : Math.min(1, Math.max(0, (start - rect.top) / range));
        aboutStoryEnter.style.setProperty("--about-enter", progress.toFixed(4));
        aboutStoryEnter.classList.toggle("is-settled", progress >= 0.998);
        ticking = false;
      };

      updateAboutStoryEnter();
      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(updateAboutStoryEnter);
        },
        { passive: true }
      );
      window.addEventListener("resize", updateAboutStoryEnter, { passive: true });
    }
  }

  const aboutWhoEnter = document.querySelector(".about-who-enter");
  if (aboutWhoEnter) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      aboutWhoEnter.classList.add("is-inview", "is-settled");
    } else {
      const whoIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              aboutWhoEnter.classList.add("is-inview");
              whoIo.unobserve(aboutWhoEnter);
            }
          });
        },
        { threshold: 0.22, rootMargin: "0px 0px -12% 0px" }
      );
      whoIo.observe(aboutWhoEnter);
    }
  }
});

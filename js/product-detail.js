/* Product detail page — populates from HG_PRODUCTS */
document.addEventListener("DOMContentLoaded", () => {
  initProductDetailScroll();

  const slug = document.body.dataset.productSlug;
  const product = window.HG_PRODUCTS?.[slug];
  if (!product) return;

  const asset = (path) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("/")) return path;
    const base =
      document
        .querySelector('link[rel="stylesheet"][href*="styles.css"]')
        ?.getAttribute("href")
        ?.replace(/css\/styles\.css.*$/, "") || "../";
    return `${base}${path}`;
  };

  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el && text != null) el.textContent = text;
  };

  document.title = `${product.name} — Hearth & Grove`;
  setText("[data-pd-name]", product.name);
  setText("[data-pd-price]", `$${product.price.toFixed(2)}`);
  setText("[data-pd-short]", product.shortDescription);
  setText("[data-pd-about]", product.about);
  setText("[data-pd-tag]", product.tag);
  setText("[data-pd-serving]", product.nutrition?.serving);

  const mainImg = document.querySelector("[data-pd-main-img]");
  if (mainImg) {
    mainImg.src = asset(product.img);
    mainImg.alt = product.name;
  }

  const nutritionList = document.querySelector("[data-pd-nutrition]");
  if (nutritionList && product.nutrition) {
    const n = product.nutrition;
    const rows = [
      ["Energy", n.energy],
      ["Fat", n.fat],
      ["Carbohydrate", n.carb],
      ["Sugars", n.sugars],
      ["Fibre", n.fibre],
      ["Protein", n.protein],
    ].filter(([, v]) => v);
    nutritionList.innerHTML = rows
      .map(
        ([label, value]) =>
          `<div class="pd-nutrient"><span>${label}</span><span>${value}</span></div>`
      )
      .join("");
  }

  const thumbs = document.querySelector("[data-pd-thumbs]");
  const images = product.images?.length ? product.images : [product.img];
  if (thumbs && images.length > 1) {
    thumbs.innerHTML = images
      .map(
        (src, i) =>
          `<button type="button" class="pd-thumb${i === 0 ? " is-active" : ""}" data-pd-thumb="${asset(src)}" aria-label="View image ${i + 1}">
            <img src="${asset(src)}" alt="" />
          </button>`
      )
      .join("");
    thumbs.hidden = false;
    thumbs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pd-thumb]");
      if (!btn || !mainImg) return;
      mainImg.src = btn.dataset.pdThumb;
      thumbs.querySelectorAll(".pd-thumb").forEach((t) => t.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  } else if (thumbs) {
    thumbs.hidden = true;
  }

  const qtyInput = document.querySelector("[data-pd-qty]");
  const qtyMinus = document.querySelector("[data-pd-qty-minus]");
  const qtyPlus = document.querySelector("[data-pd-qty-plus]");

  const getQty = () => Math.max(1, Math.min(99, Number(qtyInput?.value) || 1));

  qtyMinus?.addEventListener("click", () => {
    if (qtyInput) qtyInput.value = String(Math.max(1, getQty() - 1));
  });
  qtyPlus?.addEventListener("click", () => {
    if (qtyInput) qtyInput.value = String(Math.min(99, getQty() + 1));
  });

  document.querySelector("[data-pd-add-cart]")?.addEventListener("click", (e) => {
    e.preventDefault();
    const qty = getQty();
    const addEvent = new CustomEvent("hg-add-to-cart", {
      detail: {
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        qty,
      },
      bubbles: true,
    });
    document.dispatchEvent(addEvent);
  });

  requestAnimationFrame(() => {
    document.querySelector(".pd-layout")?.classList.add("is-visible");
  });
});

function initProductDetailScroll() {
  const info = document.querySelector(".page-product-detail .pd-info");
  if (!info) return;

  const desktopMq = window.matchMedia("(min-width: 901px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isScrollable = () => info.scrollHeight > info.clientHeight + 2;
  const atTop = () => info.scrollTop <= 1;
  const atBottom = () => info.scrollTop + info.clientHeight >= info.scrollHeight - 2;

  if (!reducedMotion) {
    info.addEventListener(
      "wheel",
      (e) => {
        if (!desktopMq.matches || !isScrollable()) return;

        const dy = e.deltaY;
        if (!dy) return;

        const scrollingDown = dy > 0;
        const scrollingUp = dy < 0;

        if (scrollingDown && !atBottom()) {
          e.preventDefault();
          info.scrollTop += dy;
        } else if (scrollingUp && !atTop()) {
          e.preventDefault();
          info.scrollTop += dy;
        }
      },
      { passive: false }
    );
  }
}

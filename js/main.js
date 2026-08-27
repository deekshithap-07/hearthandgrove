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

  // Mobile menu
  menuToggle?.addEventListener("click", () => {
    mobilePanel?.classList.toggle("open");
    menuToggle.setAttribute(
      "aria-expanded",
      mobilePanel?.classList.contains("open") ? "true" : "false"
    );
  });

  // Scroll reveal
  const reveals = document.querySelectorAll(".reveal");
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

  // Product cards on home — scroll reveal + select animation
  const productCards = document.querySelectorAll(".product-card");

  if (productCards.length && "IntersectionObserver" in window) {
    const productIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            productIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
    );
    productCards.forEach((card) => productIo.observe(card));
  } else {
    productCards.forEach((card) => card.classList.add("is-inview"));
  }

  const activateProduct = (card) => {
    productCards.forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    card.classList.add("is-active", "is-inview");
    card.setAttribute("aria-pressed", "true");
  };

  productCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
    card.addEventListener("click", () => activateProduct(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateProduct(card);
      }
    });
  });

  // Catalogue filters (visual only for 2 products)
  document.querySelectorAll(".shop-filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".shop-filters button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Nutrition compare data
  const nutritionData = {
    cashew: {
      name: "Cashew",
      img: "images/cashews.jpg",
      energy: "553 kJ / 132 kcal",
      fat: "10.4 g",
      carb: "7.6 g",
      sugars: "1.7 g",
    },
    almond: {
      name: "Almond",
      img: "images/almonds-pile.jpg",
      energy: "687 kJ / 164 kcal",
      fat: "14.2 g",
      carb: "6.1 g",
      sugars: "1.2 g",
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

  // Allergy flip cards
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
      card.setAttribute(
        "aria-pressed",
        card.classList.contains("is-flipped") ? "true" : "false"
      );
    });
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
});

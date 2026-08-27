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

  // Product cards on home — select animation
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".product-card")
        .forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
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

  // Hero cursor parallax on the traveling bowl
  const scene = document.querySelector("[data-parallax]");
  if (scene) {
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      scene.style.setProperty("--px", `${curX.toFixed(2)}px`);
      scene.style.setProperty("--py", `${curY.toFixed(2)}px`);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    window.addEventListener(
      "mousemove",
      (e) => {
        const rect = scene.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
        targetX = nx * 40;
        targetY = ny * 28;
      },
      { passive: true }
    );
  }

  // Bowl rides hero → next section; each nut splashes out individually on scroll
  const journey = document.querySelector(".bowl-journey");
  const nuts = document.querySelectorAll(".scroll-nut");
  if (journey) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targetP = 0;
    let curP = 0;
    let ticking = false;

    const applySplash = (p) => {
      journey.style.setProperty("--p", p.toFixed(4));
      nuts.forEach((nut) => {
        const i = Number(nut.style.getPropertyValue("--i") || nut.dataset.i || 0);
        // Stagger: each nut starts splashing a bit later
        const start = 0.04 + i * 0.055;
        const span = 0.28;
        const local = Math.min(1, Math.max(0, (p - start) / span));
        // Ease-out so splash feels snappy then settles
        const eased = 1 - Math.pow(1 - local, 2.2);
        nut.style.setProperty("--local", eased.toFixed(4));
      });
    };

    const computeProgress = () => {
      const rect = journey.getBoundingClientRect();
      const total = Math.max(journey.offsetHeight - window.innerHeight, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      targetP = scrolled / total;
    };

    const tickScroll = () => {
      curP += (targetP - curP) * (reduceMotion ? 1 : 0.14);
      applySplash(curP);
      if (Math.abs(targetP - curP) > 0.0008) {
        requestAnimationFrame(tickScroll);
      } else {
        applySplash(targetP);
        ticking = false;
      }
    };

    const onScroll = () => {
      computeProgress();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tickScroll);
      }
    };

    computeProgress();
    applySplash(targetP);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }
});

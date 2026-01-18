// 1. LENIS SMOOTH SCROLL
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({
  smooth: 1.3,
  lerp: 0.08,
  wheelMultiplier: 1,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
ScrollTrigger.addEventListener("refresh", () => lenis.resize());
ScrollTrigger.refresh();

// 2. CONFETTI HELPER
window.triggerConfetti = (el) => {
  const isDisabledViewport = window.matchMedia("(max-width: 991px) and (orientation: landscape)").matches || window.matchMedia("(max-width: 767px)").matches;
  if (isDisabledViewport) return;
  if (!el || typeof confetti !== "function") return;
  const explosionPresets = {
    S: { velocity: 5, decay: 0.95 },
    M: { velocity: 15, decay: 0.95 },
    L: { velocity: 35, decay: 0.95 },
    XL: { velocity: 60, decay: 0.95 }
  };
  const amount = Number(el.dataset.amount || 30);
  const cover = Number(el.dataset.cover || 360);
  const explosion = el.dataset.explosion || "M";
  const colors = el.dataset.colors ? el.dataset.colors.split(",") : undefined;
  const preset = explosionPresets[explosion];
  confetti({
    particleCount: Math.floor(200 * (amount / 100)),
    spread: cover,
    angle: 60,
    startVelocity: preset.velocity,
    decay: preset.decay,
    origin: { x: 0.2, y: 0.5 },
    shapes: ["circle", "square"],
    colors
  });
};

// 3. KOMPETANSE SECTION (STICKY & THEMES)
(() => {
  const mm = gsap.matchMedia();
  mm.add("(max-width: 767px)", () => {
    const mobileSection = document.querySelector(".section.kompetanse");
    const mobileCards = gsap.utils.toArray(".kompetanse-card");
    if (!mobileSection || !mobileCards.length) return;
    mobileCards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top center",
        end: "bottom center",
        onEnter: () => applyTheme(index),
        onEnterBack: () => applyTheme(index),
      });
    });
    function applyTheme(index) {
      const mobileThemes = [{ bg: "#E8E674", color: "#232321" }, { bg: "#C9D3D2", color: "#232321" }, { bg: "#6F4129", color: "#f8f8f4" }];
      gsap.to(mobileSection, { backgroundColor: mobileThemes[index].bg, color: mobileThemes[index].color, duration: 0.8, ease: "power2.inOut", overwrite: "auto" });
    }
  });
  mm.add("(min-width: 768px)", () => {
    const section = document.querySelector(".section.kompetanse");
    const pinWrapper = document.getElementById("kompetanse-pinned");
    const cards = gsap.utils.toArray(".cc-kompetanse-card");
    const images = gsap.utils.toArray(".cc-kompetanse-img");
    if (!section || !pinWrapper || !cards.length) return;
    gsap.set(images, { autoAlpha: 0 });
    gsap.set(images[0], { autoAlpha: 1 });
    let canFireConfetti = true;
    let isFirstRun = true;
    let currentIndex = -1;
    ScrollTrigger.create({
      trigger: pinWrapper,
      start: "top top",
      endTrigger: cards[cards.length - 1],
      end: "center center",
      pin: pinWrapper,
      pinSpacing: false,
      onUpdate(self) {
        if (isFirstRun) { if (self.progress > 0.9) canFireConfetti = false; isFirstRun = false; return; }
        if (self.direction === 1 && self.progress >= 0.99 && canFireConfetti) { canFireConfetti = false; triggerConfetti(cards[cards.length - 1]); }
        if (self.direction === -1 && self.progress <= 0.9 && !canFireConfetti) { canFireConfetti = true; }
      }
    });
    const themes = [{ bg: "#E8E674", color: "#232321" }, { bg: "#C9D3D2", color: "#232321" }, { bg: "#6F4129", color: "#f8f8f4" }];
    cards.forEach((card, index) => {
      ScrollTrigger.create({ trigger: card, start: "top center", end: "bottom center", onEnter: () => activate(index), onEnterBack: () => activate(index) });
    });
    function activate(index) {
      if (index === currentIndex) return;
      currentIndex = index;
      images.forEach((img, i) => { gsap.to(img, { autoAlpha: i === index ? 1 : 0, duration: 1.2, ease: "power2.inOut", overwrite: "auto" }); });
      gsap.to(section, { backgroundColor: themes[index].bg, color: themes[index].color, duration: 1.2, ease: "power2.inOut", overwrite: "auto" });
    }
  });
})();

// 4. TEXT SPLIT ANIMATIONS
window.addEventListener("DOMContentLoaded", () => {
  gsap.set("[data-split]", { opacity: 1 });
  document.querySelectorAll('[data-split="words"]').forEach((el) => {
    let mySplit = new SplitText(el, { type: "words" });
    gsap.from(mySplit.words, { scrollTrigger: { trigger: el, start: "top 90%" }, duration: 0.5, yPercent: 100, opacity: 0, stagger: 0.2, ease: "elastic.out(1,1)" });
  });
});

// 5. PHYSICS (MATTER.JS)
document.addEventListener("DOMContentLoaded", () => {
  const { Engine, Runner, Bodies, Composite, Events, Vector, Body } = Matter;
  const wrapper = document.querySelector(".physics-wrapper");
  const items = document.querySelectorAll(".physics-item");
  if (!wrapper || !items.length) return;
  const engine = Engine.create();
  engine.gravity.y = 0;
  const runner = Runner.create();
  Runner.run(runner, engine);
  const bodies = [];
  items.forEach((el) => {
    const size = el.offsetWidth;
    const body = Bodies.circle(Math.random() * wrapper.offsetWidth, Math.random() * wrapper.offsetHeight * 0.5, size / 2, { restitution: 0.9, frictionAir: 0.05, inertia: Infinity });
    body.el = el;
    bodies.push(body);
    Composite.add(engine.world, body);
  });
  Events.on(engine, "afterUpdate", () => {
    bodies.forEach((body) => {
      body.el.style.transform = `translate(${body.position.x - body.el.offsetWidth / 2}px, ${body.position.y - body.el.offsetHeight / 2}px)`;
    });
  });
});

// 6. FOOTER YEAR
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.querySelector('.current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
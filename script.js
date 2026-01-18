/**
 * MS PROJECT - MASTER SCRIPT
 */

// --- 1. PLUGINS & INITIALIZATION ---
gsap.registerPlugin(ScrollTrigger, SplitText);

// Lenis Smooth Scroll
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

// --- 2. CONFETTI HELPER ---
window.triggerConfetti = (el) => {
  const isDisabledViewport = window.matchMedia("(max-width: 991px) and (orientation: landscape)").matches || window.matchMedia("(max-width: 767px)").matches;
  if (isDisabledViewport) return;
  if (!el || typeof confetti !== "function") return;

  const explosionPresets = {
    S: { velocity: 5, decay: 0.95 },
    M: { velocity: 15, decay: 0.95 },
    L: { velocity: 35, decay: 0.95 },
    XL:{ velocity: 60, decay: 0.95 }
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

// --- 3. STICKY KOMPETANSE SECTION ---
(() => {
  const mm = gsap.matchMedia();
  
  mm.add("(max-width: 767px)", () => {
    const mobileSection = document.querySelector(".section.kompetanse");
    const mobileCards = gsap.utils.toArray(".kompetanse-card");
    if (!mobileSection || !mobileCards.length) return;
    
    const mobileThemes = [
      { bg: "#E8E674", color: "#232321" },
      { bg: "#C9D3D2", color: "#232321" },
      { bg: "#6F4129", color: "#f8f8f4" }
    ];

    mobileCards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top center",
        end: "bottom center",
        onEnter: () => gsap.to(mobileSection, { backgroundColor: mobileThemes[index].bg, color: mobileThemes[index].color, duration: 0.8 }),
        onEnterBack: () => gsap.to(mobileSection, { backgroundColor: mobileThemes[index].bg, color: mobileThemes[index].color, duration: 0.8 }),
      });
    });
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
        if (self.direction === 1 && self.progress >= 0.99 && canFireConfetti) {
          canFireConfetti = false;
          triggerConfetti(cards[cards.length - 1]);
        }
        if (self.direction === -1 && self.progress <= 0.9 && !canFireConfetti) canFireConfetti = true;
      }
    });

    const themes = [{ bg: "#E8E674", color: "#232321" }, { bg: "#C9D3D2", color: "#232321" }, { bg: "#6F4129", color: "#f8f8f4" }];
    cards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top center",
        end: "bottom center",
        onEnter: () => activate(index),
        onEnterBack: () => activate(index)
      });
    });

    function activate(index) {
      if (index === currentIndex) return;
      currentIndex = index;
      images.forEach((img, i) => {
        gsap.to(img, { autoAlpha: i === index ? 1 : 0, duration: 1.2, ease: "power2.inOut", overwrite: "auto" });
      });
      gsap.to(section, { backgroundColor: themes[index].bg, color: themes[index].color, duration: 1.2, ease: "power2.inOut", overwrite: "auto" });
    }
  });
})();

// --- 4. BLOB IMAGE REVEAL (THREE.JS + GLSL) ---
(() => {
  const fragmentShader = `
    varying vec2 vUv;
    uniform float uProgress;
    uniform vec2 uSize;
    uniform vec2 uImageSize;
    uniform sampler2D uTexture;
    #define PI 3.1415926538

    float noise(vec2 point) {
      float frequency = 1.0;
      float angle = atan(point.y, point.x) + uProgress * PI;
      float w0 = (cos(angle * frequency) + 1.0) / 2.0;
      float w1 = (sin(2. * angle * frequency) + 1.0) / 2.0;
      float w2 = (cos(3. * angle * frequency) + 1.0) / 2.0;
      return (w0 + w1 + w2) / 3.0;
    }

    float softMax(float a, float b, float k) { return log(exp(k * a) + exp(k * b)) / k; }
    float softMin(float a, float b, float k) { return -softMax(-a, -b, k); }

    float circleSDF(vec2 pos, float rad) {
      float a = sin(uProgress * 0.2) * 0.25;
      float amt = 0.5 + a;
      float circle = length(pos);
      circle += noise(pos) * rad * amt;
      return circle;
    }

    float radialCircles(vec2 p, float o, float count) {
      float angle = (2. * PI) / count;
      float s = round(atan(p.y, p.x) / angle);
      float an = angle * s;
      vec2 q = vec2(o * cos(an), o * sin(an));
      return circleSDF(p - q, 15.0);
    }

    void main() {
      vec2 ratio = vec2(
        min((uSize.x / uSize.y) / (uImageSize.x / uImageSize.y), 1.0),
        min((uSize.y / uSize.x) / (uImageSize.y / uImageSize.x), 1.0)
      );
      vec2 uv = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);
      vec2 coords = vUv * uSize;
      vec2 center = vec2(0.5) * uSize;
      float t = pow(uProgress, 2.5);
      float rad = t * (uSize.x / 1.5);
      float c1 = circleSDF(coords - center, rad);
      vec2 p = (vUv - 0.5) * uSize;
      float r1 = radialCircles(p, 0.2 * uSize.x, 3.0);
      float r2 = radialCircles(p, 0.25 * uSize.x, 3.0);
      float r3 = radialCircles(p, 0.45 * uSize.x, 5.0);
      float k = 50.0 / uSize.x;
      float circle = softMin(c1, r1, k);
      circle = softMin(circle, r2, k);
      circle = softMin(circle, r3, k);
      vec4 texColor = texture2D(uTexture, uv);
      gl_FragColor = mix(vec4(0.0), texColor, step(circle, rad));
    }
  `;

  function loadTexture(url) {
    return new Promise(resolve => {
      new THREE.TextureLoader().load(url, tex => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        resolve(tex);
      });
    });
  }

  async function init() {
    const [texRight, texLeft] = await Promise.all([
      loadTexture("https://cdn.prod.website-files.com/694bc4c4deccfa224de85419/6951260510be1b4af3a68f36_Ethos%20Image%202.png"),
      loadTexture("https://cdn.prod.website-files.com/694bc4c4deccfa224de85419/6967fc1cae0f9dc0fb95322f_iEOuMaqADXT9znbOq7rY2J5Go.avif")
    ]);
    initBlob({ wrapperId: "rightBlob", canvasId: "blob-canvas", texture: texRight });
    initBlob({ wrapperId: "leftBlob", canvasId: "blob-canvas-left", texture: texLeft });
  }

  function initBlob({ wrapperId, canvasId, texture }) {
    const wrapper = document.getElementById(wrapperId);
    const canvas = document.getElementById(canvasId);
    if (!wrapper || !canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uProgress: { value: 0 }, uSize: { value: new THREE.Vector2(1, 1) }, uImageSize: { value: new THREE.Vector2(texture.image.naturalWidth, texture.image.naturalHeight) }, uTexture: { value: texture } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }`,
      fragmentShader
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(mesh);

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      material.uniforms.uSize.value.set(rect.width, rect.height);
      mesh.scale.set(rect.width, rect.height, 1);
    };
    resize();
    window.addEventListener('resize', resize);
    const animate = () => { renderer.render(scene, camera); requestAnimationFrame(animate); };
    animate();

    gsap.to(material.uniforms.uProgress, { value: 1, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: wrapper, start: "top 50%", once: true } });
  }
  init();
})();

// --- 5. PHYSICS (MATTER.JS) ---
document.addEventListener("DOMContentLoaded", () => {
  const { Engine, Runner, Bodies, Body, Composite, Events, Vector } = Matter;
  const wrapper = document.querySelector(".physics-wrapper");
  const items = document.querySelectorAll(".physics-item");
  if (!wrapper || !items.length) return;

  const engine = Engine.create();
  engine.gravity.y = 0;
  const runner = Runner.create();
  Runner.run(runner, engine);

  const walls = [
    Bodies.rectangle(wrapper.offsetWidth / 2, wrapper.offsetHeight + 60, wrapper.offsetWidth, 120, { isStatic: true }),
    Bodies.rectangle(-60, wrapper.offsetHeight / 2, 120, wrapper.offsetHeight, { isStatic: true }),
    Bodies.rectangle(wrapper.offsetWidth + 60, wrapper.offsetHeight / 2, 120, wrapper.offsetHeight, { isStatic: true }),
    Bodies.rectangle(wrapper.offsetWidth / 2, -60, wrapper.offsetWidth, 120, { isStatic: true })
  ];
  Composite.add(engine.world, walls);

  const bodies = Array.from(items).map(el => {
    const body = Bodies.circle(Math.random() * wrapper.offsetWidth, Math.random() * wrapper.offsetHeight * 0.5, el.offsetWidth / 2, { restitution: 0.9, frictionAir: 0.05, inertia: Infinity });
    body.el = el;
    Composite.add(engine.world, body);
    return body;
  });

  Events.on(engine, "afterUpdate", () => {
    bodies.forEach(body => {
      body.el.style.transform = `translate(${body.position.x - body.el.offsetWidth / 2}px, ${body.position.y - body.el.offsetHeight / 2}px)`;
    });
  });
});

// --- 6. ADDITIONAL UI HELPERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Navigation Bar transition
  const nav = document.querySelector(".centered-nav");
  const hero = document.querySelector("#hero");
  if (nav && hero) {
    ScrollTrigger.create({
      start: () => `top+=${hero.offsetHeight} top`,
      onEnter: () => nav.style.backgroundColor = "var(--_color---neutral--black)",
      onLeaveBack: () => nav.style.backgroundColor = "transparent",
    });
  }

  // Footer Year
  const yearEl = document.querySelector('.current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
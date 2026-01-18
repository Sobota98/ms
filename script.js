// SMOOTH SCROLL START
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    smooth: 1.3,
    lerp: 0.08,
    wheelMultiplier: 1,
    //touchMultiplier: 1.2
  });

  // Sync Lenis with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Keep ScrollTrigger in sync on resize
  ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  ScrollTrigger.refresh();

// SMOOTH SCROLL END



// DESKTOP AND TABLET CONFETTI AND STICKY SCROLL SECTION START
// CONFETTI HELPER
window.triggerConfetti = (el) => {
  const isDisabledViewport =
    window.matchMedia("(max-width: 991px) and (orientation: landscape)").matches ||
    window.matchMedia("(max-width: 767px)").matches;

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
  const colors = el.dataset.colors
    ? el.dataset.colors.split(",")
    : undefined;

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
// Confetti helper end


(() => {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  
  // --- MOBILE & LANDSCAPE SETUP ---
  // Targets max-width 767px (mobile) and mobile landscape
mm.add("(max-width: 767px)", () => {
  const mobileSection = document.querySelector(".section.kompetanse");
  const mobileCards = gsap.utils.toArray(".kompetanse-card");

  if (!mobileSection || !mobileCards.length) return;

  gsap.set(mobileSection, { css: { transition: "none" } });

  const mobileThemes = [
    { bg: "#E8E674", color: "#232321" },
    { bg: "#C9D3D2", color: "#232321" },
    { bg: "#6F4129", color: "#f8f8f4" }
  ];

  mobileCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      // 🟢 The "Sweet Spot" Logic:
      // Start: When the TOP of this card hits the CENTER of the screen
      // End: When the BOTTOM of this card hits the CENTER of the screen
      start: "top center", 
      end: "bottom center",
      
      // Scrolling Down: top of card enters the center line
      onEnter: () => applyTheme(index),
      
      // Scrolling Up: bottom of card re-enters the center line from above
      onEnterBack: () => applyTheme(index),
    });
  });

  function applyTheme(index) {
    gsap.to(mobileSection, {
      backgroundColor: mobileThemes[index].bg,
      color: mobileThemes[index].color,
      duration: 0.8,
      ease: "power2.inOut",
      overwrite: "auto"
    });
  }
});

  // ✅ ONLY run on desktop + tablet portrait
  mm.add("(min-width: 768px)", () => {

    const section = document.querySelector(".section.kompetanse");
    const pinWrapper = document.getElementById("kompetanse-pinned");
    const cards = gsap.utils.toArray(".cc-kompetanse-card");
    const images = gsap.utils.toArray(".cc-kompetanse-img");

    if (!section || !pinWrapper || !cards.length) return;

    // 🛡️ FIX 1: Force disable CSS transitions to prevent the "White Flash"
    gsap.set(section, { css: { transition: "none" } });

    // Initial state
    gsap.set(images, { autoAlpha: 0 });
    gsap.set(images[0], { autoAlpha: 1 });

    let canFireConfetti = true;
    let isFirstRun = true;
    let currentIndex = -1; // 🛡️ FIX 2: Track active card to prevent overlapping calls

    ScrollTrigger.create({
      trigger: pinWrapper,
      start: "top top",
      endTrigger: cards[cards.length - 1],
      end: "center center",
      pin: pinWrapper,
      pinSpacing: false,
      anticipatePin: 1,
      onUpdate(self) {
        // Prevent confetti on load
        if (isFirstRun) {
            if (self.progress > 0.9) canFireConfetti = false;
            isFirstRun = false;
            return;
        }

        // Fire Confetti Logic
        if (self.direction === 1 && self.progress >= 0.99 && canFireConfetti) {
          canFireConfetti = false;
          triggerConfetti(cards[cards.length - 1]);
        }
        if (self.direction === -1 && self.progress <= 0.9 && !canFireConfetti) {
          canFireConfetti = true;
        }
      }
    });

    const themes = [
      { bg: "#E8E674", color: "#232321" },
      { bg: "#C9D3D2", color: "#232321" },
      { bg: "#6F4129", color: "#f8f8f4" }
    ];

    cards.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top center",
        end: "bottom center",
        // 🛡️ FIX 3: Use immediate activation logic
        onEnter: () => activate(index),
        onEnterBack: () => activate(index)
      });
    });

    function activate(index) {
      // 🛡️ FIX 4: If we are already on this index, do nothing (stops stuttering)
      if (index === currentIndex) return;
      currentIndex = index;

      images.forEach((img, i) => {
        gsap.to(img, {
          autoAlpha: i === index ? 1 : 0,
          duration: 1.2,          // Slightly slower for smoothness
          ease: "power2.inOut",   // Smooth curve for both directions
          overwrite: "auto"
        });
      });

      gsap.to(section, {
        backgroundColor: themes[index].bg,
        color: themes[index].color,
        duration: 1.2,          // Matching duration
        ease: "power2.inOut",   // Matching ease
        overwrite: "auto"       // Ensures smooth blending if you scroll fast
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  });
})();
// DESKTOP AND TABLET CONFETTI AND STICKY SCROLL SECTION END !-->



// GSAP TEXT STAGGERED ANIMATION START -->

window.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(SplitText, ScrollTrigger);

  // Set elements to visible now that GSAP is ready
  gsap.set("[data-split]", { opacity: 1 });

  // 1. WORDS ANIMATION
  document.querySelectorAll('[data-split="words"]').forEach((el) => {
    let mySplit = new SplitText(el, { type: "words" });
    
    gsap.from(mySplit.words, {
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
      },
      duration: 0.5,
      yPercent: 100, // Slides up from below
      opacity: 0,
      stagger: 0.2,
      ease: "elastic.out(1,1)"
    });
  });

  // 2. LINES ANIMATION
  document.querySelectorAll('[data-split="lines"]').forEach((el) => {
    // We wrap lines to create a "masking" effect
    let mySplit = new SplitText(el, { type: "lines", linesClass: "line-child" });
    let parentSplit = new SplitText(el, { type: "lines", linesClass: "line-parent" });

    gsap.from(mySplit.lines, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
      delay: 0.3,
      duration: 0.5,
      yPercent: 100,
      opacity: 0,
      stagger: 0.2,
      ease: "power1.out"
    });
  });
});
// GSAP TEXT STAGGERED ANIMATION END -->

// NAVIGATION BAR TRANSITION START -->

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const nav = document.querySelector(".centered-nav");
  const hero = document.querySelector("#hero");

  ScrollTrigger.matchMedia({

    // DESKTOP ONLY
    "(min-width: 1440px)": function () {

      // Ensure clean visual state
      gsap.set(nav, { yPercent: 0 });

      // Hide / show animation
      const showNav = gsap.to(nav, {
        yPercent: -100,
        paused: true,
        duration: 0.3,
        ease: "none"
      });

      // Scroll direction logic
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: self => {
          self.direction === 1 ? showNav.play() : showNav.reverse();
        }
      });

      // Background color logic
      ScrollTrigger.create({
        trigger: document.body,
        start: () => `top+=${hero.offsetHeight} top`,
        end: "max",
        onEnter: () => nav.style.backgroundColor = "var(--_color---neutral--black)",
        onLeaveBack: () => nav.style.backgroundColor = "transparent",
        invalidateOnRefresh: true
      });

    },

    // BELOW 1440px (cleanup + reset)
    "(max-width: 1439px)": function () {
      gsap.set(nav, {
        clearProps: "transform,backgroundColor"
      });
    }

  });

});

//  NAVIGATION BAR TRANSITION END -->


//  CUSTOM CURSOR VIDEO START !-->
const wrapper = document.querySelector('.cc-hero-video-wrapper');
const cursor = document.querySelector('.cc-cursor-video');

wrapper.addEventListener("mousemove", (e) => {
  // Get the bounds of the wrapper
  const rect = wrapper.getBoundingClientRect();
  
  // Calculate the mouse position relative to the wrapper
  const relX = e.clientX - rect.left;
  const relY = e.clientY - rect.top;

  // Animate to those coordinates
  gsap.to(cursor, {
    x: relX,
    y: relY,
    duration: 0.6,
    ease: "none"
  });
});
// CUSTOM CURSOR VIDEO END !-->


//  BLOB IMAGE REVEAL CODE START !-->
(() => {
  gsap.registerPlugin(ScrollTrigger);

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

    float softMax(float a, float b, float k) {
      return log(exp(k * a) + exp(k * b)) / k;
    }

    float softMin(float a, float b, float k) {
      return -softMax(-a, -b, k);
    }

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

      vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
      );

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

      vec4 bg = vec4(0.0);
      vec4 texColor = texture2D(uTexture, uv);

      gl_FragColor = mix(bg, texColor, step(circle, rad));
    }
  `;

  // --- Utility to load a texture and return a Promise ---
  function loadTexture(url) {
    return new Promise(resolve => {
      new THREE.TextureLoader().load(url, tex => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        resolve(tex);
      });
    });
  }

  async function init() {
    // Load all textures first
    const [texRight, texLeft] = await Promise.all([
      loadTexture("https://cdn.prod.website-files.com/694bc4c4deccfa224de85419/6951260510be1b4af3a68f36_Ethos%20Image%202.png"),
      loadTexture("https://cdn.prod.website-files.com/694bc4c4deccfa224de85419/6967fc1cae0f9dc0fb95322f_iEOuMaqADXT9znbOq7rY2J5Go.avif")
    ]);

    // Once textures are ready, initialize blobs
    initBlob({
      wrapperId: "rightBlob",
      canvasId: "blob-canvas",
      texture: texRight
    });

    initBlob({
      wrapperId: "leftBlob",
      canvasId: "blob-canvas-left",
      texture: texLeft
    });
  }

  function initBlob({ wrapperId, canvasId, texture }) {
    const wrapper = document.getElementById(wrapperId);
    const canvas = document.getElementById(canvasId);
    if (!wrapper || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uProgress: { value: 0 },
        uSize: { value: new THREE.Vector2(1, 1) },
        uImageSize: { value: new THREE.Vector2(texture.image.naturalWidth, texture.image.naturalHeight) },
        uTexture: { value: texture }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(mesh);

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      renderer.setSize(rect.width, rect.height);
      material.uniforms.uSize.value.set(rect.width, rect.height);

      camera.left = -rect.width / 2;
      camera.right = rect.width / 2;
      camera.top = rect.height / 2;
      camera.bottom = -rect.height / 2;
      camera.updateProjectionMatrix();

      mesh.scale.set(rect.width, rect.height, 1);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(() => requestAnimationFrame(resize));

    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    gsap.fromTo(
      material.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 50%",
          once: true,
          invalidateOnRefresh: true
        }
      }
    );
  }

  // Start everything
  init();
})();
// BLOB IMAGE REVEAL CODE END !-->


//  TJENSTER SECTION CODE START !-->

function initPreviewFollower() {
  const globalFollower = document.querySelector('[data-follower-cursor]');
  const globalInner = document.querySelector('[data-follower-cursor-inner]');
  const wrappers = document.querySelectorAll('[data-follower-wrap]');

  if (!globalFollower || !globalInner) return;

  let prevIndex = null;
  const offset = 100;
  const duration = 0.4;
  const ease = 'power3.out';

  // 1. Precise Mouse Tracking
  const xTo = gsap.quickTo(globalFollower, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(globalFollower, "y", { duration: 0.6, ease: "power3" });

  window.addEventListener("mousemove", e => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  gsap.set(globalFollower, { xPercent: 100, yPercent: -50 });

  // 2. Interaction Logic
  wrappers.forEach(wrap => {
    const items = wrap.querySelectorAll('[data-follower-item]');

    items.forEach((item, index) => {

      /* --------------------
         ENTER ITEM
      -------------------- */
      item.addEventListener('mouseenter', () => {
        const forward = prevIndex === null || index > prevIndex;
        prevIndex = index;

        // Remove existing visuals
        const existingVisuals = globalInner.querySelectorAll('[data-follower-visual]');
        existingVisuals.forEach(el => {
          gsap.to(el, {
            yPercent: forward ? -offset : offset,
            opacity: 0,
            duration,
            onComplete: () => el.remove()
          });
        });

        // Clone new visual
        const sourceVisual = item.querySelector('[data-follower-visual]');
        if (!sourceVisual) return;

        const clone = sourceVisual.cloneNode(true);
        gsap.set(clone, {
          display: 'block',
          opacity: 1,
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        });

        globalInner.appendChild(clone);

        gsap.fromTo(
          clone,
          { yPercent: forward ? offset : -offset },
          { yPercent: 0, duration, ease }
        );
      });

      /* --------------------
         LEAVE ITEM → REMOVE VISUAL
      -------------------- */
      item.addEventListener('mouseleave', () => {
        prevIndex = null;

        const visuals = globalInner.querySelectorAll('[data-follower-visual]');

        gsap.to(visuals, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            visuals.forEach(el => el.remove());
          }
        });
      });

    });
  });
}

document.addEventListener("DOMContentLoaded", initPreviewFollower);
// END

// Tjenester text replicate animation  !-->

document.addEventListener('DOMContentLoaded', () => {
    // **Skip touch devices**
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    // Select all elements with the data-gsap="btn" attribute
    const elements = document.querySelectorAll('[data-gsap="btn"]');
    
    if (elements.length === 0) {
        console.error('No elements with data-gsap="btn" found');
        return;
    }

    elements.forEach((element, index) => {
        const originalText = element.querySelector('.og-text');
        if (!originalText) {
            console.error(`Element with class "og-text" not found inside element ${index + 1}`);
            return;
        }

        const clonedText = originalText.cloneNode(true);
        clonedText.classList.add('clone');
        element.appendChild(clonedText);

        gsap.set(clonedText, { y: '100%', position: "absolute" });

        element.addEventListener('mouseenter', () => {
            animateText(originalText, '-100%');
            animateText(clonedText, '0%');
        });

        element.addEventListener('mouseleave', () => {
            animateText(originalText, '0%');
            animateText(clonedText, '100%');
        });
    });
});

function animateText(textElement, yPosition) {
    gsap.to(textElement, {
        y: yPosition,
        duration: 0.5,
        ease: "elastic.out(1,0.85)",
    });
}

//  Tjenester text replicate animation  !-->

//  Tjenester parallax scroll animation  !-->

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.matchMedia({

  /* =========================
     DESKTOP (992px+)
  ========================== */
  "(min-width: 992px)": function () {

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tjenester",
        start: "top center",
        end: "bottom center",
        scrub: true
      }
    });

    tl.fromTo(".tjenester-absolute_1", { y: -60 }, { y: 120, force3D: true }, 0)
      .fromTo(".tjenester-absolute_2", { y: -90 }, { y: 50, force3D: true }, 0)
      .fromTo(".tjenester-absolute_3", { y: 150 }, { y: -80, force3D: true }, 0)
      .fromTo(".tjenester-absolute_5", { y: -90 }, { y: 50, force3D: true }, 0)
      .fromTo(".tjenester-absolute_6", { y: 150 }, { y: -80, force3D: true }, 0)
      .fromTo(".tjenester-absolute_4", { x: 200 }, { x: -100, force3D: true }, 0);
  },

  /* =========================
     TABLET (768px – 991px)
  ========================== */
  "(min-width: 768px) and (max-width: 991px)": function () {

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tjenester",
        start: "top center",
        end: "bottom center",
        scrub: true
      }
    });

    tl.fromTo(".tjenester-absolute_1", { y: -80 }, { y: 60, force3D: true }, 0)
      .fromTo(".tjenester-absolute_2", { y: -70 }, { y: 30, force3D: true }, 0)
      .fromTo(".tjenester-absolute_3", { y: 90 }, { y: -50, force3D: true }, 0)
      .fromTo(".tjenester-absolute_5", { y: -70 }, { y: 30, force3D: true }, 0)
      .fromTo(".tjenester-absolute_6", { y: 90 }, { y: -50, force3D: true }, 0)
      .fromTo(".tjenester-absolute_4", { x: 120 }, { x: -60, force3D: true }, 0);
  },

  /* =========================
     MOBILE LANDSCAPE & DOWN (≤767px)
  ========================== */
  "(max-width: 767px)": function () {

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tjenester",
        start: "top center",
        end: "bottom center",
        scrub: true
      }
    });

    tl.fromTo(".tjenester-absolute_1", { y: -90 }, { y: 20, force3D: true }, 0)
      .fromTo(".tjenester-absolute_2", { y: -45 }, { y: 0, force3D: true }, 0)
      .fromTo(".tjenester-absolute_3", { y: 50 }, { y: -25, force3D: true }, 0)
      .fromTo(".tjenester-absolute_5", { y: -50 }, { y: 0, force3D: true }, 0)
      .fromTo(".tjenester-absolute_6", { y: 50 }, { y: -20, force3D: true }, 0)
      .fromTo(".tjenester-absolute_4", { x: 50 }, { x: 0, force3D: true }, 0);
  }

});

//  Tjenester parallax scroll animation  !-->
//  TJENSTER SECTION CODE END !-->


//  TEAM CODE CARDS START !-->

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const cards = gsap.utils.toArray(".team_4-1-div");

  gsap.from(cards, {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: "ease.out",
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".team-container",
      start: "top 75%",
      toggleActions: "play none none none",
    }
  });
});




document.addEventListener("DOMContentLoaded", () => {
  const isTouch = window.matchMedia("(hover: none)").matches;

  document.querySelectorAll(".team_4-1-div").forEach(card => {
    const img = card.querySelector(".team-4-1_img");
    const links = card.querySelectorAll(".team_link-wrapper");

    const tl = gsap.timeline({ paused: true });

    tl.to(img, {
      scale: 1.1,
      duration: 0.2,
      ease: "ease.out"
    }, 0)
    .to(links, {
      y: -70,
      duration: 0.3,
      ease: "elastic.out(1, 1)",
    }, 0);

    if (!isTouch) {
      // Desktop hover
      card.addEventListener("mouseenter", () => tl.play());
      card.addEventListener("mouseleave", () => tl.reverse());
    } else {
      // Touch → tap toggle
      let active = false;

      card.addEventListener("click", (e) => {
        // Allow links to work normally
        if (e.target.closest("a")) return;

        active ? tl.reverse() : tl.play();
        active = !active;
      });
    }
  });
});


//  TEAM CODE CARDS END !-->

//  TEAM SPLIT TEXT START !-->

gsap.registerPlugin(SplitText);

const texts = [
  "Interiørarkitektur",
  "Grafisk design",
  "3D-visualisering",
  "Konseptutvikling",
  "Prosjektledelse",
  "Design"
];

const el = document.querySelector("#rotating-text");
let index = 0;

function updateAndAnimate() {
  // 1. Change the text first
  el.textContent = texts[index];

  // 2. Split it
  const split = new SplitText(el, { type: "chars", charsClass: "char" });

  // 3. Create the timeline
  const tl = gsap.timeline({
    onComplete: () => {
      // 4. IMPORTANT: Clean up the old split before starting the next cycle
      split.revert();
      index = (index + 1) % texts.length;
      updateAndAnimate();
    }
  });

  // 5. The Animation Sequence
  tl.from(split.chars, {
    yPercent: 100,
    autoAlpha: 0,
    stagger: 0.02,
    duration: 0.5,
    ease: "back.out(1.4)" // Adds a nice little bounce
  })
  .to({}, { duration: 1.5 }) // This is your "Wait time" while text is visible
  .to(split.chars, {
    yPercent: -100,
    autoAlpha: 0,
    stagger: 0.01,
    duration: 0.4,
    ease: "power2.in"
  });
}

// Kick off the first run
updateAndAnimate();
// TEAM SPLIT TEXT END !-->



//  TEAM PHYSICS CODE START !-->

document.addEventListener("DOMContentLoaded", () => {
  const { Engine, Runner, Bodies, Body, Composite, Events, Vector } = Matter;

  const wrapper = document.querySelector(".physics-wrapper");
  const items = document.querySelectorAll(".physics-item");

  if (!wrapper || !items.length) return;

  const width = wrapper.offsetWidth;
  const height = wrapper.offsetHeight;

  /* ENGINE */
  const engine = Engine.create();
  engine.gravity.y = 0; // no gravity
  const runner = Runner.create();
  Runner.run(runner, engine);

  /* WALLS */
  const walls = [
    Bodies.rectangle(width / 2, height + 60, width, 120, { isStatic: true }),
    Bodies.rectangle(-60, height / 2, 120, height, { isStatic: true }),
    Bodies.rectangle(width + 60, height / 2, 120, height, { isStatic: true }),
    Bodies.rectangle(width / 2, -60, width, 120, { isStatic: true })
  ];
  Composite.add(engine.world, walls);

  /* IMAGE BODIES */
  const bodies = [];
  items.forEach((el) => {
    const size = el.offsetWidth;
    const body = Bodies.circle(
      Math.random() * width,
      Math.random() * height * 0.5,
      size / 2,
      {
        restitution: 0.9,
        friction: 0.01,
        frictionAir: 0.05,
        inertia: Infinity // prevent rotation
      }
    );
    body.el = el;
    bodies.push(body);
    Composite.add(engine.world, body);
  });

  /* SYNC DOM TO PHYSICS */
  Events.on(engine, "afterUpdate", () => {
    bodies.forEach((body) => {
      const { x, y } = body.position;
      body.el.style.transform =
        `translate(${x - body.el.offsetWidth / 2}px,
                   ${y - body.el.offsetHeight / 2}px)`;
    });
  });

  /* MOUSE / TOUCH DETECTION */
  const mouse = { x: 0, y: 0 };
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Hide overlay on desktop
  const overlay = document.getElementById("gyro-overlay");
  if (!isTouch && overlay) overlay.style.display = "none";

  // Mouse tracking for desktop
  if (!isTouch) {
    document.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
  }

  /* GYROSCOPE */
  let gyroEnabled = false;
  const tilt = { x: 0, y: 0 };

  if (isTouch && overlay) {
    overlay.addEventListener("click", () => {
      if (typeof DeviceOrientationEvent !== "undefined" &&
          typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then(response => {
            if (response === "granted") {
              gyroEnabled = true;
              overlay.style.opacity = "0";
							overlay.style.pointerEvents = "none";
            } else {
              alert("Motion access denied.");
            }
          })
          .catch(() => alert("Motion access not supported."));
      } else {
        // fallback for non-iOS
        gyroEnabled = true;
        overlay.style.display = "none";
      }
    });

    // Read device orientation
    window.addEventListener("deviceorientation", (e) => {
      if (!gyroEnabled) return;
      tilt.x = Math.max(-30, Math.min(30, e.gamma || 0)); // left/right tilt
      tilt.y = Math.max(-30, Math.min(30, e.beta || 0));  // forward/back tilt
    });
  }

  /* APPLY FORCES */
  Events.on(engine, "beforeUpdate", () => {
    bodies.forEach((body) => {
      // Mouse repel on desktop
      if (!isTouch) {
        const direction = Vector.sub(body.position, mouse);
        const distance = Vector.magnitude(direction);
        if (distance < 180) {
          const force = Vector.normalise(direction);
          const strength = (1 - distance / 180) * 0.008;
          Body.applyForce(body, body.position, {
            x: force.x * strength,
            y: force.y * strength
          });
        }
      }

      // Gyro force on mobile
      if (gyroEnabled) {
        Body.applyForce(body, body.position, {
          x: tilt.x * 0.00003,
          y: tilt.y * 0.00003
        });
      }
    });
  });
});

//  TEAM PHYSICS CODE END !-->


//  FOOTER CUSTOM CODE !-->
//  Displays current year in footer -->

$(function() {
$('.current-year').text(new Date().getFullYear());
});
//  Displays current year in footer -->
//   FOOTER CUSTOM CODE END !-->
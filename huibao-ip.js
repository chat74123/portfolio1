const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".design-notes article, .turnaround-panel, .world-card, .final-section img").forEach((element) => {
  element.classList.add("reveal");
  revealObserver.observe(element);
});

const hero = document.querySelector(".ip-hero");
const storyScene = document.querySelector(".story-scene");
const storyImages = [...document.querySelectorAll(".persona-image")];
const storySteps = [...document.querySelectorAll(".story-step")];

function sceneProgress(element, lead = 0.72) {
  const rect = element.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight * 0.32);
  return clamp((window.innerHeight * lead - rect.top) / travel, 0, 1);
}

function updateHero() {
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  const progress = clamp(-rect.top / Math.max(1, rect.height), 0, 1);
  hero.style.setProperty("--hero-progress", progress.toFixed(3));
}

function updateStory() {
  if (!storyScene) return;
  const progress = sceneProgress(storyScene, 0.64);
  const step = clamp(Math.floor(progress * storyImages.length), 0, storyImages.length - 1);

  storyScene.style.setProperty("--progress", progress.toFixed(3));
  storyScene.style.setProperty("--active-step", step);

  storyImages.forEach((image, index) => {
    image.classList.toggle("active", index === step);
  });

  storySteps.forEach((card, index) => {
    card.classList.toggle("active", index === step);
  });
}

let ticking = false;

function updateScrollEffects() {
  if (prefersReducedMotion) return;
  updateHero();
  updateStory();
}

function requestScrollUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateScrollEffects();
    ticking = false;
  });
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollEffects();

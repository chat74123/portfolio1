const page = document.documentElement;
const body = document.body;

if (!body.classList.contains("case-page")) {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const cursor = document.createElement("div");
  cursor.className = "design-cursor";
  document.body.appendChild(cursor);

  const heroTitle = document.querySelector(".hero h1");
  if (heroTitle) {
    const sourceText = heroTitle.innerText.trim();
    heroTitle.setAttribute("aria-label", sourceText.replace(/\s+/g, " "));

    const titleLines = sourceText.split(/\n+/).filter(Boolean);
    heroTitle.replaceChildren();
    titleLines.forEach((line, lineIndex) => {
      const lineElement = document.createElement("span");
      lineElement.className = "hero-title-line";
      line.match(/\S+|\s+/g)?.forEach((token) => {
        if (/^\s+$/.test(token)) {
          const spaceElement = document.createElement("span");
          spaceElement.className = "hero-title-space";
          spaceElement.textContent = " ";
          lineElement.appendChild(spaceElement);
          return;
        }

        const wordElement = document.createElement("span");
        wordElement.className = "hero-title-word";
        Array.from(token).forEach((char) => {
          const charElement = document.createElement("span");
          charElement.className = "hero-title-char";
          charElement.textContent = char;
          wordElement.appendChild(charElement);
        });
        lineElement.appendChild(wordElement);
      });
      heroTitle.appendChild(lineElement);
      if (lineIndex < titleLines.length - 1) heroTitle.appendChild(document.createElement("br"));
    });
  }

  const interactive = "a, button, .project-gallery, .ip-preview-card, figure";
  const repertoireGroups = Array.from(document.querySelectorAll(".repertoire div"));
  const repertoireExpandedHeight = 230;

  const getRepertoireGroupAtPoint = (x, y) => {
    if (window.matchMedia("(max-width: 760px)").matches) return null;

    return repertoireGroups.find((group) => {
      const rect = group.getBoundingClientRect();
      const expandedBottom = Math.max(rect.bottom, rect.top + repertoireExpandedHeight);
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= expandedBottom;
    });
  };

  window.addEventListener("pointermove", (event) => {
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

    const hero = document.querySelector(".hero");
    if (hero) {
      const rect = hero.getBoundingClientRect();
      if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
        hero.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      }
    }

    const titleChars = document.querySelectorAll(".hero-title-char");
    if (titleChars.length) {
      titleChars.forEach((char) => {
        const rect = char.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        const distance = Math.hypot(event.clientX - charX, event.clientY - charY);
        const influence = Math.max(0, 1 - distance / 150);
        char.style.setProperty("--title-lift", `${-18 * influence}px`);
        char.style.setProperty("--title-scale", `${1 + 0.09 * influence}`);
        char.style.setProperty("--title-glow", `${influence}`);
      });
    }

    const activeRepertoireGroup = getRepertoireGroupAtPoint(event.clientX, event.clientY);
    repertoireGroups.forEach((group) => {
      group.classList.toggle("is-expanded", group === activeRepertoireGroup);
    });

    cursor.classList.toggle("is-active", Boolean(event.target.closest(interactive)));
  });

  document.querySelector(".repertoire")?.addEventListener("pointerleave", (event) => {
    if (getRepertoireGroupAtPoint(event.clientX, event.clientY)) return;
    repertoireGroups.forEach((group) => group.classList.remove("is-expanded"));
  });

  heroTitle?.addEventListener("pointerleave", () => {
    document.querySelectorAll(".hero-title-char").forEach((char) => {
      char.style.removeProperty("--title-lift");
      char.style.removeProperty("--title-scale");
      char.style.removeProperty("--title-glow");
    });
  });

  window.addEventListener("scroll", () => {
    const max = page.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = `scaleX(${ratio})`;
  }, { passive: true });

  document.querySelectorAll(".intro, .project-story, .archive, .profile, .contact").forEach((element) => {
    element.classList.add("reveal");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  document.querySelectorAll(".repertoire div").forEach((group) => {
    group.addEventListener("pointermove", (event) => {
      const rect = group.getBoundingClientRect();
      group.style.setProperty("--spot-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      group.style.setProperty("--spot-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });

  const navItems = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const navTargets = navItems
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActiveNav = (id) => {
    navItems.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
        if (window.matchMedia("(max-width: 760px)").matches) {
          link.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (navTargets.length) {
    setActiveNav(navTargets[0].id);

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    }, {
      rootMargin: "-34% 0px -54%",
      threshold: 0,
    });

    navTargets.forEach((target) => navObserver.observe(target));
  }

  const atlasLinks = Array.from(document.querySelectorAll(".project-atlas a[href^='#']"));
  const chapterSections = Array.from(document.querySelectorAll("[data-chapter][id]"));
  const chapterIndex = document.querySelector(".chapter-meter-index");
  const chapterTitle = document.querySelector(".chapter-meter-title");
  const chapterLine = document.querySelector(".chapter-meter-line");

  const setActiveChapter = (section) => {
    if (!section) return;
    const id = section.id;
    const chapter = section.dataset.chapter || "00";
    const title = section.dataset.chapterTitle || "Index";

    atlasLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    if (chapterIndex) chapterIndex.textContent = chapter;
    if (chapterTitle) chapterTitle.textContent = title;
    if (chapterLine) {
      const total = Math.max(chapterSections.length - 1, 1);
      const current = Math.max(chapterSections.indexOf(section), 0);
      chapterLine.style.setProperty("--chapter-progress", `${current / total}`);
    }
  };

  if (chapterSections.length) {
    setActiveChapter(chapterSections[0]);

    const chapterObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveChapter(visible.target);
    }, {
      rootMargin: "-28% 0px -48% 0px",
      threshold: [0.08, 0.2, 0.42, 0.68],
    });

    chapterSections.forEach((section) => chapterObserver.observe(section));
  }
  document.querySelectorAll(".inline-link, .mail-link, .brand").forEach((element) => {
    element.classList.add("magnetic");
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });

  document.querySelectorAll(".project-gallery").forEach((gallery) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    gallery.addEventListener("pointerdown", (event) => {
      isDown = true;
      gallery.classList.add("is-dragging");
      gallery.setPointerCapture(event.pointerId);
      startX = event.clientX;
      scrollLeft = gallery.scrollLeft;
    });

    gallery.addEventListener("pointermove", (event) => {
      if (!isDown) return;
      event.preventDefault();
      gallery.scrollLeft = scrollLeft - (event.clientX - startX);
    });

    const stopDragging = () => {
      isDown = false;
      gallery.classList.remove("is-dragging");
    };

    gallery.addEventListener("pointerup", stopDragging);
    gallery.addEventListener("pointercancel", stopDragging);
    gallery.addEventListener("pointerleave", stopDragging);
  });

  const videos = document.querySelectorAll(".auto-video");
  if (videos.length) {
    const visibleVideos = new Set();
    const hydrateVideo = (video) => {
      if (!video.dataset.src || video.getAttribute("src")) return;
      video.src = video.dataset.src;
      video.load();
    };

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          hydrateVideo(video);
          visibleVideos.add(video);
        } else {
          visibleVideos.delete(video);
        }

        if (entry.isIntersecting && !document.hidden) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, {
      rootMargin: "0px",
      threshold: 0.32,
    });

    videos.forEach((video) => videoObserver.observe(video));

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        videos.forEach((video) => video.pause());
        return;
      }

      visibleVideos.forEach((video) => video.play().catch(() => {}));
    });
  }

  const posterStage = document.querySelector(".poster-stage");
  const posterStageImage = document.querySelector("#poster-stage-image");
  const posterStageCategory = document.querySelector("#poster-stage-category");
  const posterStageTitle = document.querySelector("#poster-stage-title");
  const posterThumbs = Array.from(document.querySelectorAll(".poster-thumb"));
  const posterTabs = document.querySelectorAll(".poster-tab");
  const categoryLabels = {
    appliance: "家电类海报",
    event: "活动主 KV",
  };
  let activePosterCategory = "all";
  let activePosterIndex = 0;
  let activePosterThumb = posterThumbs[0];

  const visiblePosterThumbs = () => posterThumbs.filter((thumb) => {
    return activePosterCategory === "all" || thumb.dataset.category === activePosterCategory;
  });

  const setPoster = (thumb, direction = 1) => {
    if (!thumb || !posterStageImage) return;
    const previousThumb = activePosterThumb;
    const previousItems = visiblePosterThumbs();
    const previousIndex = previousItems.indexOf(previousThumb);
    const nextIndex = previousItems.indexOf(thumb);
    if (direction === 0 && previousIndex !== -1 && nextIndex !== -1) {
      direction = nextIndex >= previousIndex ? 1 : -1;
    }

    posterThumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
    activePosterIndex = visiblePosterThumbs().indexOf(thumb);
    activePosterThumb = thumb;

    posterStage?.classList.remove("is-exiting-left", "is-exiting-right", "is-entering-left", "is-entering-right");
    posterStage?.classList.add(direction >= 0 ? "is-exiting-left" : "is-exiting-right");
    window.setTimeout(() => {
      posterStageImage.src = thumb.dataset.src;
      posterStageImage.alt = `${categoryLabels[thumb.dataset.category] || "海报"} ${thumb.dataset.title}`;
      if (posterStageCategory) posterStageCategory.textContent = categoryLabels[thumb.dataset.category] || "海报";
      if (posterStageTitle) posterStageTitle.textContent = thumb.dataset.title;
      posterStage?.classList.remove("is-exiting-left", "is-exiting-right");
      posterStage?.classList.add(direction >= 0 ? "is-entering-left" : "is-entering-right");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          posterStage?.classList.remove("is-entering-left", "is-entering-right");
        });
      });
    }, 180);
  };

  posterThumbs.forEach((thumb) => {
    thumb.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setPoster(thumb, 0);
      thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  document.querySelector(".poster-lab")?.addEventListener("click", (event) => {
    const thumb = event.target.closest(".poster-thumb");
    if (thumb) {
      event.preventDefault();
      setPoster(thumb, 0);
      thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });

  posterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activePosterCategory = tab.dataset.posterCategory;
      posterTabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");

      posterThumbs.forEach((thumb) => {
        const shouldShow = activePosterCategory === "all" || thumb.dataset.category === activePosterCategory;
        thumb.classList.toggle("is-hidden", !shouldShow);
      });

      const firstVisible = visiblePosterThumbs()[0];
      setPoster(firstVisible, 1);
      firstVisible?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  const movePoster = (direction) => {
    const items = visiblePosterThumbs();
    if (!items.length) return;
    const nextIndex = (activePosterIndex + direction + items.length) % items.length;
    setPoster(items[nextIndex], direction);
    items[nextIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  document.querySelectorAll("[data-poster-prev]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      movePoster(-1);
    });
  });
  document.querySelectorAll("[data-poster-next]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      movePoster(1);
    });
  });

  if (posterStage) {
    let startX = 0;
    let startY = 0;
    let draggingStage = false;

    posterStage.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      draggingStage = true;
      startX = event.clientX;
      startY = event.clientY;
      posterStage.setPointerCapture(event.pointerId);
    });

    posterStage.addEventListener("pointerup", (event) => {
      if (!draggingStage) return;
      draggingStage = false;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        movePoster(deltaX < 0 ? 1 : -1);
      }
    });

    posterStage.addEventListener("pointercancel", () => {
      draggingStage = false;
    });
  }

  document.querySelectorAll(".poster-rail").forEach((rail) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    rail.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".poster-thumb")) return;
      isDown = true;
      rail.setPointerCapture(event.pointerId);
      startX = event.clientX;
      scrollLeft = rail.scrollLeft;
    });

    rail.addEventListener("pointermove", (event) => {
      if (!isDown) return;
      event.preventDefault();
      rail.scrollLeft = scrollLeft - (event.clientX - startX);
    });

    const stopDragging = () => {
      isDown = false;
    };

    rail.addEventListener("pointerup", stopDragging);
    rail.addEventListener("pointercancel", stopDragging);
    rail.addEventListener("pointerleave", stopDragging);
  });

  const productMeta = {
    speaker: {
      index: "PRODUCT 01",
      name: "小黄人音响设计",
      desc: "以角色化语言塑造桌面音响外观，强调亲和力、趣味比例和家居场景中的识别度。",
      focus: "角色化造型 / 桌面产品",
      count: "5 张外观图",
    },
    "tea-machine": {
      index: "PRODUCT 02",
      name: "茶吧机产品外观",
      desc: "围绕饮水场景建立简洁、稳定、带有家居亲和力的产品外观，强调比例、结构与细节层次。",
      focus: "家电外观 / 饮水场景",
      count: "7 张外观图",
    },
  };

  const productTabs = document.querySelectorAll(".product-tab");
  const productThumbs = Array.from(document.querySelectorAll(".product-thumb"));
  const productStage = document.querySelector(".product-stage");
  const productStageImage = document.querySelector("#product-stage-image");
  let activeProduct = "speaker";
  let activeProductIndex = 0;

  const visibleProductThumbs = () => productThumbs.filter((thumb) => thumb.dataset.product === activeProduct);

  const updateProductCopy = () => {
    const meta = productMeta[activeProduct];
    if (!meta) return;
    const setText = (selector, value) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = value;
    };
    setText("#product-index", meta.index);
    setText("#product-name", meta.name);
    setText("#product-desc", meta.desc);
    setText("#product-focus", meta.focus);
    setText("#product-count", meta.count);
  };

  const setProductImage = (thumb) => {
    if (!thumb || !productStageImage) return;
    productThumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
    activeProductIndex = visibleProductThumbs().indexOf(thumb);
    productStage?.classList.add("is-switching");
    window.setTimeout(() => {
      productStageImage.src = thumb.dataset.src;
      productStageImage.alt = productMeta[thumb.dataset.product]?.name || "产品外观设计";
      productStage?.classList.remove("is-switching");
    }, 150);
  };

  const setProduct = (product) => {
    activeProduct = product;
    productTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.product === product));
    productThumbs.forEach((thumb) => {
      thumb.classList.toggle("is-hidden", thumb.dataset.product !== product);
    });
    updateProductCopy();
    const first = visibleProductThumbs()[0];
    setProductImage(first);
    first?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  productTabs.forEach((tab) => {
    tab.addEventListener("click", () => setProduct(tab.dataset.product));
  });

  productThumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      setProductImage(thumb);
      thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  const moveProduct = (direction) => {
    const items = visibleProductThumbs();
    if (!items.length) return;
    const next = (activeProductIndex + direction + items.length) % items.length;
    setProductImage(items[next]);
    items[next].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  document.querySelector("[data-product-prev]")?.addEventListener("click", () => moveProduct(-1));
  document.querySelector("[data-product-next]")?.addEventListener("click", () => moveProduct(1));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});



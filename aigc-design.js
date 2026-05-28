const canvas = document.querySelector("#neural-canvas");
const ctx = canvas.getContext("2d");
const cursor = document.querySelector(".cursor-glow");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let raf = 0;
let motionOn = !prefersReducedMotion;
const pointer = { x: innerWidth / 2, y: innerHeight / 2, active: false };
const nodes = [];

const icons = {
  plane: '<svg viewBox="0 0 64 64"><path d="M14 50 52 12l-8 36-13-13-17 15Z"/><path d="m31 35 21-23"/></svg>',
  brand: '<svg viewBox="0 0 64 64"><path d="M32 8 52 20v24L32 56 12 44V20L32 8Z"/><path d="M22 36h20M24 28h16"/></svg>',
  cube: '<svg viewBox="0 0 64 64"><path d="M32 8 54 20v24L32 56 10 44V20L32 8Z"/><path d="M10 20 32 32l22-12M32 32v24"/></svg>',
  concept: '<svg viewBox="0 0 64 64"><path d="M16 18h32v24H16z"/><path d="M22 50h20M26 42v8M38 42v8"/><path d="m22 28 7 7 13-14"/></svg>',
  product: '<svg viewBox="0 0 64 64"><path d="M22 10h20l8 10v30l-8 6H22l-8-6V20l8-10Z"/><path d="M22 10v12h20V10M14 20h36"/></svg>',
  network: '<svg viewBox="0 0 64 64"><path d="M18 20a6 6 0 1 0 0-1M46 20a6 6 0 1 0 0-1M18 44a6 6 0 1 0 0-1M46 44a6 6 0 1 0 0-1"/><path d="M23 22h18M23 42h18M20 25v14M44 25v14M23 24l18 16M41 24 23 40"/></svg>',
};

const services = [
  {
    title: "平面设计",
    desc: "海报、视觉 KV、电影海报、节日海报与活动物料，从多风格草图到可交付版式快速成型。",
    tags: ["海报", "视觉 KV", "电影海报", "节日海报"],
    accent: "#1fd9ff",
    icon: "plane",
  },
  {
    title: "视频创意",
    desc: "产品广告、分镜画面、动态视觉与传播节奏，用 AI 快速推演视频概念和成片方向。",
    tags: ["产品广告", "分镜设计", "动态视觉"],
    accent: "#e657ff",
    icon: "concept",
  },
  {
    title: "3D 建模渲染",
    desc: "产品概念、场景渲染、材质氛围与电商展示，把抽象卖点转化为真实画面。",
    tags: ["产品渲染", "场景视觉", "材质探索"],
    accent: "#4b72ff",
    icon: "cube",
  },
  {
    title: "产品外观设计",
    desc: "外观概念、CMF 设计、结构趋势与用户场景验证，让产品更早被看见。",
    tags: ["CMF", "外观概念", "趋势验证"],
    accent: "#65f7ff",
    icon: "product",
  },
  {
    title: "AI 工作流",
    desc: "定制企业 AI 应用工具链、训练提示词库、建立从灵感到交付的效率系统。",
    tags: ["工具集成", "流程优化", "知识库"],
    accent: "#a86cff",
    icon: "network",
  },
];

const workStyles = [
  {
    a: "#164f7a",
    b: "#071326",
    glow: "rgba(31, 217, 255, 0.56)",
    accent: "#1fd9ff",
    x: "72%",
    y: "26%",
    left: "10%",
    top: "14%",
    w: "32%",
    h: "62%",
    radius: "6px",
    transform: "none",
  },
  {
    a: "#122c68",
    b: "#100a28",
    glow: "rgba(138, 92, 255, 0.58)",
    accent: "#8a5cff",
    x: "48%",
    y: "42%",
    left: "22%",
    top: "18%",
    w: "54%",
    h: "42%",
    radius: "10px",
    transform: "skew(-8deg)",
  },
  {
    a: "#263143",
    b: "#08111f",
    glow: "rgba(174, 196, 226, 0.55)",
    accent: "#9eb7d8",
    x: "58%",
    y: "32%",
    left: "34%",
    top: "20%",
    w: "28%",
    h: "46%",
    radius: "12px",
    transform: "rotate(45deg)",
  },
  {
    a: "#0f3c5f",
    b: "#090d22",
    glow: "rgba(230, 87, 255, 0.5)",
    accent: "#e657ff",
    x: "28%",
    y: "30%",
    left: "13%",
    top: "16%",
    w: "68%",
    h: "48%",
    radius: "4px",
    transform: "none",
  },
];

const workNames = {
  海报: "未来科技品牌发布海报",
  "视觉 KV": "蓝色能量主视觉 KV",
  电影海报: "科幻电影概念海报",
  节日海报: "节日营销主题海报",
  "品牌 VI": "AIGC 品牌识别系统",
  视觉系统: "多场景视觉延展系统",
  规范落地: "品牌应用规范手册",
  产品渲染: "智能设备光影渲染",
  场景视觉: "未来办公场景视觉",
  材质探索: "金属与玻璃 CMF 方案",
  产品广告: "运动鞋产品广告",
  分镜设计: "关键镜头分镜设计",
  动态视觉: "动态视觉风格实验",
  CMF: "产品 CMF 色材趋势板",
  外观概念: "桌面设备外观概念",
  趋势验证: "用户场景趋势验证",
  工具集成: "AI 工具链界面方案",
  流程优化: "生成式协作流程图",
  知识库: "企业提示词知识库",
};

const processSteps = [
  ["01", "需求分析", "深度理解客户与市场，明确目标与痛点。"],
  ["02", "概念生成", "AIGC 发散创意，生成多维视觉方向。"],
  ["03", "视觉输出", "精修并验证呈现质量，形成完整方案。"],
  ["04", "迭代优化", "根据反馈快速调整，推动交付落地。"],
];

const simulations = {
  brand: {
    label: "品牌焕新",
    steps: ["提炼品牌关键词", "生成 4 套视觉方向", "筛选主 KV 与辅助图形", "输出 VI 延展清单"],
  },
  product: {
    label: "产品发布",
    steps: ["拆解卖点与人群", "构建 3D 渲染场景", "生成电商与发布会素材", "整理落地页视觉资产"],
  },
  space: {
    label: "空间概念",
    steps: ["建立空间叙事", "生成材质与灯光方案", "输出动线与氛围参考", "形成汇报级视觉包"],
  },
  workflow: {
    label: "AI 工作流",
    steps: ["梳理团队重复任务", "设计提示词模板", "连接生成与审核节点", "交付可复用 SOP"],
  },
};

const cases = [
  {
    badge: "品牌全案",
    title: "未来科技品牌全案设计",
    desc: "从品牌策略到视觉系统重构，创建具有辨识度的科技品牌形象。",
    image: "./assets/aigc-designer/case-01-brand-full.png",
    artA: "#4b72ff",
    artB: "#091323",
  },
  {
    badge: "产品渲染",
    title: "智能穿戴设备渲染",
    desc: "高精度建模与材质渲染，呈现产品质感与卖点细节。",
    image: "./assets/aigc-designer/case-02-product-render.png",
    artA: "#1fd9ff",
    artB: "#121827",
  },
  {
    badge: "工业设计",
    title: "模块化桌面设备设计",
    desc: "创新外观与 CMF 设计，兼顾科技感与实用美学。",
    image: "./assets/aigc-designer/case-03-industrial-design.png",
    artA: "#9eb7d8",
    artB: "#171d27",
  },
  {
    badge: "概念视觉",
    title: "城市文明概念提案",
    desc: "AI 生成城市愿景视觉，构建宏大的未来叙事场景。",
    image: "./assets/aigc-designer/case-04-city-concept.png",
    artA: "#23d7ff",
    artB: "#10203a",
  },
  {
    badge: "交互体验",
    title: "AIGC 服务落地页",
    desc: "用粒子、视差和项目推演模块增强服务感知。",
    image: "./assets/aigc-designer/case-05-interaction-page.png",
    artA: "#e657ff",
    artB: "#111532",
  },
];

function resizeCanvas() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  width = innerWidth;
  height = innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  nodes.length = 0;
  const count = Math.max(44, Math.min(110, Math.floor((width * height) / 16000)));
  for (let i = 0; i < count; i += 1) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.46,
      vy: (Math.random() - 0.5) * 0.46,
      r: 1 + Math.random() * 2.2,
      hue: [193, 225, 266, 294][Math.floor(Math.random() * 4)],
    });
  }
}

function drawNetwork() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(2, 7, 19, 0.14)";
  ctx.fillRect(0, 0, width, height);

  for (const node of nodes) {
    if (motionOn) {
      node.x += node.vx;
      node.y += node.vy;
    }

    if (node.x < -20) node.x = width + 20;
    if (node.x > width + 20) node.x = -20;
    if (node.y < -20) node.y = height + 20;
    if (node.y > height + 20) node.y = -20;

    const dx = node.x - pointer.x;
    const dy = node.y - pointer.y;
    const distance = Math.hypot(dx, dy);
    if (pointer.active && distance < 190) {
      const force = (190 - distance) / 190;
      node.x += dx * force * 0.014;
      node.y += dy * force * 0.014;
    }
  }

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 140) {
        ctx.strokeStyle = `hsla(${a.hue}, 96%, 68%, ${(1 - distance / 140) * 0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const node of nodes) {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${node.hue}, 100%, 68%, 0.72)`;
    ctx.shadowColor = `hsla(${node.hue}, 100%, 68%, 0.7)`;
    ctx.shadowBlur = 12;
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  raf = requestAnimationFrame(drawNetwork);
}

function renderServices() {
  const grid = document.querySelector("#service-grid");
  grid.innerHTML = services
    .map(
      (item, index) => `
        <button class="service-card ${index === 0 ? "is-active" : ""}" style="--accent:${item.accent}" data-index="${index}" type="button">
          <span class="service-icon">${icons[item.icon]}</span>
          <span>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <b>↗</b>
          </span>
        </button>
      `,
    )
    .join("");

  grid.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => activateService(Number(card.dataset.index)));
  });
  activateService(0);
}

function activateService(index) {
  const service = services[index];
  document.querySelectorAll(".service-card").forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === index);
  });
  document.querySelector("#service-index").textContent = `${String(index + 1).padStart(2, "0")} / ${String(services.length).padStart(2, "0")}`;
  document.querySelector("#service-title").textContent = service.title;
  document.querySelector("#service-desc").textContent = service.desc;
  const tagRow = document.querySelector("#service-tags");
  tagRow.innerHTML = service.tags
    .map((tag, tagIndex) => `<button class="${tagIndex === 0 ? "is-active" : ""}" type="button" data-work="${tagIndex}">${tag}</button>`)
    .join("");
  tagRow.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      tagRow.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      activateWork(service, Number(button.dataset.work));
    });
  });
  document.querySelector("#service-object").style.borderColor = service.accent;
  document.querySelector(".service-visual").style.setProperty("--spot-x", `${20 + index * 13}%`);
  document.querySelector(".service-visual").style.setProperty("--spot-y", `${36 + (index % 3) * 12}%`);
  activateWork(service, 0);
}

function activateWork(service, workIndex) {
  const type = service.tags[workIndex];
  const style = workStyles[workIndex % workStyles.length];
  const frame = document.querySelector("#work-frame");
  const preview = document.querySelector("#work-preview");
  const video = document.querySelector("#work-video");
  const visual = document.querySelector(".service-visual");
  const object = document.querySelector("#service-object");
  const realWorks = {
    "平面设计:海报": "./assets/aigc-designer/a-train-poster.png",
    "平面设计:视觉 KV": "./assets/aigc-designer/nexa-kv.png",
    "平面设计:电影海报": "./assets/aigc-designer/work-graphic-movie-poster.png",
    "平面设计:节日海报": "./assets/aigc-designer/work-graphic-festival-poster.png",
    "品牌视觉:品牌 VI": "./assets/aigc-designer/work-brand-vi.png",
    "品牌视觉:视觉系统": "./assets/aigc-designer/work-brand-system.png",
    "品牌视觉:规范落地": "./assets/aigc-designer/work-brand-guideline.png",
    "3D 建模渲染:产品渲染": "./assets/aigc-designer/work-3d-product-render.png",
    "3D 建模渲染:场景视觉": "./assets/aigc-designer/work-3d-scene-visual.png",
    "3D 建模渲染:材质探索": "./assets/aigc-designer/work-3d-material.png",
    "视频创意:分镜设计": "./assets/aigc-designer/sneaker-storyboard.png",
    "视频创意:动态视觉": "./assets/aigc-designer/work-proposal-styleboard.png",
    "产品外观设计:CMF": "./assets/aigc-designer/work-product-cmf.png",
    "产品外观设计:外观概念": "./assets/aigc-designer/work-product-concept.png",
    "产品外观设计:趋势验证": "./assets/aigc-designer/work-product-trend.png",
    "AI 工作流:工具集成": "./assets/aigc-designer/work-ai-tools.png",
    "AI 工作流:流程优化": "./assets/aigc-designer/work-ai-process.png",
    "AI 工作流:知识库": "./assets/aigc-designer/work-ai-knowledge.png",
  };
  const videoWorks = {
    "视频创意:产品广告": "./assets/aigc-designer/sneaker-ad.mp4",
  };
  const image = realWorks[`${service.title}:${type}`] || "";
  const videoSrc = videoWorks[`${service.title}:${type}`] || "";

  preview.classList.toggle("has-real-art", Boolean(image));
  preview.classList.toggle("has-real-video", Boolean(videoSrc));
  visual.classList.toggle("has-real-art", Boolean(image));
  visual.classList.toggle("has-real-video", Boolean(videoSrc));
  if (videoSrc) {
    if (!video.src.endsWith(videoSrc.replace("./", ""))) {
      video.src = videoSrc;
    }
    video.play().catch(() => {});
  } else {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  frame.style.setProperty("--art-image", image ? `url("${image}")` : "none");
  frame.style.setProperty("--art-a", style.a);
  frame.style.setProperty("--art-b", style.b);
  frame.style.setProperty("--art-glow", style.glow);
  frame.style.setProperty("--art-accent", style.accent);
  frame.style.setProperty("--art-x", style.x);
  frame.style.setProperty("--art-y", style.y);
  frame.style.setProperty("--shape-left", style.left);
  frame.style.setProperty("--shape-top", style.top);
  frame.style.setProperty("--shape-w", style.w);
  frame.style.setProperty("--shape-h", style.h);
  frame.style.setProperty("--shape-radius", style.radius);
  frame.style.setProperty("--shape-transform", style.transform);
  object.style.borderColor = style.accent;
  object.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.18), transparent), radial-gradient(circle at 50% 50%, ${style.glow}, rgba(117, 82, 255, 0.16))`;

  document.querySelector("#work-type").textContent = type;
  document.querySelector("#work-name").textContent = workNames[type] || `${service.title} ${type}作品`;
}

function renderProcess() {
  const board = document.querySelector("#process-cards");
  board.innerHTML = processSteps
    .map(
      ([num, title, desc], index) => `
        <article class="process-card ${index === 0 ? "is-active" : ""}" data-index="${index}">
          <small>${num}</small>
          <h3>${title}</h3>
          <p>${desc}</p>
        </article>
      `,
    )
    .join("");

  board.querySelectorAll(".process-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".process-card").forEach((item) => item.classList.remove("is-active"));
      card.classList.add("is-active");
    });
  });

  document.querySelectorAll(".engine-row button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".engine-row button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      const step = document.querySelector(`.process-card[data-index="${[...button.parentNode.children].indexOf(button)}"]`);
      if (step) step.click();
    });
  });
  document.querySelector(".engine-row button").classList.add("is-active");
}

function renderSimulator() {
  const tabs = document.querySelector("#sim-tabs");
  tabs.innerHTML = Object.entries(simulations)
    .map(([key, sim], index) => `<button class="${index === 0 ? "is-active" : ""}" type="button" data-key="${key}">${sim.label}</button>`)
    .join("");

  tabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      updateSimulation(button.dataset.key);
    });
  });
  updateSimulation("brand");
}

function updateSimulation(key) {
  const sim = simulations[key];
  document.querySelector("#sim-output").innerHTML = sim.steps
    .map(
      (step, index) => `
        <article>
          <b>${index + 1}</b>
          <div>
            <strong>${step}</strong>
            <p>${index === sim.steps.length - 1 ? "形成可用于客户决策与团队执行的交付节点。" : "系统生成候选结果，设计师筛选、精修并控制风格一致性。"}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

let caseIndex = 0;

function renderCases() {
  const track = document.querySelector("#case-track");
  track.innerHTML = cases
    .map((item) => {
      const media = item.image
        ? `<img src="${item.image}" alt="${item.title}" />`
        : `<div class="generated-art" style="--art-a:${item.artA};--art-b:${item.artB}"></div>`;
      return `
        <article class="case-card">
          <div class="case-media">
            <span class="case-badge">${item.badge}</span>
            ${media}
          </div>
          <div>
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <a href="#brief">查看详情 →</a>
          </div>
        </article>
      `;
    })
    .join("");

  const dots = document.querySelector("#case-dots");
  dots.innerHTML = cases.map((_, index) => `<button type="button" aria-label="查看第 ${index + 1} 组案例"></button>`).join("");
  dots.querySelectorAll("button").forEach((dot, index) => dot.addEventListener("click", () => moveCases(index)));
  document.querySelector("#case-prev").addEventListener("click", () => moveCases(caseIndex - 1));
  document.querySelector("#case-next").addEventListener("click", () => moveCases(caseIndex + 1));
  document.querySelector("#shuffle-cases").addEventListener("click", () => moveCases(caseIndex + 1));
  moveCases(0);
}

function moveCases(next) {
  const visible = innerWidth < 760 ? 1 : innerWidth < 1180 ? 2 : 4;
  const max = Math.max(0, cases.length - visible);
  caseIndex = next < 0 ? max : next > max ? 0 : next;
  const card = document.querySelector(".case-card");
  const gap = 22;
  const shift = card ? (card.getBoundingClientRect().width + gap) * caseIndex : 0;
  document.querySelector("#case-track").style.transform = `translateX(${-shift}px)`;
  document.querySelectorAll("#case-dots button").forEach((dot, index) => dot.classList.toggle("is-active", index === caseIndex));
}

function drawChart() {
  const chart = document.querySelector("#chart-canvas");
  const chartCtx = chart.getContext("2d");
  const w = chart.width;
  const h = chart.height;
  chartCtx.clearRect(0, 0, w, h);
  chartCtx.strokeStyle = "rgba(128, 180, 255, 0.12)";
  chartCtx.lineWidth = 1;
  for (let y = 40; y < h; y += 44) {
    chartCtx.beginPath();
    chartCtx.moveTo(0, y);
    chartCtx.lineTo(w, y);
    chartCtx.stroke();
  }

  const lines = [
    { color: "#1fd9ff", points: [188, 134, 152, 82, 112, 64, 86] },
    { color: "#8a5cff", points: [210, 178, 96, 126, 78, 122, 56] },
    { color: "#4b72ff", points: [150, 172, 132, 146, 98, 132, 102] },
  ];
  lines.forEach((line) => {
    chartCtx.beginPath();
    chartCtx.strokeStyle = line.color;
    chartCtx.lineWidth = 3;
    line.points.forEach((point, index) => {
      const x = 40 + index * ((w - 80) / (line.points.length - 1));
      if (index === 0) chartCtx.moveTo(x, point);
      else chartCtx.lineTo(x, point);
    });
    chartCtx.stroke();
  });

  chartCtx.fillStyle = "#1fd9ff";
  chartCtx.shadowColor = "#1fd9ff";
  chartCtx.shadowBlur = 18;
  chartCtx.beginPath();
  chartCtx.arc(40 + 5 * ((w - 80) / 6), 64, 7, 0, Math.PI * 2);
  chartCtx.fill();
  chartCtx.shadowBlur = 0;
}

function animateCounts() {
  const metrics = document.querySelectorAll("[data-count]");
  metrics.forEach((metric) => {
    const target = Number(metric.dataset.count);
    metric.textContent = `${target}${target === 98 ? "%" : "+"}`;
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        let current = Math.floor(target * 0.72);
        const steps = 18;
        const timer = setInterval(() => {
          current += (target * 0.28) / steps;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = `${Math.round(current)}${target === 98 ? "%" : "+"}`;
        }, 24);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 },
  );
  metrics.forEach((metric) => observer.observe(metric));
}

function bindInteractions() {
  document.querySelector("#motion-toggle").addEventListener("click", (event) => {
    motionOn = !motionOn;
    event.currentTarget.classList.toggle("is-paused", !motionOn);
    event.currentTarget.setAttribute("aria-label", motionOn ? "暂停动态效果" : "开启动态效果");
  });

  document.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    cursor.style.setProperty("--x", `${event.clientX}px`);
    cursor.style.setProperty("--y", `${event.clientY}px`);

    const stage = document.querySelector("#hero-stage");
    const rect = stage.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside || !window.matchMedia("(hover: hover)").matches) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    stage.querySelectorAll("[data-depth]").forEach((panel) => {
      const depth = Number(panel.dataset.depth);
      panel.style.translate = `${x * depth}px ${y * depth}px`;
    });
  });

  document.addEventListener("pointerleave", () => {
    pointer.active = false;
    document.querySelector("#hero-stage").style.transform = "";
  });

  document.querySelector("#duration").addEventListener("input", (event) => {
    const days = Number(event.target.value);
    document.querySelector("#duration-label").textContent = `${days} 天`;
    document.querySelector("#saved-days").textContent = `${Math.max(5, Math.round(days * 0.42))} 天`;
  });

  const briefForm = document.querySelector("#brief-form");
  if (briefForm) {
    briefForm.addEventListener("submit", (event) => {
      event.preventDefault();
      makeBrief();
    });
  }
  document.querySelector("#generate-brief").addEventListener("click", () => {
    window.location.href = "mailto:lwt13800@163.com";
  });

  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav a").forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawChart();
    moveCases(caseIndex);
  });
}

function makeBrief() {
  const type = document.querySelector("#brief-type").value;
  const goal = document.querySelector("#brief-goal").value.trim() || "需要一套兼具未来感、辨识度与可落地性的视觉方案";
  document.querySelector("#brief-result").textContent = `合作摘要：${type}项目将围绕「${goal}」展开。我会先拆解目标用户与使用场景，再输出风格方向、关键视觉、交付清单与迭代节奏，确保方案既有想象力也能落地。`;
  document.querySelector("#brief-result").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

renderServices();
renderProcess();
renderSimulator();
renderCases();
resizeCanvas();
drawNetwork();
drawChart();
animateCounts();
bindInteractions();

const els = {
  materialType: document.getElementById("materialType"),
  baseColor: document.getElementById("baseColor"),
  logoScale: document.getElementById("logoScale"),
  logoOpacity: document.getElementById("logoOpacity"),
  logoUpload: document.getElementById("logoUpload"),
  repeatPattern: document.getElementById("repeatPattern"),
  downloadMockup: document.getElementById("downloadMockup"),
  canvas: document.getElementById("mockupCanvas"),
};

const ctx = els.canvas.getContext("2d");
const state = {
  type: "bag",
  baseColor: "#c7a274",
  scale: 0.7,
  opacity: 0.92,
  repeatPattern: true,
  logoImage: null,
};

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function shade(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v) => Math.min(255, Math.max(0, v));
  const nr = clamp(r + amount);
  const ng = clamp(g + amount);
  const nb = clamp(b + amount);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

function drawCanvasBackground() {
  const grad = ctx.createLinearGradient(0, 0, els.canvas.width, els.canvas.height);
  grad.addColorStop(0, "#efe0cb");
  grad.addColorStop(1, "#d6b993");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 4000; i += 1) {
    const x = Math.random() * els.canvas.width;
    const y = Math.random() * els.canvas.height;
    ctx.fillStyle = i % 2 ? "#000" : "#fff";
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function drawBagBase() {
  const w = els.canvas.width;
  const h = els.canvas.height;
  const bagX = w * 0.26;
  const bagY = h * 0.15;
  const bagW = w * 0.48;
  const bagH = h * 0.68;

  ctx.save();
  ctx.shadowColor = "rgba(55, 30, 12, 0.3)";
  ctx.shadowBlur = 55;
  ctx.shadowOffsetY = 26;

  const bagGrad = ctx.createLinearGradient(bagX, bagY, bagX + bagW, bagY + bagH);
  bagGrad.addColorStop(0, shade(state.baseColor, 18));
  bagGrad.addColorStop(1, shade(state.baseColor, -28));

  ctx.fillStyle = bagGrad;
  ctx.beginPath();
  ctx.moveTo(bagX + 25, bagY + 16);
  ctx.lineTo(bagX + bagW - 25, bagY + 16);
  ctx.lineTo(bagX + bagW, bagY + bagH);
  ctx.lineTo(bagX, bagY + bagH);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "transparent";

  ctx.strokeStyle = "rgba(50, 28, 13, 0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 245, 228, 0.2)";
  ctx.fillRect(bagX + bagW * 0.08, bagY + bagH * 0.08, bagW * 0.22, bagH * 0.82);

  ctx.strokeStyle = "rgba(87, 53, 30, 0.24)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bagX + bagW * 0.23, bagY + 34);
  ctx.quadraticCurveTo(bagX + bagW * 0.24, bagY - 40, bagX + bagW * 0.37, bagY + 34);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bagX + bagW * 0.63, bagY + 34);
  ctx.quadraticCurveTo(bagX + bagW * 0.76, bagY - 40, bagX + bagW * 0.77, bagY + 34);
  ctx.stroke();

  ctx.restore();

  return {
    x: bagX + bagW * 0.2,
    y: bagY + bagH * 0.26,
    w: bagW * 0.6,
    h: bagH * 0.42,
    rotation: -0.03,
  };
}

function drawPaperBase() {
  const w = els.canvas.width;
  const h = els.canvas.height;
  const paperW = w * 0.72;
  const paperH = h * 0.57;
  const x = (w - paperW) / 2;
  const y = (h - paperH) / 2;

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.16);
  ctx.translate(-w / 2, -h / 2);

  ctx.shadowColor = "rgba(43, 20, 9, 0.25)";
  ctx.shadowBlur = 52;
  ctx.shadowOffsetY = 20;

  const grad = ctx.createLinearGradient(x, y, x + paperW, y + paperH);
  grad.addColorStop(0, shade(state.baseColor, 35));
  grad.addColorStop(1, shade(state.baseColor, -22));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, paperW, paperH);

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(84, 50, 30, 0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, paperW, paperH);

  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 14; i += 1) {
    const lineY = y + (paperH / 14) * i + Math.sin(i * 0.8) * 6;
    ctx.strokeStyle = "rgba(90, 52, 26, 0.3)";
    ctx.beginPath();
    ctx.moveTo(x + 12, lineY);
    ctx.lineTo(x + paperW - 12, lineY + Math.cos(i) * 6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  return {
    x: x + paperW * 0.14,
    y: y + paperH * 0.2,
    w: paperW * 0.72,
    h: paperH * 0.6,
    rotation: -0.16,
  };
}

function drawFallbackLogo(area) {
  ctx.save();
  ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
  ctx.rotate(area.rotation || 0);
  ctx.globalAlpha = 0.68;
  ctx.fillStyle = "rgba(52, 27, 10, 0.72)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.max(32, area.w * 0.11)}px Manrope`;
  ctx.fillText("YOUR LOGO", 0, -12);
  ctx.font = `800 ${Math.max(38, area.w * 0.14)}px Unbounded`;
  ctx.fillText("KRAFT", 0, 40);
  ctx.restore();
}

function drawLogo(area) {
  if (!state.logoImage) {
    drawFallbackLogo(area);
    return;
  }

  const logo = state.logoImage;
  const maxW = area.w * state.scale;
  const maxH = area.h * state.scale;
  const ratio = Math.min(maxW / logo.width, maxH / logo.height);
  const drawW = logo.width * ratio;
  const drawH = logo.height * ratio;

  ctx.save();
  ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
  ctx.rotate(area.rotation || 0);
  ctx.globalAlpha = state.opacity;

  if (state.type === "paper" && state.repeatPattern) {
    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = Math.max(120, drawW + 40);
    tileCanvas.height = Math.max(120, drawH + 40);
    const tCtx = tileCanvas.getContext("2d");
    tCtx.globalAlpha = 0.8;
    tCtx.drawImage(logo, 20, 20, drawW, drawH);
    const pattern = ctx.createPattern(tileCanvas, "repeat");

    ctx.save();
    ctx.translate(-area.w / 2, -area.h / 2);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, area.w, area.h);
    ctx.restore();
  } else {
    ctx.drawImage(logo, -drawW / 2, -drawH / 2, drawW, drawH);
  }

  ctx.restore();
}

function renderMockup() {
  ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
  drawCanvasBackground();
  const logoArea = state.type === "bag" ? drawBagBase() : drawPaperBase();
  drawLogo(logoArea);
}

function handleLogoUpload(file) {
  if (!file) return;

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  img.onload = () => {
    state.logoImage = img;
    URL.revokeObjectURL(objectUrl);
    renderMockup();
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    alert("Не удалось загрузить изображение. Попробуйте другой файл.");
  };

  img.src = objectUrl;
}

function bindEvents() {
  els.materialType.addEventListener("change", (e) => {
    state.type = e.target.value;
    renderMockup();
  });

  els.baseColor.addEventListener("input", (e) => {
    state.baseColor = e.target.value;
    renderMockup();
  });

  els.logoScale.addEventListener("input", (e) => {
    state.scale = Number(e.target.value) / 100;
    renderMockup();
  });

  els.logoOpacity.addEventListener("input", (e) => {
    state.opacity = Number(e.target.value) / 100;
    renderMockup();
  });

  els.repeatPattern.addEventListener("change", (e) => {
    state.repeatPattern = e.target.checked;
    renderMockup();
  });

  els.logoUpload.addEventListener("change", (e) => {
    const [file] = e.target.files;
    handleLogoUpload(file);
  });

  els.downloadMockup.addEventListener("click", () => {
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    link.download = `kraft-mockup-${timestamp}.png`;
    link.href = els.canvas.toDataURL("image/png");
    link.click();
  });

  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  revealElements.forEach((el) => observer.observe(el));

  const orb1 = document.querySelector(".orb-1");
  const orb2 = document.querySelector(".orb-2");
  window.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    orb1.style.transform = `translate(${x * 20}px, ${y * 18}px)`;
    orb2.style.transform = `translate(${-x * 24}px, ${-y * 16}px)`;
  });
}

bindEvents();
renderMockup();

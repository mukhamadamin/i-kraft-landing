import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";

/* ── Константы сцены ── */

const W = 1400;
const H = 1000;
const DESIGN_KEY = "kraftvision.constructor.v2";
const HANDLE_HIT = 26;
const SNAP_TOLERANCE = 1.6;

const MATERIALS = [
  { id: "bag", label: "Крафт-пакет", icon: "🛍️" },
  { id: "paper", label: "Пергамент", icon: "📄" },
  { id: "box", label: "Коробка", icon: "📦" },
  { id: "cup", label: "Стакан", icon: "🥤" },
];

const BAG_COLORS = [
  { label: "Крафт", value: "#c8a96e" },
  { label: "Натуральный", value: "#b7e8cb" },
  { label: "Белый", value: "#f5f5f0" },
  { label: "Чёрный", value: "#1a1a1a" },
  { label: "Изумруд", value: "#2d7a5f" },
  { label: "Оливковый", value: "#6b7c45" },
  { label: "Терракота", value: "#c0614a" },
  { label: "Морской", value: "#2b4d6f" },
  { label: "Бургунди", value: "#7a2d3e" },
  { label: "Песок", value: "#d4c5a0" },
  { label: "Индиго", value: "#3d3a8a" },
  { label: "Розовый", value: "#e8a0b0" },
];

const TEXT_COLORS = [
  { label: "Тёмный", value: "#0f172a" },
  { label: "Белый", value: "#ffffff" },
  { label: "Зелёный", value: "#14593f" },
  { label: "Светло-зел.", value: "#d1fae5" },
  { label: "Крем", value: "#fef3c7" },
  { label: "Терракота", value: "#c0614a" },
  { label: "Золото", value: "#d4a017" },
  { label: "Серый", value: "#64748b" },
  { label: "Алый", value: "#dc2626" },
  { label: "Индиго", value: "#4338ca" },
  { label: "Чёрн. крафт", value: "#1a0f00" },
  { label: "Бежевый", value: "#e8d9c0" },
];

const FONTS = [
  { label: "Jakarta — современный", value: '"Plus Jakarta Sans", sans-serif' },
  { label: "Inter — нейтральный", value: '"Inter", sans-serif' },
  { label: "Georgia — серифный", value: 'Georgia, "Times New Roman", serif' },
  { label: "Courier — машинописный", value: '"Courier New", monospace' },
  { label: "Impact — плакатный", value: 'Impact, "Arial Black", sans-serif' },
];

/* ── Геометрия и цвет ── */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function degToRad(value) {
  return (value * Math.PI) / 180;
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function hexToRgb(hex) {
  const source = String(hex || "#000000").replace("#", "");
  const full = source.length === 3 ? source.split("").map((char) => char + char).join("") : source;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function shade(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const next = (value) => clamp(value + amount, 0, 255);
  return `rgb(${next(r)}, ${next(g)}, ${next(b)})`;
}

function rotatePoint(x, y, cx, cy, angle) {
  const dx = x - cx;
  const dy = y - cy;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalizeDeg(value) {
  let deg = value % 360;
  if (deg > 180) deg -= 360;
  if (deg < -180) deg += 360;
  return deg;
}

function snapAngle(deg) {
  const targets = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
  for (const target of targets) {
    if (Math.abs(deg - target) <= 4) return target;
  }
  return deg;
}

/* ── Слои ── */

function buildDefaultLayer(companyName) {
  return {
    id: uid("txt"),
    type: "text",
    name: "Название бренда",
    text: companyName || "ВАШ БРЕНД",
    x: 50,
    y: 48,
    rotation: 0,
    opacity: 90,
    fontSize: 70,
    color: "#14593f",
    weight: "800",
    align: "center",
    font: FONTS[0].value,
    letterSpacing: 0,
    uppercase: false,
    hidden: false,
    locked: false,
  };
}

function normalizeLayer(raw) {
  const base = {
    id: raw.id || uid(raw.type === "logo" ? "logo" : "txt"),
    type: raw.type === "logo" ? "logo" : "text",
    name: raw.name || (raw.type === "logo" ? "Логотип" : "Текст"),
    x: clamp(Number(raw.x ?? 50), 0, 100),
    y: clamp(Number(raw.y ?? 50), 0, 100),
    rotation: clamp(Number(raw.rotation ?? 0), -180, 180),
    opacity: clamp(Number(raw.opacity ?? 100), 5, 100),
    hidden: Boolean(raw.hidden),
    locked: Boolean(raw.locked),
  };

  if (base.type === "logo") {
    return {
      ...base,
      imageSrc: String(raw.imageSrc || ""),
      size: clamp(Number(raw.size ?? 40), 8, 150),
    };
  }

  return {
    ...base,
    text: String(raw.text ?? "Текст"),
    fontSize: clamp(Number(raw.fontSize ?? 48), 12, 220),
    color: raw.color || "#0f172a",
    weight: String(raw.weight || "700"),
    align: ["left", "center", "right"].includes(raw.align) ? raw.align : "center",
    font: raw.font || FONTS[0].value,
    letterSpacing: clamp(Number(raw.letterSpacing ?? 0), 0, 30),
    uppercase: Boolean(raw.uppercase),
  };
}

function loadSavedDesign() {
  try {
    const raw = localStorage.getItem(DESIGN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.layers)) return null;
    return {
      material: MATERIALS.some((m) => m.id === parsed.material) ? parsed.material : "bag",
      baseColor: typeof parsed.baseColor === "string" ? parsed.baseColor : "#b7e8cb",
      layers: parsed.layers.map(normalizeLayer).filter((layer) => layer.type !== "logo" || layer.imageSrc),
    };
  } catch (_error) {
    return null;
  }
}

/* Растровые логотипы ужимаются до 1000px, чтобы дизайн не разрастался
   в localStorage и не тормозил отрисовку. */
function prepareLogoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      if (file.type === "image/svg+xml") {
        resolve(src);
        return;
      }
      const image = new Image();
      image.onload = () => {
        const maxSide = 1000;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        if (ratio >= 1) {
          resolve(src);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => reject(new Error("bad image"));
      image.src = src;
    };
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
}

/* ── Мелкие UI-компоненты ── */

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M12 5.5c-5.4 0-8.8 4.9-9.9 6.5 1.1 1.6 4.5 6.5 9.9 6.5s8.8-4.9 9.9-6.5c-1.1-1.6-4.5-6.5-9.9-6.5Zm0 10.3a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6Z"
        fill="currentColor"
        opacity={off ? 0.35 : 1}
      />
      {off ? <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : null}
    </svg>
  );
}

function LockIcon({ locked }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.4" fill="currentColor" opacity={locked ? 1 : 0.35} />
      <path
        d={locked ? "M8 10.5V8a4 4 0 0 1 8 0v2.5" : "M8 10.5V8a4 4 0 0 1 7.4-2"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity={locked ? 1 : 0.35}
      />
    </svg>
  );
}

function ColorPicker({ label, value, onChange, presets }) {
  return (
    <div className="color-picker">
      <div className="color-picker-header">
        <span className="color-picker-label">{label}</span>
        <label className="color-picker-custom" title="Свой цвет">
          <span className="color-picker-current" style={{ background: value }} />
          <span className="color-picker-hex">{value.toUpperCase()}</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="color-picker-native"
          />
        </label>
      </div>
      <div className="color-swatches">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`color-swatch ${value === preset.value ? "is-active" : ""}`}
            style={{ "--swatch-color": preset.value }}
            title={preset.label}
            onClick={() => onChange(preset.value)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Страница конструктора ── */

export function ConstructorPage() {
  const {
    state: { settings },
  } = useStore();

  const canvasRef = useRef(null);
  const textEditRef = useRef(null);
  const paintRef = useRef(() => {});
  const stateRef = useRef({});
  const actionsRef = useRef({});
  const noticeTimer = useRef(null);

  const runtimeRef = useRef({
    dpr: 1,
    raf: 0,
    area: null,
    bounds: [],
    handles: null,
    images: new Map(),
    noiseCanvas: null,
    drag: null,
    live: null,
    guides: { v: false, h: false },
  });

  const historyRef = useRef({ past: [], future: [], lastPush: 0 });

  const saved = useMemo(loadSavedDesign, []);
  const [material, setMaterial] = useState(saved?.material || "bag");
  const [baseColor, setBaseColor] = useState(saved?.baseColor || "#b7e8cb");
  const [layers, setLayers] = useState(() =>
    saved?.layers?.length ? saved.layers : [buildDefaultLayer(settings.companyName)],
  );
  const [selectedLayerId, setSelectedLayerId] = useState(() => layers[0]?.id || null);
  const [quickText, setQuickText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTelegram, setContactTelegram] = useState("");
  const [notice, setNotice] = useState(null);

  stateRef.current = { material, baseColor, layers, selectedLayerId };

  const selectedLayer = useMemo(
    () => layers.find((item) => item.id === selectedLayerId) || null,
    [layers, selectedLayerId],
  );

  const showNotice = useCallback((text) => {
    setNotice(text);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  /* ── История изменений (undo / redo) ── */

  const takeSnapshot = () => {
    const st = stateRef.current;
    return { material: st.material, baseColor: st.baseColor, layers: st.layers };
  };

  const pushSnapshot = (snapshot) => {
    const h = historyRef.current;
    h.past.push(snapshot);
    if (h.past.length > 80) h.past.shift();
    h.future = [];
    h.lastPush = Date.now();
  };

  /* force=true — отдельный шаг истории; иначе быстрые изменения
     (слайдеры, набор текста) группируются в один шаг. */
  const beginChange = (force = false) => {
    const h = historyRef.current;
    const now = Date.now();
    if (!force && now - h.lastPush < 500) {
      h.lastPush = now;
      return;
    }
    pushSnapshot(takeSnapshot());
  };

  const applySnapshot = (snapshot) => {
    setMaterial(snapshot.material);
    setBaseColor(snapshot.baseColor);
    setLayers(snapshot.layers);
    setSelectedLayerId((prev) =>
      snapshot.layers.some((layer) => layer.id === prev) ? prev : snapshot.layers.at(-1)?.id || null,
    );
  };

  const undo = () => {
    const h = historyRef.current;
    const prev = h.past.pop();
    if (!prev) return;
    h.future.push(takeSnapshot());
    h.lastPush = 0;
    applySnapshot(prev);
  };

  const redo = () => {
    const h = historyRef.current;
    const next = h.future.pop();
    if (!next) return;
    h.past.push(takeSnapshot());
    h.lastPush = 0;
    applySnapshot(next);
  };

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  /* ── Отрисовка сцены ── */

  const ensureNoiseCanvas = () => {
    const rt = runtimeRef.current;
    if (rt.noiseCanvas) return rt.noiseCanvas;
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 180;
    noiseCanvas.height = 180;
    const noiseCtx = noiseCanvas.getContext("2d");
    let seed = 1337;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < 2600; i += 1) {
      const x = Math.floor(random() * noiseCanvas.width);
      const y = Math.floor(random() * noiseCanvas.height);
      const alpha = 0.03 + random() * 0.05;
      noiseCtx.fillStyle = random() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
      noiseCtx.fillRect(x, y, 1, 1);
    }
    rt.noiseCanvas = noiseCanvas;
    return noiseCanvas;
  };

  const drawSceneBackground = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#effaf4");
    gradient.addColorStop(1, "#cdeedc");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    const noise = ctx.createPattern(ensureNoiseCanvas(), "repeat");
    if (noise) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = noise;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  };

  const drawBagBase = (ctx, color) => {
    const x = W * 0.23;
    const y = H * 0.12;
    const bw = W * 0.54;
    const bh = H * 0.72;

    ctx.save();
    ctx.shadowColor = "rgba(12, 90, 57, 0.24)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 26;

    const grad = ctx.createLinearGradient(x, y, x + bw, y + bh);
    grad.addColorStop(0, shade(color, 22));
    grad.addColorStop(1, shade(color, -26));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 14);
    ctx.lineTo(x + bw - 28, y + 14);
    ctx.lineTo(x + bw, y + bh);
    ctx.lineTo(x, y + bh);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(10, 92, 58, 0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.23)";
    ctx.fillRect(x + bw * 0.08, y + bh * 0.09, bw * 0.18, bh * 0.82);

    ctx.strokeStyle = "rgba(16, 103, 68, 0.33)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + bw * 0.24, y + 38);
    ctx.quadraticCurveTo(x + bw * 0.25, y - 44, x + bw * 0.38, y + 38);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + bw * 0.62, y + 38);
    ctx.quadraticCurveTo(x + bw * 0.75, y - 44, x + bw * 0.76, y + 38);
    ctx.stroke();
    ctx.restore();

    return {
      x: x + bw * 0.2,
      y: y + bh * 0.24,
      w: bw * 0.6,
      h: bh * 0.48,
      rotation: degToRad(-1),
    };
  };

  const drawPaperBase = (ctx, color) => {
    const pw = W * 0.72;
    const ph = H * 0.58;
    const x = (W - pw) / 2;
    const y = (H - ph) / 2;
    const rotation = degToRad(-11);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(rotation);
    ctx.translate(-W / 2, -H / 2);

    ctx.shadowColor = "rgba(10, 79, 50, 0.22)";
    ctx.shadowBlur = 54;
    ctx.shadowOffsetY = 22;

    const grad = ctx.createLinearGradient(x, y, x + pw, y + ph);
    grad.addColorStop(0, shade(color, 30));
    grad.addColorStop(1, shade(color, -18));
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, pw, ph);

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(12, 95, 61, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, pw, ph);

    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "rgba(12, 95, 61, 0.32)";
    for (let i = 0; i < 14; i += 1) {
      const ly = y + (ph / 14) * i + Math.sin(i * 0.7) * 4;
      ctx.beginPath();
      ctx.moveTo(x + 10, ly);
      ctx.lineTo(x + pw - 10, ly + Math.cos(i) * 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    return { x: x + pw * 0.14, y: y + ph * 0.19, w: pw * 0.72, h: ph * 0.62, rotation };
  };

  const drawBoxBase = (ctx, color) => {
    const fw = W * 0.44;
    const fh = H * 0.5;
    const x = W * 0.24;
    const y = H * 0.32;
    const dx = W * 0.13;
    const dy = H * 0.15;

    ctx.save();
    ctx.shadowColor = "rgba(12, 90, 57, 0.26)";
    ctx.shadowBlur = 56;
    ctx.shadowOffsetY = 26;

    // передняя грань
    const front = ctx.createLinearGradient(x, y, x + fw, y + fh);
    front.addColorStop(0, shade(color, 16));
    front.addColorStop(1, shade(color, -20));
    ctx.fillStyle = front;
    ctx.fillRect(x, y, fw, fh);

    ctx.shadowColor = "transparent";

    // верхняя грань
    ctx.fillStyle = shade(color, 42);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y - dy);
    ctx.lineTo(x + fw + dx, y - dy);
    ctx.lineTo(x + fw, y);
    ctx.closePath();
    ctx.fill();

    // боковая грань
    ctx.fillStyle = shade(color, -44);
    ctx.beginPath();
    ctx.moveTo(x + fw, y);
    ctx.lineTo(x + fw + dx, y - dy);
    ctx.lineTo(x + fw + dx, y + fh - dy);
    ctx.lineTo(x + fw, y + fh);
    ctx.closePath();
    ctx.fill();

    // линия клапана на верхней грани
    ctx.strokeStyle = "rgba(10, 92, 58, 0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + dx / 2, y - dy / 2);
    ctx.lineTo(x + fw + dx / 2, y - dy / 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(10, 92, 58, 0.22)";
    ctx.strokeRect(x, y, fw, fh);
    ctx.restore();

    return { x: x + fw * 0.1, y: y + fh * 0.14, w: fw * 0.8, h: fh * 0.72, rotation: 0 };
  };

  const drawCupBase = (ctx, color) => {
    const topW = W * 0.26;
    const bottomW = W * 0.19;
    const top = H * 0.17;
    const bottom = H * 0.87;
    const cx = W / 2;
    const lidH = H * 0.035;

    ctx.save();
    ctx.shadowColor = "rgba(12, 90, 57, 0.24)";
    ctx.shadowBlur = 52;
    ctx.shadowOffsetY = 24;

    // корпус
    const grad = ctx.createLinearGradient(cx - topW / 2, top, cx + topW / 2, bottom);
    grad.addColorStop(0, shade(color, 26));
    grad.addColorStop(0.55, shade(color, 0));
    grad.addColorStop(1, shade(color, -30));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, top);
    ctx.lineTo(cx + topW / 2, top);
    ctx.lineTo(cx + bottomW / 2, bottom);
    ctx.quadraticCurveTo(cx, bottom + 26, cx - bottomW / 2, bottom);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(10, 92, 58, 0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // блик
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(cx - topW * 0.32, top + 8);
    ctx.lineTo(cx - topW * 0.16, top + 8);
    ctx.lineTo(cx - bottomW * 0.16, bottom - 6);
    ctx.lineTo(cx - bottomW * 0.3, bottom - 6);
    ctx.closePath();
    ctx.fill();

    // крышка
    ctx.fillStyle = shade(color, 52);
    ctx.beginPath();
    ctx.ellipse(cx, top, topW / 2 + 12, lidH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(10, 92, 58, 0.25)";
    ctx.stroke();
    ctx.fillStyle = shade(color, 30);
    ctx.beginPath();
    ctx.ellipse(cx, top - lidH * 0.5, topW / 2 - 14, lidH * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    const aw = topW * 0.86;
    return { x: cx - aw / 2, y: top + (bottom - top) * 0.2, w: aw, h: (bottom - top) * 0.55, rotation: 0 };
  };

  const drawMaterialBase = (ctx, materialId, color) => {
    if (materialId === "paper") return drawPaperBase(ctx, color);
    if (materialId === "box") return drawBoxBase(ctx, color);
    if (materialId === "cup") return drawCupBase(ctx, color);
    return drawBagBase(ctx, color);
  };

  const drawPrintAreaHint = (ctx, area) => {
    ctx.save();
    ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
    ctx.rotate(area.rotation);
    ctx.strokeStyle = "rgba(10, 113, 69, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([9, 7]);
    ctx.strokeRect(-area.w / 2, -area.h / 2, area.w, area.h);
    ctx.restore();
  };

  const toAreaPixels = (layer, area) => ({
    x: area.x + (layer.x / 100) * area.w,
    y: area.y + (layer.y / 100) * area.h,
  });

  const drawLayer = (ctx, layer, area, boundsOut) => {
    if (layer.hidden) return;

    const center = toAreaPixels(layer, area);
    const rotation = area.rotation + degToRad(Number(layer.rotation || 0));
    const opacity = clamp(Number(layer.opacity || 100), 0, 100) / 100;

    if (layer.type === "logo") {
      const image = runtimeRef.current.images.get(layer.imageSrc);
      if (!image) return;
      const targetWidth = area.w * (clamp(Number(layer.size || 40), 8, 150) / 100);
      const targetHeight = targetWidth * (image.height / image.width || 1);
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();
      if (boundsOut) {
        boundsOut.push({
          id: layer.id,
          x: center.x,
          y: center.y,
          width: targetWidth,
          height: targetHeight,
          rotation,
          locked: layer.locked,
        });
      }
      return;
    }

    const sourceText = layer.uppercase ? String(layer.text || "").toUpperCase() : String(layer.text || "");
    const lines = sourceText.split("\n").map((line) => line.trim()).filter(Boolean);
    const textLines = lines.length ? lines : ["Текст"];
    const fontSize = clamp(Number(layer.fontSize || 48), 12, 220);
    const weight = layer.weight || "700";
    const align = layer.align || "center";
    const letterSpacing = clamp(Number(layer.letterSpacing || 0), 0, 30);

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = layer.color || "#11533a";
    ctx.font = `${weight} ${fontSize}px ${layer.font || FONTS[0].value}`;
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = `${letterSpacing}px`;
    }
    ctx.textBaseline = "middle";
    ctx.textAlign = align;

    const widths = textLines.map((line) => ctx.measureText(line).width);
    const textWidth = widths.length ? Math.max(...widths) : fontSize * 2;
    const lineHeight = fontSize * 1.22;
    const textHeight = lineHeight * textLines.length;

    let anchorX = 0;
    if (align === "left") anchorX = -textWidth / 2;
    if (align === "right") anchorX = textWidth / 2;

    textLines.forEach((line, index) => {
      const y = -textHeight / 2 + lineHeight * index + lineHeight / 2;
      ctx.fillText(line, anchorX, y);
    });
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
    ctx.restore();

    if (boundsOut) {
      boundsOut.push({
        id: layer.id,
        x: center.x,
        y: center.y,
        width: textWidth,
        height: textHeight,
        rotation,
        locked: layer.locked,
      });
    }
  };

  const drawSelection = (ctx) => {
    const rt = runtimeRef.current;
    const st = stateRef.current;
    rt.handles = null;
    if (!st.selectedLayerId) return;

    const layer = st.layers.find((item) => item.id === st.selectedLayerId);
    if (!layer || layer.hidden) return;
    const bound = rt.bounds.find((item) => item.id === st.selectedLayerId);
    if (!bound) return;

    const pad = 10;
    const w = bound.width + pad * 2;
    const h = bound.height + pad * 2;
    const rotateOffset = h / 2 + 38;

    ctx.save();
    ctx.translate(bound.x, bound.y);
    ctx.rotate(bound.rotation);
    ctx.strokeStyle = layer.locked ? "rgba(100, 116, 139, 0.85)" : "rgba(14, 155, 95, 0.95)";
    ctx.setLineDash(layer.locked ? [4, 5] : [10, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    if (!layer.locked) {
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(14, 155, 95, 0.9)";
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, -rotateOffset);
      ctx.stroke();

      const drawHandle = (hx, hy, round) => {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgba(14, 155, 95, 1)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (round) {
          ctx.arc(hx, hy, 10, 0, Math.PI * 2);
        } else {
          ctx.rect(hx - 9, hy - 9, 18, 18);
        }
        ctx.fill();
        ctx.stroke();
      };

      const cornersLocal = [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ];
      cornersLocal.forEach(([hx, hy]) => drawHandle(hx, hy, false));
      drawHandle(0, -rotateOffset, true);

      rt.handles = {
        layerId: layer.id,
        corners: cornersLocal.map(([hx, hy]) =>
          rotatePoint(bound.x + hx, bound.y + hy, bound.x, bound.y, bound.rotation),
        ),
        rotate: rotatePoint(bound.x, bound.y - rotateOffset, bound.x, bound.y, bound.rotation),
        center: { x: bound.x, y: bound.y },
      };
    }
    ctx.restore();
  };

  const drawGuides = (ctx, area) => {
    const { guides } = runtimeRef.current;
    if (!guides.v && !guides.h) return;
    ctx.save();
    ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
    ctx.rotate(area.rotation);
    ctx.strokeStyle = "rgba(219, 39, 119, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 6]);
    if (guides.v) {
      ctx.beginPath();
      ctx.moveTo(0, -area.h / 2 - 30);
      ctx.lineTo(0, area.h / 2 + 30);
      ctx.stroke();
    }
    if (guides.h) {
      ctx.beginPath();
      ctx.moveTo(-area.w / 2 - 30, 0);
      ctx.lineTo(area.w / 2 + 30, 0);
      ctx.stroke();
    }
    ctx.restore();
  };

  const effectiveLayers = () => {
    const st = stateRef.current;
    const live = runtimeRef.current.live;
    if (!live) return st.layers;
    return st.layers.map((layer) => (layer.id === live.id ? { ...layer, ...live.patch } : layer));
  };

  const paintScene = (ctx, { clean = false } = {}) => {
    const rt = runtimeRef.current;
    const st = stateRef.current;
    const boundsOut = clean ? null : [];

    ctx.clearRect(0, 0, W, H);
    drawSceneBackground(ctx);
    const area = drawMaterialBase(ctx, st.material, st.baseColor);
    if (!clean) {
      rt.area = area;
      drawPrintAreaHint(ctx, area);
    }

    const list = effectiveLayers();
    list.forEach((layer) => drawLayer(ctx, layer, area, boundsOut));

    if (!clean) {
      rt.bounds = boundsOut;
      if (!list.some((layer) => !layer.hidden)) {
        ctx.save();
        ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
        ctx.rotate(area.rotation);
        ctx.fillStyle = "rgba(15, 61, 38, 0.4)";
        ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Добавьте текст или логотип", 0, 0);
        ctx.restore();
      }
      drawSelection(ctx);
      drawGuides(ctx, area);
    }
  };

  const paint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = runtimeRef.current.dpr || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintScene(ctx);
  };

  paintRef.current = paint;

  const requestPaint = useCallback(() => {
    const rt = runtimeRef.current;
    if (rt.raf) return;
    rt.raf = requestAnimationFrame(() => {
      rt.raf = 0;
      paintRef.current();
    });
  }, []);

  /* Канвас в физических пикселях экрана — картинка остаётся резкой на retina */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    runtimeRef.current.dpr = dpr;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    requestPaint();
    return () => {
      if (runtimeRef.current.raf) cancelAnimationFrame(runtimeRef.current.raf);
      runtimeRef.current.raf = 0;
    };
  }, [requestPaint]);

  useEffect(() => {
    requestPaint();
  }, [material, baseColor, layers, selectedLayerId, requestPaint]);

  /* Подгрузка изображений логотипов (кэш по src) */
  useEffect(() => {
    const rt = runtimeRef.current;
    layers
      .filter((layer) => layer.type === "logo" && layer.imageSrc)
      .forEach((layer) => {
        if (rt.images.has(layer.imageSrc)) return;
        rt.images.set(layer.imageSrc, null);
        const image = new Image();
        image.onload = () => {
          rt.images.set(layer.imageSrc, image);
          requestPaint();
        };
        image.src = layer.imageSrc;
      });
  }, [layers, requestPaint]);

  /* Автосохранение дизайна */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DESIGN_KEY, JSON.stringify({ material, baseColor, layers }));
      } catch (_error) {
        showNotice("Дизайн слишком большой для автосохранения — уменьшите логотип");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [material, baseColor, layers, showNotice]);

  /* ── Операции со слоями ── */

  const updateLayer = (id, patch, { history = true, force = false } = {}) => {
    if (history) beginChange(force);
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  };

  const addTextLayer = (text, name) => {
    beginChange(true);
    const layer = {
      ...buildDefaultLayer(""),
      id: uid("txt"),
      name: name || "Текст",
      text: text || "Введите ваш текст",
      y: 50,
      opacity: 96,
      fontSize: 62,
      color: "#0f172a",
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
  };

  const addLogoLayer = (dataUrl, fileName) => {
    beginChange(true);
    const layer = {
      id: uid("logo"),
      type: "logo",
      name: fileName ? `Лого: ${fileName}` : "Логотип",
      imageSrc: dataUrl,
      x: 50,
      y: 50,
      size: 38,
      rotation: 0,
      opacity: 95,
      hidden: false,
      locked: false,
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
  };

  const addContactsLayer = () => {
    const lines = [];
    if (contactPhone.trim()) lines.push(`Тел: ${contactPhone.trim()}`);
    if (contactEmail.trim()) lines.push(`Email: ${contactEmail.trim()}`);
    if (contactTelegram.trim()) lines.push(`Telegram: ${contactTelegram.trim()}`);
    if (!lines.length) {
      if (settings.phone) lines.push(`Тел: ${settings.phone}`);
      if (settings.email) lines.push(`Email: ${settings.email}`);
      if (settings.telegram) lines.push(`Telegram: ${settings.telegram}`);
    }
    addTextLayer(lines.join("\n"), "Контакты");
  };

  const moveLayer = (direction) => {
    const st = stateRef.current;
    const idx = st.layers.findIndex((item) => item.id === st.selectedLayerId);
    if (idx < 0) return;
    const target = direction === "up" ? idx + 1 : idx - 1;
    if (target < 0 || target >= st.layers.length) return;
    beginChange(true);
    setLayers((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const duplicateLayer = () => {
    const st = stateRef.current;
    const source = st.layers.find((item) => item.id === st.selectedLayerId);
    if (!source) return;
    beginChange(true);
    const copy = {
      ...source,
      id: uid(source.type === "logo" ? "logo" : "txt"),
      name: `${source.name || "Слой"} (копия)`,
      x: clamp(Number(source.x) + 4, 0, 100),
      y: clamp(Number(source.y) + 4, 0, 100),
      locked: false,
    };
    setLayers((prev) => [...prev, copy]);
    setSelectedLayerId(copy.id);
  };

  const deleteLayer = () => {
    const st = stateRef.current;
    if (!st.selectedLayerId) return;
    beginChange(true);
    setLayers((prev) => {
      const next = prev.filter((item) => item.id !== st.selectedLayerId);
      setSelectedLayerId(next.at(-1)?.id || null);
      return next;
    });
  };

  const resetLayers = () => {
    beginChange(true);
    const layer = buildDefaultLayer(settings.companyName);
    setLayers([layer]);
    setSelectedLayerId(layer.id);
    showNotice("Холст сброшен");
  };

  const nudgeSelected = (dx, dy) => {
    const st = stateRef.current;
    if (!st.selectedLayerId) return;
    beginChange();
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === st.selectedLayerId && !layer.locked
          ? {
              ...layer,
              x: clamp(Number(layer.x) + dx, 0, 100),
              y: clamp(Number(layer.y) + dy, 0, 100),
            }
          : layer,
      ),
    );
  };

  actionsRef.current = { undo, redo, duplicateLayer, deleteLayer, nudgeSelected };

  /* ── Указатель: перенос, масштаб и поворот прямо на канвасе ── */

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * W) / rect.width,
      y: ((event.clientY - rect.top) * H) / rect.height,
    };
  };

  const pointToAreaPercent = (point, area) => {
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const unrotated = rotatePoint(point.x, point.y, cx, cy, -area.rotation);
    return {
      x: clamp(((unrotated.x - area.x) / area.w) * 100, 0, 100),
      y: clamp(((unrotated.y - area.y) / area.h) * 100, 0, 100),
    };
  };

  const hitTest = (point) => {
    const bounds = runtimeRef.current.bounds;
    for (let i = bounds.length - 1; i >= 0; i -= 1) {
      const item = bounds[i];
      if (item.locked) continue;
      const local = rotatePoint(point.x, point.y, item.x, item.y, -item.rotation);
      const padX = item.width / 2 + 8;
      const padY = item.height / 2 + 8;
      if (Math.abs(local.x - item.x) <= padX && Math.abs(local.y - item.y) <= padY) {
        return item;
      }
    }
    return null;
  };

  const findHandleAt = (point) => {
    const handles = runtimeRef.current.handles;
    if (!handles) return null;
    if (distance(point, handles.rotate) <= HANDLE_HIT) return { mode: "rotate", handles };
    for (const corner of handles.corners) {
      if (distance(point, corner) <= HANDLE_HIT) return { mode: "resize", handles };
    }
    return null;
  };

  const onPointerDown = (event) => {
    const rt = runtimeRef.current;
    const st = stateRef.current;
    const point = pointFromEvent(event);

    const handleHit = findHandleAt(point);
    if (handleHit) {
      const layer = st.layers.find((item) => item.id === handleHit.handles.layerId);
      if (layer && !layer.locked) {
        const center = handleHit.handles.center;
        rt.drag = {
          mode: handleHit.mode,
          layerId: layer.id,
          snapshot: takeSnapshot(),
          center,
          startDist: Math.max(distance(point, center), 4),
          startFontSize: Number(layer.fontSize || 48),
          startSize: Number(layer.size || 40),
          startPointerAngle: Math.atan2(point.y - center.y, point.x - center.x),
          startRotation: Number(layer.rotation || 0),
        };
        canvasRef.current.setPointerCapture(event.pointerId);
        return;
      }
    }

    const hit = hitTest(point);
    if (!hit) {
      setSelectedLayerId(null);
      return;
    }

    setSelectedLayerId(hit.id);
    const layer = st.layers.find((item) => item.id === hit.id);
    const area = rt.area;
    if (!layer || !area || layer.locked) return;

    const percent = pointToAreaPercent(point, area);
    rt.drag = {
      mode: "move",
      layerId: hit.id,
      snapshot: takeSnapshot(),
      offset: { x: percent.x - layer.x, y: percent.y - layer.y },
    };
    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const updateHoverCursor = (point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleHit = findHandleAt(point);
    if (handleHit) {
      canvas.style.cursor = handleHit.mode === "rotate" ? "grab" : "nwse-resize";
      return;
    }
    canvas.style.cursor = hitTest(point) ? "move" : "default";
  };

  const onPointerMove = (event) => {
    const rt = runtimeRef.current;
    const point = pointFromEvent(event);

    if (!rt.drag) {
      updateHoverCursor(point);
      return;
    }

    const st = stateRef.current;
    const layer = st.layers.find((item) => item.id === rt.drag.layerId);
    if (!layer) return;

    if (rt.drag.mode === "move") {
      const area = rt.area;
      if (!area) return;
      const percent = pointToAreaPercent(point, area);
      let x = clamp(percent.x - rt.drag.offset.x, 0, 100);
      let y = clamp(percent.y - rt.drag.offset.y, 0, 100);
      const snapV = Math.abs(x - 50) <= SNAP_TOLERANCE;
      const snapH = Math.abs(y - 50) <= SNAP_TOLERANCE;
      if (snapV) x = 50;
      if (snapH) y = 50;
      rt.guides = { v: snapV, h: snapH };
      rt.live = { id: layer.id, patch: { x, y } };
    } else if (rt.drag.mode === "resize") {
      const scale = distance(point, rt.drag.center) / rt.drag.startDist;
      rt.live =
        layer.type === "logo"
          ? { id: layer.id, patch: { size: clamp(rt.drag.startSize * scale, 8, 150) } }
          : { id: layer.id, patch: { fontSize: clamp(rt.drag.startFontSize * scale, 12, 220) } };
    } else if (rt.drag.mode === "rotate") {
      const angleNow = Math.atan2(point.y - rt.drag.center.y, point.x - rt.drag.center.x);
      const deltaDeg = ((angleNow - rt.drag.startPointerAngle) * 180) / Math.PI;
      const next = snapAngle(normalizeDeg(rt.drag.startRotation + deltaDeg));
      rt.live = { id: layer.id, patch: { rotation: next } };
    }

    requestPaint();
  };

  const finishDrag = (event) => {
    const rt = runtimeRef.current;
    if (rt.drag && rt.live) {
      /* шаг истории появляется только если жест действительно изменил слой */
      pushSnapshot(rt.drag.snapshot);
      const { id, patch } = rt.live;
      setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
    }
    rt.drag = null;
    rt.live = null;
    rt.guides = { v: false, h: false };
    if (event && canvasRef.current?.hasPointerCapture?.(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
    requestPaint();
  };

  const onDoubleClick = (event) => {
    const point = pointFromEvent(event);
    const hit = hitTest(point);
    if (!hit) return;
    setSelectedLayerId(hit.id);
    const layer = stateRef.current.layers.find((item) => item.id === hit.id);
    if (layer?.type === "text") {
      requestAnimationFrame(() => {
        textEditRef.current?.focus();
        textEditRef.current?.select();
      });
    }
  };

  /* ── Горячие клавиши ── */

  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return (
        el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)
      );
    };

    const onKeyDown = (event) => {
      if (isTyping()) return;
      const actions = actionsRef.current;
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) actions.redo();
        else actions.undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "y") {
        event.preventDefault();
        actions.redo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && key === "d") {
        event.preventDefault();
        actions.duplicateLayer();
        return;
      }
      if (event.key === "Escape") {
        setSelectedLayerId(null);
        return;
      }
      if (!stateRef.current.selectedLayerId) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        actions.deleteLayer();
        return;
      }

      const step = event.shiftKey ? 2.5 : 0.6;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        actions.nudgeSelected(-step, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        actions.nudgeSelected(step, 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        actions.nudgeSelected(0, -step);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        actions.nudgeSelected(0, step);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ── Экспорт ── */

  const downloadPng = () => {
    const scale = 2;
    const off = document.createElement("canvas");
    off.width = W * scale;
    off.height = H * scale;
    const ctx = off.getContext("2d");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    paintScene(ctx, { clean: true });

    const link = document.createElement("a");
    link.href = off.toDataURL("image/png");
    link.download = `mockup-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.png`;
    link.click();
    showNotice("PNG сохранён в загрузки");
  };

  const onLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await prepareLogoFile(file);
      addLogoLayer(dataUrl, file.name);
    } catch (_error) {
      showNotice("Не удалось прочитать файл логотипа");
    }
  };

  const setMaterialSafe = (id) => {
    if (id === material) return;
    beginChange(true);
    setMaterial(id);
  };

  const setBaseColorSafe = (value) => {
    beginChange();
    setBaseColor(value);
  };

  /* ── Разметка ── */

  return (
    <>
      <PageHead
        eyebrow="Конструктор"
        title="Дизайн-мокап упаковки"
        subtitle="Выберите продукт и цвет, добавьте логотип и тексты. Слои можно двигать, вращать и масштабировать прямо на холсте."
      />

      <section className="container section">
        <div className="kit-layout">
          {/* ── Левая панель ── */}
          <aside className="kit-panel reveal-item">
            <h3><span className="kit-step">1</span> Продукт</h3>
            <div className="material-switcher material-grid-4">
              {MATERIALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`material-btn ${material === item.id ? "is-active" : ""}`}
                  onClick={() => setMaterialSafe(item.id)}
                >
                  <span className="material-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="kit-divider" />

            <ColorPicker label="Цвет упаковки" value={baseColor} onChange={setBaseColorSafe} presets={BAG_COLORS} />

            <div className="kit-divider" />

            <h3><span className="kit-step">2</span> Логотип</h3>
            <div className="field-wide">
              <label className="file-upload-label">
                <span className="file-upload-icon">📁</span>
                <span>PNG, JPG или SVG — перетащите или нажмите</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="file-upload-native"
                  onChange={onLogoUpload}
                />
              </label>
            </div>

            <div className="kit-divider" />

            <h3><span className="kit-step">3</span> Текст</h3>
            <div className="field-wide">
              <textarea
                className="kit-textarea"
                value={quickText}
                onChange={(event) => setQuickText(event.target.value)}
                placeholder={"BURGER HOUSE\nСвежо. Быстро. Вкусно."}
                rows={3}
              />
            </div>
            <div className="kit-actions">
              <button
                className="btn btn-inline"
                type="button"
                onClick={() => {
                  addTextLayer(quickText.trim() || "Новый текст", "Текст");
                  setQuickText("");
                }}
              >
                + Добавить текст
              </button>
            </div>

            <div className="kit-divider" />

            <h3><span className="kit-step">4</span> Контакты</h3>
            <div className="form-grid">
              <div className="field">
                <label>Телефон</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+998 ..." />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="brand@mail.uz" />
              </div>
              <div className="field-wide">
                <label>Telegram / Instagram</label>
                <input value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} placeholder="@brand" />
              </div>
            </div>
            <div className="kit-actions">
              <button className="btn btn-inline" type="button" onClick={addContactsLayer}>
                + Блок контактов
              </button>
            </div>
          </aside>

          {/* ── Канвас ── */}
          <div className="kit-canvas-wrap reveal-item">
            <div className="kit-toolbar">
              <div className="kit-toolbar-group">
                <button
                  className="icon-btn"
                  type="button"
                  title="Отменить (Ctrl+Z)"
                  disabled={!canUndo}
                  onClick={undo}
                >
                  ↶
                </button>
                <button
                  className="icon-btn"
                  type="button"
                  title="Повторить (Ctrl+Shift+Z)"
                  disabled={!canRedo}
                  onClick={redo}
                >
                  ↷
                </button>
              </div>
              <div className="kit-toolbar-group">
                <button className="btn btn-inline btn-secondary" type="button" onClick={resetLayers}>
                  Сбросить
                </button>
                <button className="btn btn-inline" type="button" onClick={downloadPng}>
                  ↓ Скачать PNG
                </button>
              </div>
            </div>

            <canvas
              id="designCanvas"
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onPointerLeave={(e) => {
                if (runtimeRef.current.drag) finishDrag(e);
              }}
              onDoubleClick={onDoubleClick}
            />

            <p className="kit-help">
              Тяните слой мышкой, угловые ручки — размер, верхняя — поворот. Двойной клик по тексту — правка.
              Стрелки — точная подстройка, Del — удалить, Ctrl+D — дубликат, Ctrl+Z — отмена.
            </p>

            {notice ? <div className="kit-notice">{notice}</div> : null}
          </div>

          {/* ── Правая панель: слои и свойства ── */}
          <aside className="kit-layers reveal-item">
            <h3>Слои</h3>
            <ul className="layer-list">
              {layers.length ? (
                [...layers].reverse().map((layer) => (
                  <li
                    key={layer.id}
                    className={`layer-item ${layer.id === selectedLayerId ? "is-selected" : ""} ${layer.hidden ? "is-hidden" : ""}`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <span className="layer-icon">{layer.type === "logo" ? "🖼️" : "T"}</span>
                    <span className="layer-name">{layer.name || "Слой"}</span>
                    <button
                      type="button"
                      className={`layer-btn ${layer.hidden ? "is-on" : ""}`}
                      title={layer.hidden ? "Показать слой" : "Скрыть слой"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLayer(layer.id, { hidden: !layer.hidden }, { force: true });
                      }}
                    >
                      <EyeIcon off={layer.hidden} />
                    </button>
                    <button
                      type="button"
                      className={`layer-btn ${layer.locked ? "is-on" : ""}`}
                      title={layer.locked ? "Разблокировать" : "Заблокировать"}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLayer(layer.id, { locked: !layer.locked }, { force: true });
                      }}
                    >
                      <LockIcon locked={layer.locked} />
                    </button>
                  </li>
                ))
              ) : (
                <li className="empty">Слои отсутствуют.</li>
              )}
            </ul>

            <div className="kit-actions" style={{ marginTop: "0.75rem" }}>
              <button className="btn btn-inline btn-secondary" type="button" title="Слой выше" onClick={() => moveLayer("up")}>↑</button>
              <button className="btn btn-inline btn-secondary" type="button" title="Слой ниже" onClick={() => moveLayer("down")}>↓</button>
              <button className="btn btn-inline btn-secondary" type="button" onClick={duplicateLayer}>Дубль</button>
              <button className="btn btn-inline btn-danger" type="button" onClick={deleteLayer}>Удалить</button>
            </div>

            <div className="kit-controls">
              {selectedLayer ? (
                <div className="layer-props">
                  <div className="field-wide">
                    <label>Название слоя</label>
                    <input
                      value={selectedLayer.name || ""}
                      onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                    />
                  </div>

                  <div className="prop-row">
                    <div className="field">
                      <label>Прозрачность <strong>{Math.round(selectedLayer.opacity)}%</strong></label>
                      <input type="range" min={5} max={100} value={selectedLayer.opacity}
                        onChange={(e) => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label>Поворот <strong>{Math.round(selectedLayer.rotation)}°</strong></label>
                      <input type="range" min={-180} max={180} value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayer.id, { rotation: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="prop-row">
                    <div className="field">
                      <label>X <strong>{Math.round(selectedLayer.x)}%</strong></label>
                      <input type="range" min={0} max={100} value={selectedLayer.x}
                        onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label>Y <strong>{Math.round(selectedLayer.y)}%</strong></label>
                      <input type="range" min={0} max={100} value={selectedLayer.y}
                        onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })} />
                    </div>
                  </div>

                  {selectedLayer.type === "logo" && (
                    <div className="field-wide">
                      <label>Размер логотипа <strong>{Math.round(selectedLayer.size)}%</strong></label>
                      <input type="range" min={8} max={150} value={selectedLayer.size}
                        onChange={(e) => updateLayer(selectedLayer.id, { size: Number(e.target.value) })} />
                    </div>
                  )}

                  {selectedLayer.type === "text" && (
                    <>
                      <div className="field-wide">
                        <label>Текст</label>
                        <textarea
                          ref={textEditRef}
                          className="kit-textarea"
                          rows={3}
                          value={selectedLayer.text || ""}
                          onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                        />
                      </div>

                      <div className="field-wide">
                        <label>Шрифт</label>
                        <select
                          value={selectedLayer.font || FONTS[0].value}
                          onChange={(e) => updateLayer(selectedLayer.id, { font: e.target.value }, { force: true })}
                        >
                          {FONTS.map((font) => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="prop-row">
                        <div className="field">
                          <label>Кегль <strong>{Math.round(selectedLayer.fontSize)} px</strong></label>
                          <input type="range" min={12} max={220} value={selectedLayer.fontSize}
                            onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} />
                        </div>
                        <div className="field">
                          <label>Разрядка <strong>{Math.round(selectedLayer.letterSpacing || 0)} px</strong></label>
                          <input type="range" min={0} max={30} value={selectedLayer.letterSpacing || 0}
                            onChange={(e) => updateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })} />
                        </div>
                      </div>

                      <ColorPicker
                        label="Цвет текста"
                        value={selectedLayer.color || "#0f172a"}
                        onChange={(color) => updateLayer(selectedLayer.id, { color })}
                        presets={TEXT_COLORS}
                      />

                      <div className="prop-row" style={{ marginTop: "0.75rem" }}>
                        <div className="field">
                          <label>Насыщенность</label>
                          <select value={selectedLayer.weight || "700"}
                            onChange={(e) => updateLayer(selectedLayer.id, { weight: e.target.value }, { force: true })}>
                            {[400, 500, 600, 700, 800, 900].map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Выравнивание</label>
                          <div className="segmented">
                            {[
                              { value: "left", label: "⟸" },
                              { value: "center", label: "≡" },
                              { value: "right", label: "⟹" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                title={option.value}
                                className={`segmented-btn ${(selectedLayer.align || "center") === option.value ? "is-active" : ""}`}
                                onClick={() => updateLayer(selectedLayer.id, { align: option.value }, { force: true })}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedLayer.uppercase)}
                          onChange={(e) => updateLayer(selectedLayer.id, { uppercase: e.target.checked }, { force: true })}
                        />
                        <span>ЗАГЛАВНЫЕ БУКВЫ</span>
                      </label>
                    </>
                  )}
                </div>
              ) : (
                <p className="empty" style={{ marginTop: "1rem" }}>
                  Кликните слой на холсте или в списке, чтобы редактировать его свойства.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

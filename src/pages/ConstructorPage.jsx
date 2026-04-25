import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";

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
  };
}

const BAG_COLORS = [
  { label: "Крафт",      value: "#c8a96e" },
  { label: "Натуральный",value: "#b7e8cb" },
  { label: "Белый",      value: "#f5f5f0" },
  { label: "Чёрный",     value: "#1a1a1a" },
  { label: "Изумруд",    value: "#2d7a5f" },
  { label: "Оливковый",  value: "#6b7c45" },
  { label: "Терракота",  value: "#c0614a" },
  { label: "Морской",    value: "#2b4d6f" },
  { label: "Бургунди",   value: "#7a2d3e" },
  { label: "Песок",      value: "#d4c5a0" },
  { label: "Индиго",     value: "#3d3a8a" },
  { label: "Розовый",    value: "#e8a0b0" },
];

const TEXT_COLORS = [
  { label: "Тёмный",     value: "#0f172a" },
  { label: "Белый",      value: "#ffffff" },
  { label: "Зелёный",    value: "#14593f" },
  { label: "Светло-зел.",value: "#d1fae5" },
  { label: "Крем",       value: "#fef3c7" },
  { label: "Терракота",  value: "#c0614a" },
  { label: "Золото",     value: "#d4a017" },
  { label: "Серый",      value: "#64748b" },
  { label: "Алый",       value: "#dc2626" },
  { label: "Индиго",     value: "#4338ca" },
  { label: "Чёрн. крафт",value: "#1a0f00" },
  { label: "Бежевый",    value: "#e8d9c0" },
];

function ColorPicker({ label, value, onChange, presets }) {
  return (
    <div className="color-picker">
      <div className="color-picker-header">
        <span className="color-picker-label">{label}</span>
        <label className="color-picker-custom" title="Свой цвет">
          <span
            className="color-picker-current"
            style={{ background: value }}
          />
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

export function ConstructorPage() {
  const {
    state: { settings },
  } = useStore();

  const canvasRef = useRef(null);
  const runtimeRef = useRef({
    area: null,
    bounds: [],
    images: {},
    noisePattern: null,
    dragging: false,
    dragLayerId: null,
    dragOffset: { x: 0, y: 0 },
  });

  const [material, setMaterial] = useState("bag");
  const [baseColor, setBaseColor] = useState("#b7e8cb");
  const [quickText, setQuickText] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTelegram, setContactTelegram] = useState("");
  const [layers, setLayers] = useState(() => [buildDefaultLayer(settings.companyName)]);
  const [selectedLayerId, setSelectedLayerId] = useState(() => layers[0]?.id || null);

  const selectedLayer = useMemo(
    () => layers.find((item) => item.id === selectedLayerId) || null,
    [layers, selectedLayerId],
  );

  useEffect(() => {
    layers
      .filter((layer) => layer.type === "logo" && layer.imageSrc)
      .forEach((layer) => {
        if (runtimeRef.current.images[layer.id]) return;
        const image = new Image();
        image.onload = () => {
          runtimeRef.current.images[layer.id] = image;
          renderCanvas();
        };
        image.src = layer.imageSrc;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  const ensureNoisePattern = (ctx) => {
    if (runtimeRef.current.noisePattern) return runtimeRef.current.noisePattern;
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
    runtimeRef.current.noisePattern = ctx.createPattern(noiseCanvas, "repeat");
    return runtimeRef.current.noisePattern;
  };

  const drawSceneBackground = (ctx, canvas) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#effaf4");
    gradient.addColorStop(1, "#cdeedc");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const noise = ensureNoisePattern(ctx);
    if (noise) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = noise;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const drawBagBase = (ctx, canvas) => {
    const w = canvas.width;
    const h = canvas.height;
    const x = w * 0.23;
    const y = h * 0.12;
    const bw = w * 0.54;
    const bh = h * 0.72;

    ctx.save();
    ctx.shadowColor = "rgba(12, 90, 57, 0.24)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 26;

    const grad = ctx.createLinearGradient(x, y, x + bw, y + bh);
    grad.addColorStop(0, shade(baseColor, 22));
    grad.addColorStop(1, shade(baseColor, -26));
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

  const drawPaperBase = (ctx, canvas) => {
    const w = canvas.width;
    const h = canvas.height;
    const pw = w * 0.72;
    const ph = h * 0.58;
    const x = (w - pw) / 2;
    const y = (h - ph) / 2;
    const rotation = degToRad(-11);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rotation);
    ctx.translate(-w / 2, -h / 2);

    ctx.shadowColor = "rgba(10, 79, 50, 0.22)";
    ctx.shadowBlur = 54;
    ctx.shadowOffsetY = 22;

    const grad = ctx.createLinearGradient(x, y, x + pw, y + ph);
    grad.addColorStop(0, shade(baseColor, 30));
    grad.addColorStop(1, shade(baseColor, -18));
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

  const drawLayer = (ctx, layer, area) => {
    const center = toAreaPixels(layer, area);
    const rotation = area.rotation + degToRad(Number(layer.rotation || 0));
    const opacity = clamp(Number(layer.opacity || 100), 0, 100) / 100;

    if (layer.type === "logo") {
      const image = runtimeRef.current.images[layer.id];
      if (!image) return;
      const targetWidth = area.w * (clamp(Number(layer.size || 40), 8, 150) / 100);
      const targetHeight = targetWidth * (image.height / image.width);
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();
      runtimeRef.current.bounds.push({ id: layer.id, x: center.x, y: center.y, width: targetWidth, height: targetHeight, rotation });
      return;
    }

    const lines = String(layer.text || "").split("\n").map((line) => line.trim()).filter(Boolean);
    const textLines = lines.length ? lines : ["Текст"];
    const fontSize = clamp(Number(layer.fontSize || 48), 12, 220);
    const weight = layer.weight || "700";
    const align = layer.align || "center";

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = layer.color || "#11533a";
    ctx.font = `${weight} ${fontSize}px "Plus Jakarta Sans", Manrope, sans-serif`;
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
    ctx.restore();

    runtimeRef.current.bounds.push({ id: layer.id, x: center.x, y: center.y, width: textWidth, height: textHeight, rotation });
  };

  const drawSelection = (ctx) => {
    if (!selectedLayerId) return;
    const bound = runtimeRef.current.bounds.find((item) => item.id === selectedLayerId);
    if (!bound) return;
    ctx.save();
    ctx.translate(bound.x, bound.y);
    ctx.rotate(bound.rotation);
    ctx.strokeStyle = "rgba(14, 155, 95, 0.95)";
    ctx.setLineDash([10, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(-bound.width / 2 - 8, -bound.height / 2 - 8, bound.width + 16, bound.height + 16);
    ctx.restore();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    runtimeRef.current.bounds = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSceneBackground(ctx, canvas);
    const area = material === "bag" ? drawBagBase(ctx, canvas) : drawPaperBase(ctx, canvas);
    runtimeRef.current.area = area;
    drawPrintAreaHint(ctx, area);
    layers.forEach((layer) => drawLayer(ctx, layer, area));
    drawSelection(ctx);
  };

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, baseColor, layers, selectedLayerId]);

  const updateLayer = (id, patch) => {
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  };

  const addTextLayer = (text, name) => {
    const layer = {
      id: uid("txt"),
      type: "text",
      name: name || "Текст",
      text: text || "Введите ваш текст",
      x: 50,
      y: 50,
      rotation: 0,
      opacity: 96,
      fontSize: 62,
      color: "#0f172a",
      weight: "800",
      align: "center",
    };
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
  };

  const addLogoLayer = (dataUrl, fileName) => {
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

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
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
      const local = rotatePoint(point.x, point.y, item.x, item.y, -item.rotation);
      if (Math.abs(local.x - item.x) <= item.width / 2 && Math.abs(local.y - item.y) <= item.height / 2) {
        return item;
      }
    }
    return null;
  };

  const onPointerDown = (event) => {
    const point = pointFromEvent(event);
    const hit = hitTest(point);
    if (!hit) return;
    setSelectedLayerId(hit.id);
    const area = runtimeRef.current.area;
    const layer = layers.find((item) => item.id === hit.id);
    if (!area || !layer) return;
    const percent = pointToAreaPercent(point, area);
    runtimeRef.current.dragging = true;
    runtimeRef.current.dragLayerId = hit.id;
    runtimeRef.current.dragOffset = { x: percent.x - layer.x, y: percent.y - layer.y };
    canvasRef.current.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!runtimeRef.current.dragging) return;
    const area = runtimeRef.current.area;
    if (!area) return;
    const point = pointFromEvent(event);
    const percent = pointToAreaPercent(point, area);
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== runtimeRef.current.dragLayerId) return layer;
        return {
          ...layer,
          x: clamp(percent.x - runtimeRef.current.dragOffset.x, 0, 100),
          y: clamp(percent.y - runtimeRef.current.dragOffset.y, 0, 100),
        };
      }),
    );
  };

  const onPointerUp = (event) => {
    runtimeRef.current.dragging = false;
    runtimeRef.current.dragLayerId = null;
    if (canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const moveLayer = (direction) => {
    setLayers((prev) => {
      const idx = prev.findIndex((item) => item.id === selectedLayerId);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx + 1 : idx - 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const duplicateLayer = () => {
    if (!selectedLayer) return;
    const copy = {
      ...selectedLayer,
      id: uid(selectedLayer.type === "logo" ? "logo" : "txt"),
      name: `${selectedLayer.name || "Слой"} (копия)`,
      x: clamp(Number(selectedLayer.x) + 4, 0, 100),
      y: clamp(Number(selectedLayer.y) + 4, 0, 100),
    };
    setLayers((prev) => [...prev, copy]);
    setSelectedLayerId(copy.id);
  };

  const deleteLayer = () => {
    if (!selectedLayerId) return;
    setLayers((prev) => {
      const next = prev.filter((item) => item.id !== selectedLayerId);
      setSelectedLayerId(next.at(-1)?.id || null);
      return next;
    });
  };

  const resetLayers = () => {
    const layer = buildDefaultLayer(settings.companyName);
    setLayers([layer]);
    setSelectedLayerId(layer.id);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!selectedLayerId) return;
      const step = event.shiftKey ? 2.5 : 1;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      setLayers((prev) =>
        prev.map((layer) => {
          if (layer.id !== selectedLayerId) return layer;
          if (event.key === "ArrowLeft") return { ...layer, x: clamp(Number(layer.x) - step, 0, 100) };
          if (event.key === "ArrowRight") return { ...layer, x: clamp(Number(layer.x) + step, 0, 100) };
          if (event.key === "ArrowUp") return { ...layer, y: clamp(Number(layer.y) - step, 0, 100) };
          return { ...layer, y: clamp(Number(layer.y) + step, 0, 100) };
        }),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedLayerId]);

  return (
    <>
      <PageHead
        eyebrow="Конструктор"
        title="Дизайн-мокап упаковки"
        subtitle="Загрузите логотип, добавляйте тексты и контакты, двигайте слои мышкой и скачивайте готовый мокап."
      />

      <section className="container section">
        <div className="kit-layout">

          {/* ── Левая панель ── */}
          <aside className="kit-panel reveal-item">
            <h3>Материал</h3>
            <div className="field-wide" style={{ marginBottom: "1.25rem" }}>
              <div className="material-switcher">
                <button
                  type="button"
                  className={`material-btn ${material === "bag" ? "is-active" : ""}`}
                  onClick={() => setMaterial("bag")}
                >
                  🛍️ Крафтовый пакет
                </button>
                <button
                  type="button"
                  className={`material-btn ${material === "paper" ? "is-active" : ""}`}
                  onClick={() => setMaterial("paper")}
                >
                  📄 Пергаментная бумага
                </button>
              </div>
            </div>

            <ColorPicker
              label="Цвет упаковки"
              value={baseColor}
              onChange={setBaseColor}
              presets={BAG_COLORS}
            />

            <div className="kit-divider" />

            <h3>Логотип</h3>
            <div className="field-wide">
              <label className="file-upload-label">
                <span className="file-upload-icon">📁</span>
                <span>PNG, JPG или SVG</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="file-upload-native"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => addLogoLayer(String(reader.result || ""), file.name);
                    reader.readAsDataURL(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="kit-divider" />

            <h3>Текст</h3>
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

            <h3>Контакты на упаковке</h3>
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
            <canvas
              id="designCanvas"
              ref={canvasRef}
              width={1400}
              height={1000}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
            <p className="kit-help">
              Перетаскивайте слои мышкой · стрелки клавиатуры для точной подстройки · Shift+стрелка — шаг ×2.5
            </p>
            <div className="kit-actions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = canvasRef.current.toDataURL("image/png");
                  link.download = `mockup-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.png`;
                  link.click();
                }}
              >
                ↓ Скачать PNG
              </button>
              <button className="btn btn-secondary" type="button" onClick={resetLayers}>
                Сбросить слои
              </button>
            </div>
          </div>

          {/* ── Правая панель (слои + свойства) ── */}
          <aside className="kit-layers reveal-item">
            <h3>Слои</h3>
            <ul className="layer-list">
              {layers.length ? (
                [...layers].reverse().map((layer) => (
                  <li
                    key={layer.id}
                    className={`layer-item ${layer.id === selectedLayerId ? "is-selected" : ""}`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <span className="layer-icon">{layer.type === "logo" ? "🖼️" : "T"}</span>
                    <span className="layer-name">{layer.name || "Слой"}</span>
                    <span className="layer-tag">{layer.type === "logo" ? "Лого" : "Текст"}</span>
                  </li>
                ))
              ) : (
                <li className="empty">Слои отсутствуют.</li>
              )}
            </ul>

            <div className="kit-actions" style={{ marginTop: "0.75rem" }}>
              <button className="btn btn-inline btn-secondary" type="button" onClick={() => moveLayer("up")}>↑</button>
              <button className="btn btn-inline btn-secondary" type="button" onClick={() => moveLayer("down")}>↓</button>
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
                          className="kit-textarea"
                          rows={3}
                          value={selectedLayer.text || ""}
                          onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                        />
                      </div>

                      <div className="field-wide">
                        <label>Размер шрифта <strong>{Math.round(selectedLayer.fontSize)} px</strong></label>
                        <input type="range" min={12} max={220} value={selectedLayer.fontSize}
                          onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} />
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
                            onChange={(e) => updateLayer(selectedLayer.id, { weight: e.target.value })}>
                            {[400, 500, 600, 700, 800, 900].map((w) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Выравнивание</label>
                          <select value={selectedLayer.align || "center"}
                            onChange={(e) => updateLayer(selectedLayer.id, { align: e.target.value })}>
                            <option value="left">Слева</option>
                            <option value="center">По центру</option>
                            <option value="right">Справа</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="empty" style={{ marginTop: "1rem" }}>
                  Выберите слой чтобы редактировать его свойства.
                </p>
              )}
            </div>
          </aside>

        </div>
      </section>
    </>
  );
}

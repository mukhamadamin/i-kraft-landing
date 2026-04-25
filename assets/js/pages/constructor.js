(function () {
  const canvas = document.getElementById("designCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const els = {
    materialType: document.getElementById("materialType"),
    baseColor: document.getElementById("baseColor"),
    logoUpload: document.getElementById("logoUpload"),
    quickText: document.getElementById("quickText"),
    contactPhone: document.getElementById("contactPhone"),
    contactEmail: document.getElementById("contactEmail"),
    contactTelegram: document.getElementById("contactTelegram"),
    addTextLayer: document.getElementById("addTextLayer"),
    addContactLayer: document.getElementById("addContactLayer"),
    duplicateLayer: document.getElementById("duplicateLayer"),
    deleteLayer: document.getElementById("deleteLayer"),
    moveUpLayer: document.getElementById("moveUpLayer"),
    moveDownLayer: document.getElementById("moveDownLayer"),
    downloadDesign: document.getElementById("downloadDesign"),
    resetLayers: document.getElementById("resetLayers"),
    layerList: document.getElementById("layerList"),
    layerControls: document.getElementById("layerControls"),
  };

  const state = {
    material: "bag",
    baseColor: "#c8a174",
    layers: [],
    selectedLayerId: null,
  };

  const runtime = {
    area: null,
    bounds: [],
    images: {},
    noisePattern: null,
    dragging: false,
    dragOffset: { x: 0, y: 0 },
  };

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
    const value = hex.replace("#", "");
    const source = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
    const int = parseInt(source, 16);
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255,
    };
  }

  function shade(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const next = (value) => clamp(value + amount, 0, 255);
    return `rgb(${next(r)}, ${next(g)}, ${next(b)})`;
  }

  function getSelectedLayer() {
    return state.layers.find((layer) => layer.id === state.selectedLayerId) || null;
  }

  function loadLayerImage(layer) {
    if (layer.type !== "logo") return;
    if (!layer.imageSrc) return;
    if (runtime.images[layer.id]) return;

    const image = new Image();
    image.onload = function () {
      runtime.images[layer.id] = image;
      renderCanvas();
    };
    image.src = layer.imageSrc;
  }

  function addDefaultLayer() {
    const settings = window.KraftStore.getState().settings;
    const defaultLayer = {
      id: uid("txt"),
      type: "text",
      name: "Название бренда",
      text: settings.companyName || "ВАШ БРЕНД",
      x: 50,
      y: 48,
      rotation: 0,
      opacity: 90,
      fontSize: 70,
      color: "#3d2917",
      weight: "800",
      align: "center",
    };
    state.layers = [defaultLayer];
    state.selectedLayerId = defaultLayer.id;
  }

  function ensureNoisePattern() {
    if (runtime.noisePattern) return runtime.noisePattern;

    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 180;
    noiseCanvas.height = 180;
    const noiseCtx = noiseCanvas.getContext("2d");

    let seed = 1337;
    function random() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    }

    noiseCtx.clearRect(0, 0, noiseCanvas.width, noiseCanvas.height);
    for (let i = 0; i < 2800; i += 1) {
      const x = Math.floor(random() * noiseCanvas.width);
      const y = Math.floor(random() * noiseCanvas.height);
      const alpha = 0.03 + random() * 0.06;
      noiseCtx.fillStyle = random() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
      noiseCtx.fillRect(x, y, 1, 1);
    }

    runtime.noisePattern = ctx.createPattern(noiseCanvas, "repeat");
    return runtime.noisePattern;
  }

  function drawSceneBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f2e0c9");
    gradient.addColorStop(1, "#cfad84");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pattern = ensureNoisePattern();
    if (pattern) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  function drawBagBase() {
    const w = canvas.width;
    const h = canvas.height;
    const x = w * 0.23;
    const y = h * 0.12;
    const bw = w * 0.54;
    const bh = h * 0.72;

    ctx.save();
    ctx.shadowColor = "rgba(49, 26, 12, 0.32)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 28;

    const grad = ctx.createLinearGradient(x, y, x + bw, y + bh);
    grad.addColorStop(0, shade(state.baseColor, 28));
    grad.addColorStop(1, shade(state.baseColor, -30));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 14);
    ctx.lineTo(x + bw - 28, y + 14);
    ctx.lineTo(x + bw, y + bh);
    ctx.lineTo(x, y + bh);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(54, 30, 14, 0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 248, 236, 0.2)";
    ctx.fillRect(x + bw * 0.08, y + bh * 0.09, bw * 0.19, bh * 0.82);

    ctx.strokeStyle = "rgba(95, 58, 34, 0.28)";
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
  }

  function drawPaperBase() {
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

    ctx.shadowColor = "rgba(51, 28, 14, 0.28)";
    ctx.shadowBlur = 54;
    ctx.shadowOffsetY = 22;

    const grad = ctx.createLinearGradient(x, y, x + pw, y + ph);
    grad.addColorStop(0, shade(state.baseColor, 36));
    grad.addColorStop(1, shade(state.baseColor, -18));
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, pw, ph);

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(86, 50, 28, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, pw, ph);

    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "rgba(79, 46, 24, 0.32)";
    for (let i = 0; i < 14; i += 1) {
      const ly = y + (ph / 14) * i + Math.sin(i * 0.7) * 4;
      ctx.beginPath();
      ctx.moveTo(x + 10, ly);
      ctx.lineTo(x + pw - 10, ly + Math.cos(i) * 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    return {
      x: x + pw * 0.14,
      y: y + ph * 0.19,
      w: pw * 0.72,
      h: ph * 0.62,
      rotation,
    };
  }

  function toAreaPixels(layer) {
    const area = runtime.area;
    if (!area) return { x: 0, y: 0 };

    return {
      x: area.x + (layer.x / 100) * area.w,
      y: area.y + (layer.y / 100) * area.h,
    };
  }

  function drawSingleLayer(layer) {
    const area = runtime.area;
    if (!area) return;

    const center = toAreaPixels(layer);
    const rotation = area.rotation + degToRad(Number(layer.rotation || 0));
    const opacity = clamp(Number(layer.opacity || 100), 0, 100) / 100;

    if (layer.type === "logo") {
      const img = runtime.images[layer.id];
      if (!img) return;

      const targetWidth = area.w * (clamp(Number(layer.size || 40), 8, 150) / 100);
      const ratio = img.height / img.width;
      const targetHeight = targetWidth * ratio;

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();

      runtime.bounds.push({
        id: layer.id,
        x: center.x,
        y: center.y,
        width: targetWidth,
        height: targetHeight,
        rotation,
      });
      return;
    }

    if (layer.type === "text") {
      const lines = String(layer.text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const textLines = lines.length ? lines : ["Текст"]; 
      const fontSize = clamp(Number(layer.fontSize || 48), 12, 220);
      const weight = layer.weight || "700";
      const align = layer.align || "center";

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = layer.color || "#2f2014";
      ctx.font = `${weight} ${fontSize}px Manrope`;
      ctx.textBaseline = "middle";
      ctx.textAlign = align;

      const measuredWidths = textLines.map((line) => ctx.measureText(line).width);
      const textWidth = measuredWidths.length ? Math.max(...measuredWidths) : fontSize * 2;
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

      runtime.bounds.push({
        id: layer.id,
        x: center.x,
        y: center.y,
        width: textWidth,
        height: textHeight,
        rotation,
      });
    }
  }

  function drawSelection() {
    const selected = getSelectedLayer();
    if (!selected) return;

    const hit = runtime.bounds.find((bound) => bound.id === selected.id);
    if (!hit) return;

    ctx.save();
    ctx.translate(hit.x, hit.y);
    ctx.rotate(hit.rotation);
    ctx.strokeStyle = "rgba(208, 100, 45, 0.96)";
    ctx.setLineDash([10, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(-hit.width / 2 - 8, -hit.height / 2 - 8, hit.width + 16, hit.height + 16);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(208, 100, 45, 0.95)";
    ctx.beginPath();
    ctx.arc(hit.width / 2 + 10, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPrintAreaHint() {
    const area = runtime.area;
    if (!area) return;

    ctx.save();
    ctx.translate(area.x + area.w / 2, area.y + area.h / 2);
    ctx.rotate(area.rotation);
    ctx.strokeStyle = "rgba(90, 56, 32, 0.18)";
    ctx.setLineDash([9, 7]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-area.w / 2, -area.h / 2, area.w, area.h);
    ctx.restore();
  }

  function renderCanvas() {
    runtime.bounds = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSceneBackground();
    runtime.area = state.material === "bag" ? drawBagBase() : drawPaperBase();
    drawPrintAreaHint();
    state.layers.forEach((layer) => drawSingleLayer(layer));
    drawSelection();
  }

  function renderLayerList() {
    if (!els.layerList) return;
    if (!state.layers.length) {
      els.layerList.innerHTML = "<li class='empty'>Слои отсутствуют.</li>";
      return;
    }

    els.layerList.innerHTML = state.layers
      .map((layer) => {
        const selected = layer.id === state.selectedLayerId ? "is-selected" : "";
        const typeLabel = layer.type === "logo" ? "Логотип" : "Текст";
        return `
          <li class="layer-item ${selected}" data-layer-id="${window.KraftUI.escapeHtml(layer.id)}">
            <span>${window.KraftUI.escapeHtml(layer.name || "Слой")}</span>
            <span class="layer-tag">${typeLabel}</span>
          </li>
        `;
      })
      .join("");
  }

  function renderLayerControls() {
    if (!els.layerControls) return;
    const layer = getSelectedLayer();
    if (!layer) {
      els.layerControls.innerHTML = "<p class='empty'>Выберите слой, чтобы редактировать его свойства.</p>";
      return;
    }

    const common = `
      <div class="form-grid">
        <div class="field">
          <label>Название слоя</label>
          <input type="text" data-prop="name" value="${window.KraftUI.escapeHtml(layer.name || "")}" />
        </div>
        <div class="field">
          <label>Непрозрачность (${layer.opacity}%)</label>
          <input type="range" min="5" max="100" value="${layer.opacity}" data-prop="opacity" />
        </div>
        <div class="field">
          <label>Позиция X (${Math.round(layer.x)}%)</label>
          <input type="range" min="0" max="100" value="${layer.x}" data-prop="x" />
        </div>
        <div class="field">
          <label>Позиция Y (${Math.round(layer.y)}%)</label>
          <input type="range" min="0" max="100" value="${layer.y}" data-prop="y" />
        </div>
        <div class="field field-wide">
          <label>Поворот (${Math.round(layer.rotation)}°)</label>
          <input type="range" min="-180" max="180" value="${layer.rotation}" data-prop="rotation" />
        </div>
      </div>
    `;

    let specific = "";
    if (layer.type === "logo") {
      specific = `
        <div class="field-wide">
          <label>Размер логотипа (${Math.round(layer.size)}%)</label>
          <input type="range" min="8" max="150" value="${layer.size}" data-prop="size" />
        </div>
      `;
    }

    if (layer.type === "text") {
      specific = `
        <div class="field-wide">
          <label>Текст</label>
          <textarea data-prop="text">${window.KraftUI.escapeHtml(layer.text || "")}</textarea>
        </div>
        <div class="form-grid">
          <div class="field">
            <label>Размер шрифта (${Math.round(layer.fontSize)} px)</label>
            <input type="range" min="12" max="220" value="${layer.fontSize}" data-prop="fontSize" />
          </div>
          <div class="field">
            <label>Цвет текста</label>
            <input type="color" value="${window.KraftUI.escapeHtml(layer.color || "#2f2014")}" data-prop="color" />
          </div>
          <div class="field">
            <label>Насыщенность</label>
            <select data-prop="weight">
              ${[400, 500, 600, 700, 800, 900]
                .map((weight) => `<option value="${weight}" ${String(layer.weight) === String(weight) ? "selected" : ""}>${weight}</option>`)
                .join("")}
            </select>
          </div>
          <div class="field">
            <label>Выравнивание</label>
            <select data-prop="align">
              ${["left", "center", "right"]
                .map(
                  (align) =>
                    `<option value="${align}" ${layer.align === align ? "selected" : ""}>${align === "left" ? "Слева" : align === "center" ? "По центру" : "Справа"}</option>`,
                )
                .join("")}
            </select>
          </div>
        </div>
      `;
    }

    els.layerControls.innerHTML = `${common}${specific}`;
  }

  function renderAll() {
    renderLayerList();
    renderLayerControls();
    renderCanvas();
  }

  function addTextLayer(textValue, name) {
    const layer = {
      id: uid("txt"),
      type: "text",
      name: name || "Текст",
      text: textValue || "Введите ваш текст",
      x: 50,
      y: 50,
      rotation: 0,
      opacity: 96,
      fontSize: 62,
      color: "#2f2014",
      weight: "800",
      align: "center",
    };

    state.layers.push(layer);
    state.selectedLayerId = layer.id;
    renderAll();
  }

  function addLogoLayer(dataUrl, fileName) {
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

    state.layers.push(layer);
    state.selectedLayerId = layer.id;
    loadLayerImage(layer);
    renderAll();
  }

  function addContactsLayer() {
    const lines = [];
    const phone = String(els.contactPhone.value || "").trim();
    const email = String(els.contactEmail.value || "").trim();
    const telegram = String(els.contactTelegram.value || "").trim();

    if (phone) lines.push(`Тел: ${phone}`);
    if (email) lines.push(`Email: ${email}`);
    if (telegram) lines.push(`Telegram: ${telegram}`);

    if (!lines.length) {
      const settings = window.KraftStore.getState().settings;
      if (settings.phone) lines.push(`Тел: ${settings.phone}`);
      if (settings.email) lines.push(`Email: ${settings.email}`);
      if (settings.telegram) lines.push(`Telegram: ${settings.telegram}`);
    }

    addTextLayer(lines.join("\n"), "Контакты");
  }

  function rotatePoint(x, y, cx, cy, angle) {
    const dx = x - cx;
    const dy = y - cy;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function pointToAreaPercent(point) {
    const area = runtime.area;
    if (!area) return { x: 50, y: 50 };

    const centerX = area.x + area.w / 2;
    const centerY = area.y + area.h / 2;
    const unrotated = rotatePoint(point.x, point.y, centerX, centerY, -area.rotation);

    const x = ((unrotated.x - area.x) / area.w) * 100;
    const y = ((unrotated.y - area.y) / area.h) * 100;
    return {
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    };
  }

  function hitTest(point) {
    for (let i = runtime.bounds.length - 1; i >= 0; i -= 1) {
      const bound = runtime.bounds[i];
      const local = rotatePoint(point.x, point.y, bound.x, bound.y, -bound.rotation);
      if (Math.abs(local.x - bound.x) <= bound.width / 2 && Math.abs(local.y - bound.y) <= bound.height / 2) {
        return bound;
      }
    }
    return null;
  }

  function updateLayerProp(prop, value) {
    const layer = getSelectedLayer();
    if (!layer) return;

    if (["x", "y", "opacity", "rotation", "size", "fontSize"].includes(prop)) {
      layer[prop] = Number(value);
    } else {
      layer[prop] = value;
    }

    renderAll();
  }

  function onPointerDown(event) {
    const point = canvasPoint(event);
    const hit = hitTest(point);
    if (!hit) return;

    state.selectedLayerId = hit.id;
    const layer = getSelectedLayer();
    if (!layer) return;

    const percent = pointToAreaPercent(point);
    runtime.dragOffset.x = percent.x - layer.x;
    runtime.dragOffset.y = percent.y - layer.y;
    runtime.dragging = true;

    canvas.setPointerCapture(event.pointerId);
    renderAll();
  }

  function onPointerMove(event) {
    if (!runtime.dragging) return;
    const layer = getSelectedLayer();
    if (!layer) return;

    const point = canvasPoint(event);
    const percent = pointToAreaPercent(point);
    layer.x = clamp(percent.x - runtime.dragOffset.x, 0, 100);
    layer.y = clamp(percent.y - runtime.dragOffset.y, 0, 100);
    renderAll();
  }

  function onPointerUp(event) {
    runtime.dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function moveLayer(direction) {
    const idx = state.layers.findIndex((layer) => layer.id === state.selectedLayerId);
    if (idx < 0) return;

    const target = direction === "up" ? idx + 1 : idx - 1;
    if (target < 0 || target >= state.layers.length) return;

    const temp = state.layers[idx];
    state.layers[idx] = state.layers[target];
    state.layers[target] = temp;
    renderAll();
  }

  function duplicateSelected() {
    const layer = getSelectedLayer();
    if (!layer) return;

    const copy = {
      ...layer,
      id: uid(layer.type === "logo" ? "logo" : "txt"),
      name: `${layer.name || "Слой"} (копия)`,
      x: clamp(Number(layer.x) + 4, 0, 100),
      y: clamp(Number(layer.y) + 4, 0, 100),
    };

    state.layers.push(copy);
    if (copy.type === "logo") {
      loadLayerImage(copy);
    }
    state.selectedLayerId = copy.id;
    renderAll();
  }

  function removeSelected() {
    if (!state.selectedLayerId) return;
    state.layers = state.layers.filter((layer) => layer.id !== state.selectedLayerId);
    state.selectedLayerId = state.layers.length ? state.layers[state.layers.length - 1].id : null;
    renderAll();
  }

  function bindEvents() {
    els.materialType.addEventListener("change", function (event) {
      state.material = event.target.value;
      renderAll();
    });

    els.baseColor.addEventListener("input", function (event) {
      state.baseColor = event.target.value;
      renderAll();
    });

    els.logoUpload.addEventListener("change", function (event) {
      const file = (event.target.files || [])[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function () {
        addLogoLayer(String(reader.result || ""), file.name);
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    });

    els.addTextLayer.addEventListener("click", function () {
      const text = String(els.quickText.value || "").trim();
      addTextLayer(text || "Новый текст", "Текст");
      els.quickText.value = "";
    });

    els.addContactLayer.addEventListener("click", addContactsLayer);

    els.duplicateLayer.addEventListener("click", duplicateSelected);
    els.deleteLayer.addEventListener("click", removeSelected);
    els.moveUpLayer.addEventListener("click", function () {
      moveLayer("up");
    });
    els.moveDownLayer.addEventListener("click", function () {
      moveLayer("down");
    });

    els.downloadDesign.addEventListener("click", function () {
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
      link.href = canvas.toDataURL("image/png");
      link.download = `mockup-${stamp}.png`;
      link.click();
    });

    els.resetLayers.addEventListener("click", function () {
      state.layers = [];
      state.selectedLayerId = null;
      addDefaultLayer();
      renderAll();
    });

    els.layerList.addEventListener("click", function (event) {
      const item = event.target.closest("[data-layer-id]");
      if (!item) return;
      state.selectedLayerId = item.getAttribute("data-layer-id");
      renderAll();
    });

    els.layerControls.addEventListener("input", function (event) {
      const prop = event.target.getAttribute("data-prop");
      if (!prop) return;
      updateLayerProp(prop, event.target.value);
    });

    els.layerControls.addEventListener("change", function (event) {
      const prop = event.target.getAttribute("data-prop");
      if (!prop) return;
      updateLayerProp(prop, event.target.value);
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    window.addEventListener("keydown", function (event) {
      const layer = getSelectedLayer();
      if (!layer) return;
      const step = event.shiftKey ? 2.5 : 1;

      if (event.key === "ArrowLeft") {
        layer.x = clamp(Number(layer.x) - step, 0, 100);
      } else if (event.key === "ArrowRight") {
        layer.x = clamp(Number(layer.x) + step, 0, 100);
      } else if (event.key === "ArrowUp") {
        layer.y = clamp(Number(layer.y) - step, 0, 100);
      } else if (event.key === "ArrowDown") {
        layer.y = clamp(Number(layer.y) + step, 0, 100);
      } else {
        return;
      }

      event.preventDefault();
      renderAll();
    });
  }

  function init() {
    addDefaultLayer();
    bindEvents();
    renderAll();
  }

  init();
})();

import { useCallback, useEffect, useRef } from "react";
import { coarsePointer, reducedMotion } from "./motion";

/* Логотип, «отпечатанный» на лицевой стороне пакета */
const PrintMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/**
 * Интерактивный крафт-пакет на CSS 3D-трансформациях.
 * Реагирует на движение курсора, левитирует и ловит блик.
 */
export function KraftBag3D({ brandName = "I-KRAFT", tagline = "PACK · TASHKENT", children }) {
  const sceneRef = useRef(null);

  const applyRotation = useCallback((rx, ry) => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty("--bag-rx", `${rx.toFixed(2)}deg`);
    scene.style.setProperty("--bag-ry", `${ry.toFixed(2)}deg`);
  }, []);

  /* Курсор крутит пакет; без курсора — медленное автовращение */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;

    if (reducedMotion()) {
      applyRotation(-4, -22);
      return undefined;
    }

    if (coarsePointer()) {
      let frame = 0;
      const start = performance.now();
      const tick = (now) => {
        const t = (now - start) / 1000;
        applyRotation(-6 + Math.sin(t * 0.5) * 4, Math.sin(t * 0.35) * 26);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }

    const onMove = (event) => {
      const rect = scene.getBoundingClientRect();
      const px = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const py = (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      applyRotation(
        Math.max(-16, Math.min(16, -py * 14)),
        Math.max(-38, Math.min(38, px * 34)),
      );
    };

    applyRotation(-5, -18);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [applyRotation]);

  return (
    <div className="bag-scene" ref={sceneRef}>
      <span className="bag-glow" />
      <span className="bag-orbit" />
      <span className="bag-orbit bag-orbit--inner" />
      <span className="bag-shadow" />

      <div className="bag-stage">
        <div className="bag">
          <div className="bag__face bag__side bag__side--left" />
          <div className="bag__face bag__side bag__side--right" />
          <div className="bag__face bag__bottom" />
          <div className="bag__face bag__rim" />

          <div className="bag__face bag__back">
            <span className="bag__handle" />
          </div>

          <div className="bag__face bag__front">
            <span className="bag__handle" />
            <span className="bag__lip" />
            <span className="bag__creases" />
            <span className="bag__fiber" />
            <div className="bag__print">
              <span className="bag__print-mark">
                <PrintMark />
              </span>
              <span className="bag__print-name">{brandName}</span>
              <span className="bag__print-rule" />
              <span className="bag__print-sub">{tagline}</span>
            </div>
            <span className="bag__shine" />
          </div>
        </div>
      </div>

      {children}

      <span className="bag-hint">Двигайте курсором — пакет поворачивается</span>
    </div>
  );
}

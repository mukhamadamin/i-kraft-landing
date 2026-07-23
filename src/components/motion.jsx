import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   MOTION KIT — примитивы анимации без внешних зависимостей.
   Всё построено на IntersectionObserver + rAF + CSS-переменных.
   ═══════════════════════════════════════════════════════════════ */

const isBrowser = typeof window !== "undefined";

export const reducedMotion = () =>
  isBrowser && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const coarsePointer = () => isBrowser && window.matchMedia("(pointer: coarse)").matches;

const lerp = (from, to, amount) => from + (to - from) * amount;

/* ─── Наблюдение за попаданием во вьюпорт ─────────────────────── */

export function useInView({ threshold = 0.14, rootMargin = "0px 0px -8% 0px", once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/* ─── Reveal: появление блока при скролле ─────────────────────── */

export function Reveal({
  as = "div",
  variant = "up",
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}) {
  const [ref, inView] = useInView();

  return createElement(
    as,
    {
      ref,
      className: ["reveal", `reveal--${variant}`, inView ? "is-in" : "", className]
        .filter(Boolean)
        .join(" "),
      style: { "--reveal-delay": `${delay}ms`, ...style },
      ...rest,
    },
    children,
  );
}

/* ─── Stagger: каскадное появление детей ──────────────────────── */

export function Stagger({ as = "div", step = 70, className = "", style, children, ...rest }) {
  const [ref, inView] = useInView();

  return createElement(
    as,
    {
      ref,
      className: ["stagger", inView ? "is-in" : "", className].filter(Boolean).join(" "),
      style: { "--stagger-step": `${step}ms`, ...style },
      ...rest,
    },
    children,
  );
}

/* ─── SplitText: кинетический заголовок по словам/буквам ──────── */

export function SplitText({ text, as = "span", mode = "word", step = 55, delay = 0, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0.2 });

  const tokens = useMemo(() => {
    const value = String(text || "");
    return mode === "char" ? Array.from(value) : value.split(/(\s+)/).filter((part) => part !== "");
  }, [text, mode]);

  let index = 0;

  return createElement(
    as,
    {
      ref,
      className: ["split", inView ? "is-in" : "", className].filter(Boolean).join(" "),
      "aria-label": text,
    },
    tokens.map((token, i) => {
      if (/^\s+$/.test(token)) return <span key={`s${i}`}> </span>;
      const order = index++;
      return (
        <span className="split__mask" key={`${token}-${i}`} aria-hidden="true">
          <span className="split__item" style={{ "--split-delay": `${delay + order * step}ms` }}>
            {token}
          </span>
        </span>
      );
    }),
  );
}

/* ─── Magnetic: элемент притягивается к курсору ───────────────── */

export function Magnetic({ children, strength = 0.32, as = "span", className = "", ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion() || coarsePointer()) return undefined;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.16);
      currentY = lerp(currentY, targetY, 0.16);
      node.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      targetX = (event.clientX - (rect.left + rect.width / 2)) * strength;
      targetY = (event.clientY - (rect.top + rect.height / 2)) * strength;
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return createElement(
    as,
    { ref, className: ["magnetic", className].filter(Boolean).join(" "), ...rest },
    children,
  );
}

/* ─── Tilt: 3D-наклон карточки + световое пятно за курсором ───── */

export function Tilt({
  as = "div",
  max = 9,
  scale = 1.015,
  className = "",
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  const onMove = useCallback(
    (event) => {
      const node = ref.current;
      if (!node || reducedMotion() || coarsePointer()) return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      node.style.setProperty("--tilt-x", `${(0.5 - py) * max * 2}deg`);
      node.style.setProperty("--tilt-y", `${(px - 0.5) * max * 2}deg`);
      node.style.setProperty("--tilt-scale", String(scale));
      node.style.setProperty("--spot-x", `${px * 100}%`);
      node.style.setProperty("--spot-y", `${py * 100}%`);
      node.style.setProperty("--spot-o", "1");
    },
    [max, scale],
  );

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--tilt-scale", "1");
    node.style.setProperty("--spot-o", "0");
  }, []);

  return createElement(
    as,
    {
      ref,
      onPointerMove: onMove,
      onPointerLeave: onLeave,
      className: ["tilt", className].filter(Boolean).join(" "),
      style,
      ...rest,
    },
    children,
  );
}

/* ─── Counter: числа, набегающие при появлении ────────────────── */

export function Counter({ to = 0, duration = 1500, decimals = 0, prefix = "", suffix = "" }) {
  const [ref, inView] = useInView({ threshold: 0.3, rootMargin: "0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reducedMotion()) {
      setValue(to);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(to * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="counter">
      {prefix}
      {value.toLocaleString("ru-RU", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ─── Marquee: бесконечная лента ──────────────────────────────── */

export function Marquee({ children, speed = 38, reverse = false, className = "", copies = 2 }) {
  const items = Array.from({ length: Math.max(2, copies) });

  return (
    <div className={["marquee", className].filter(Boolean).join(" ")}>
      <div
        className={["marquee__track", reverse ? "is-reverse" : ""].filter(Boolean).join(" ")}
        style={{ "--marquee-duration": `${speed}s` }}
      >
        {items.map((_, index) => (
          <div className="marquee__group" key={index} aria-hidden={index > 0 ? "true" : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Parallax: смещение по скроллу ───────────────────────────── */

export function Parallax({ as = "div", speed = 0.12, className = "", style, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion()) return undefined;

    let frame = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const rect = node.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
      node.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return createElement(
    as,
    { ref, className: ["parallax", className].filter(Boolean).join(" "), style, ...rest },
    children,
  );
}

/* ─── Прогресс скролла внутри секции (для таймлайна) ──────────── */

export function useSectionProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let frame = 0;
    let pending = false;

    /* 0 — верх блока опустился до 70% экрана, 1 — низ поднялся до 40% */
    const update = () => {
      pending = false;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const travelled = vh * 0.7 - rect.top;
      const total = Math.max(rect.height - vh * 0.3, 1);
      setProgress(Math.min(Math.max(travelled / total, 0), 1));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return [ref, progress];
}

/* ─── Полоса прогресса чтения страницы ────────────────────────── */

export function ScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let frame = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const value = total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 0;
      node.style.setProperty("--scroll-progress", String(value));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

/* ─── Кастомный курсор: точка + инерционное кольцо ────────────── */

export function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring || reducedMotion() || coarsePointer()) return undefined;

    document.body.classList.add("has-custom-cursor");

    let frame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;

    const tick = () => {
      ringX = lerp(ringX, pointerX, 0.16);
      ringY = lerp(ringY, pointerY, 0.16);
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      ring.classList.add("is-visible");
      dot.classList.add("is-visible");
    };

    const onOver = (event) => {
      const interactive = event.target.closest?.("a, button, input, textarea, select, [data-cursor]");
      ring.classList.toggle("is-active", Boolean(interactive));
    };

    const onLeave = () => {
      ring.classList.remove("is-visible");
      dot.classList.remove("is-visible");
    };

    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}

/* ─── Атмосфера: зерно плёнки + движущиеся световые пятна ─────── */

export function Atmosphere() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion() || coarsePointer()) return undefined;

    let frame = 0;
    let targetX = 50;
    let targetY = 40;
    let currentX = 50;
    let currentY = 40;

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.05);
      currentY = lerp(currentY, targetY, 0.05);
      node.style.setProperty("--aurora-x", `${currentX.toFixed(2)}%`);
      node.style.setProperty("--aurora-y", `${currentY.toFixed(2)}%`);
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="atmosphere" ref={ref} aria-hidden="true">
      <span className="atmosphere__aurora" />
      <span className="atmosphere__orb atmosphere__orb--a" />
      <span className="atmosphere__orb atmosphere__orb--b" />
      <span className="atmosphere__orb atmosphere__orb--c" />
      <span className="atmosphere__grid" />
      <span className="atmosphere__grain" />
    </div>
  );
}

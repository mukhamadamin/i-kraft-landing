import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   Тема оформления: светлая / тёмная / по системе.
   Выбор хранится в localStorage, применяется атрибутом data-theme
   на <html> — вся палитра переопределяется токенами в base.css.
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "kraftvision.theme";
const MODES = ["system", "light", "dark"];

const ThemeContext = createContext({
  mode: "system",
  resolved: "dark",
  setMode: () => {},
  cycle: () => {},
});

const systemPrefersLight = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches;

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : "system";
  } catch (_error) {
    return "system";
  }
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);
  const [systemLight, setSystemLight] = useState(systemPrefersLight);

  /* Следим за системной темой, пока выбран режим «по системе» */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (event) => setSystemLight(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolved = mode === "system" ? (systemLight ? "light" : "dark") : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolved);

    /* Цвет системной панели браузера под текущую тему */
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "light" ? "#f6f2ea" : "#0b0c0d");
  }, [resolved]);

  const setMode = useCallback((next) => {
    const value = MODES.includes(next) ? next : "system";
    setModeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_error) {
      /* приватный режим — просто не запоминаем выбор */
    }
  }, []);

  const cycle = useCallback(() => {
    setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  }, [mode, setMode]);

  const value = useMemo(() => ({ mode, resolved, setMode, cycle }), [mode, resolved, setMode, cycle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/* ─── Иконки режимов ──────────────────────────────────────────── */

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

const IconAuto = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18" />
    <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" />
  </svg>
);

const OPTIONS = [
  { id: "system", label: "По системе", Icon: IconAuto },
  { id: "light", label: "Светлая", Icon: IconSun },
  { id: "dark", label: "Тёмная", Icon: IconMoon },
];

/** Сегментированный переключатель на три режима. */
export function ThemeToggle({ className = "" }) {
  const { mode, setMode } = useTheme();

  return (
    <div
      className={["theme-toggle", className].filter(Boolean).join(" ")}
      role="radiogroup"
      aria-label="Тема оформления"
    >
      {OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={mode === id}
          aria-label={label}
          title={label}
          className={`theme-toggle__btn ${mode === id ? "is-active" : ""}`}
          onClick={() => setMode(id)}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}

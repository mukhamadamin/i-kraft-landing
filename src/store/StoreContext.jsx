import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { defaultState } from "./defaultData";

const STORAGE_KEY = "kraftvision.react.cms.v1";

const StoreContext = createContext(null);

function deepClone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function translit(input) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  return String(input || "")
    .toLowerCase()
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

function toSlug(value) {
  return translit(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uid(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

/* Нормализация формы данных — вызывается только при загрузке,
   импорте и сбросе, а не на каждом изменении. */
function ensureStateShape(raw) {
  const safe = raw && typeof raw === "object" ? deepClone(raw) : {};
  const base = deepClone(defaultState);

  base.settings = { ...base.settings, ...(safe.settings || {}) };

  ["categories", "products", "news", "posts", "clients", "works"].forEach((key) => {
    if (Array.isArray(safe[key])) {
      base[key] = safe[key];
    }
  });

  base.categories = base.categories.map((item) => ({
    ...item,
    id: item.id || uid("cat"),
    slug: item.slug || toSlug(item.title || "category"),
  }));

  base.products = base.products.map((item) => ({
    ...item,
    id: item.id || uid("prd"),
    categoryId: item.categoryId || "",
  }));

  base.news = base.news.map((item) => ({
    ...item,
    id: item.id || uid("news"),
    date: item.date || new Date().toISOString().slice(0, 10),
  }));

  base.posts = base.posts.map((item) => ({
    ...item,
    id: item.id || uid("post"),
    date: item.date || new Date().toISOString().slice(0, 10),
  }));

  base.clients = base.clients.map((item) => ({
    ...item,
    id: item.id || uid("client"),
    logo: item.logo ?? "",
  }));

  base.works = base.works.map((item) => ({
    ...item,
    id: item.id || uid("work"),
    date: item.date || new Date().toISOString().slice(0, 10),
  }));

  return base;
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ensureStateShape(defaultState);
    return ensureStateShape(JSON.parse(raw));
  } catch (_error) {
    return ensureStateShape(defaultState);
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(readState);
  const latestRef = useRef(state);
  const persistTimer = useRef(null);

  latestRef.current = state;

  const flushPersist = useCallback(() => {
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
      persistTimer.current = null;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestRef.current));
    } catch (_error) {
      /* переполнение хранилища не должно ронять интерфейс */
    }
  }, []);

  const schedulePersist = useCallback(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(flushPersist, 250);
  }, [flushPersist]);

  useEffect(() => {
    window.addEventListener("pagehide", flushPersist);
    return () => {
      window.removeEventListener("pagehide", flushPersist);
      flushPersist();
    };
  }, [flushPersist]);

  const commit = useCallback(
    (updater) => {
      setState((prev) => (typeof updater === "function" ? updater(prev) : updater));
      schedulePersist();
    },
    [schedulePersist],
  );

  const api = useMemo(() => {
    const getCollection = (name) => (Array.isArray(state[name]) ? state[name] : []);

    const addItem = (collection, payload) => {
      commit((prev) => {
        if (!Array.isArray(prev[collection])) return prev;

        const item = { ...payload, id: payload.id || uid(collection.slice(0, 3)) };
        if (collection === "categories") {
          item.slug = item.slug || toSlug(item.title || "category");
        }

        return { ...prev, [collection]: [item, ...prev[collection]] };
      });
    };

    const updateItem = (collection, id, patch) => {
      commit((prev) => {
        if (!Array.isArray(prev[collection])) return prev;

        const index = prev[collection].findIndex((item) => item.id === id);
        if (index === -1) return prev;

        const merged = { ...prev[collection][index], ...patch };
        if (collection === "categories") {
          merged.slug = merged.slug || toSlug(merged.title || "category");
        }

        const list = [...prev[collection]];
        list[index] = merged;
        return { ...prev, [collection]: list };
      });
    };

    const deleteItem = (collection, id) => {
      commit((prev) => {
        if (!Array.isArray(prev[collection])) return prev;

        const next = { ...prev, [collection]: prev[collection].filter((item) => item.id !== id) };

        if (collection === "categories") {
          next.products = prev.products.map((item) =>
            item.categoryId === id ? { ...item, categoryId: "" } : item,
          );
          next.works = prev.works.map((item) =>
            item.categoryId === id ? { ...item, categoryId: "" } : item,
          );
        }

        if (collection === "clients") {
          next.works = (next.works || prev.works).map((item) =>
            item.clientId === id ? { ...item, clientId: "" } : item,
          );
        }

        return next;
      });
    };

    const updateSettings = (patch) => {
      commit((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    };

    const reset = () => {
      commit(() => ensureStateShape(defaultState));
    };

    const replaceState = (nextState) => {
      commit(() => ensureStateShape(nextState));
    };

    const importStateFromJson = (text) => {
      const parsed = JSON.parse(text);
      replaceState(parsed);
    };

    return {
      state,
      STORAGE_KEY,
      toSlug,
      uid,
      getCollection,
      addItem,
      updateItem,
      deleteItem,
      updateSettings,
      replaceState,
      importStateFromJson,
      reset,
      exportState: () => deepClone(state),
    };
  }, [state, commit]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}

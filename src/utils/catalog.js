/* ═══════════════════════════════════════════════════════════════
   Каталог: словари характеристик, разбор размеров, фильтрация,
   сортировка и ссылка на заказ. Всё, что нужно и странице каталога,
   и карточке товара, и админке — в одном месте.
   ═══════════════════════════════════════════════════════════════ */

export const MATERIALS = {
  natural: "Натуральный крафт",
  white: "Белый крафт",
};

export const HANDLES = {
  twisted: "Кручёные ручки",
  none: "Без ручек",
};

export const PRINTS = {
  none: "Без печати",
  logo: "Логотип",
  fullcolor: "Полноцветная",
  ready: "Готовый дизайн",
};

export const AVAILABILITY = {
  stock: "В наличии",
  order: "Под заказ",
};

export const SORTS = {
  popular: "Сначала популярные",
  title: "По названию",
  sizeAsc: "Размер: сначала меньше",
  sizeDesc: "Размер: сначала больше",
};

/* Значения из админки — строки; для select'ов нужны пары value/label */
export const optionsOf = (dict) => Object.entries(dict).map(([value, label]) => ({ value, label }));

/* Список из массива или строки «через запятую / с новой строки» */
export function toList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/* «24×15×32», «24x15x32», «24*15*32» → { label, w, d, h, volume } */
export function parseSize(raw) {
  const parts = String(raw || "")
    .split(/\s*[×xX*]\s*/)
    .map((part) => Number(String(part).replace(",", ".")))
    .filter((part) => Number.isFinite(part) && part > 0);

  if (parts.length < 2) return null;
  const [w, d, h = 0] = parts.length === 2 ? [parts[0], 0, parts[1]] : parts;
  return {
    label: parts.join("×"),
    w,
    d,
    h,
    volume: w * (d || 1) * (h || 1),
  };
}

export function parseSizes(value) {
  return toList(value).map(parseSize).filter(Boolean);
}

/* Нормализованный вид товара: старые записи без новых полей тоже работают */
export function productAttrs(product) {
  const sizes = parseSizes(product?.sizes);
  const gallery = toList(product?.gallery);
  const image = product?.image || gallery[0] || "";

  return {
    material: MATERIALS[product?.material] ? product.material : "",
    handles: HANDLES[product?.handles] ? product.handles : "",
    print: PRINTS[product?.print] ? product.print : "",
    availability: AVAILABILITY[product?.availability] ? product.availability : "order",
    sizes,
    /* Основное фото первым, без повторов */
    images: [image, ...gallery].filter((src, index, list) => src && list.indexOf(src) === index),
    price: String(product?.price || "").trim(),
    minOrder: String(product?.minOrder || "").trim(),
    tags: toList(product?.tags),
  };
}

/* Строки таблицы характеристик на странице товара */
export function specRows(product, categoryTitle) {
  const attrs = productAttrs(product);
  const rows = [
    ["Категория", categoryTitle],
    ["Материал", MATERIALS[attrs.material]],
    ["Ручки", HANDLES[attrs.handles]],
    ["Печать", PRINTS[attrs.print]],
    [
      "Размеры (Ш × Б × В)",
      attrs.sizes.length ? `${attrs.sizes.map((size) => size.label).join(", ")} см` : "",
    ],
    ["Тираж", attrs.minOrder],
    ["Наличие", AVAILABILITY[attrs.availability]],
  ];

  /* Произвольный текст характеристик из админки — отдельной строкой */
  if (product?.specs && !attrs.sizes.length) rows.push(["Характеристики", product.specs]);

  return rows.filter(([, value]) => value);
}

/* Короткая подпись под ценой в карточке */
export function priceLabel(product) {
  const { price } = productAttrs(product);
  return price || "Цена по запросу";
}

/* Ссылка «написать в Telegram» с уже заполненным сообщением о товаре */
export function orderLink(settings, product, size) {
  const telegram = String(settings?.telegram || "").replace(/^@/, "");
  const lines = [
    "Здравствуйте! Интересует позиция из каталога I-Kraft Pack:",
    `• ${product?.title || "Крафт-пакет"}`,
  ];
  if (size) lines.push(`• Размер: ${size} см`);
  lines.push("Подскажите, пожалуйста, цену и сроки на тираж ___ шт.");
  const text = encodeURIComponent(lines.join("\n"));

  if (telegram) return `https://t.me/${telegram}?text=${text}`;

  const phone = String(settings?.phone || "").replace(/[^\d+]/g, "");
  if (phone) return `tel:${phone}`;
  if (settings?.email) return `mailto:${settings.email}?subject=${encodeURIComponent("Запрос из каталога")}&body=${text}`;
  return "/constructor";
}

/* ─── Фильтры ─────────────────────────────────────────────────── */

export const emptyFilters = {
  q: "",
  category: "",
  handles: [],
  material: [],
  print: [],
  size: [],
  stock: false,
  sort: "popular",
};

const LIST_KEYS = ["handles", "material", "print", "size"];

export function filtersFromParams(params) {
  const filters = { ...emptyFilters };
  filters.q = params.get("q") || "";
  filters.category = params.get("category") || "";
  if (filters.category === "all") filters.category = "";
  LIST_KEYS.forEach((key) => {
    filters[key] = toList(params.get(key));
  });
  filters.stock = params.get("stock") === "1";
  filters.sort = SORTS[params.get("sort")] ? params.get("sort") : "popular";
  return filters;
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  LIST_KEYS.forEach((key) => {
    if (filters[key]?.length) params.set(key, filters[key].join(","));
  });
  if (filters.stock) params.set("stock", "1");
  if (filters.sort && filters.sort !== "popular") params.set("sort", filters.sort);
  return params;
}

export function countActiveFilters(filters) {
  return (
    (filters.q ? 1 : 0) +
    (filters.category ? 1 : 0) +
    LIST_KEYS.reduce((sum, key) => sum + (filters[key]?.length || 0), 0) +
    (filters.stock ? 1 : 0)
  );
}

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[xX*]/g, "×");

export function matchesFilters(product, filters, category) {
  const attrs = productAttrs(product);

  if (filters.category) {
    const byId = product.categoryId === filters.category;
    const bySlug = category?.slug === filters.category;
    if (!byId && !bySlug) return false;
  }
  if (filters.handles.length && !filters.handles.includes(attrs.handles)) return false;
  if (filters.material.length && !filters.material.includes(attrs.material)) return false;
  if (filters.print.length && !filters.print.includes(attrs.print)) return false;
  if (filters.stock && attrs.availability !== "stock") return false;
  if (filters.size.length) {
    const labels = attrs.sizes.map((size) => size.label);
    if (!filters.size.some((size) => labels.includes(size))) return false;
  }

  if (filters.q) {
    const haystack = normalize(
      [
        product.title,
        product.summary,
        product.description,
        product.specs,
        category?.title,
        MATERIALS[attrs.material],
        HANDLES[attrs.handles],
        PRINTS[attrs.print],
        attrs.sizes.map((size) => size.label).join(" "),
        attrs.tags.join(" "),
      ].join(" "),
    );
    const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
    if (!terms.every((term) => haystack.includes(term))) return false;
  }

  return true;
}

const minVolume = (product) => {
  const { sizes } = productAttrs(product);
  return sizes.length ? Math.min(...sizes.map((size) => size.volume)) : Number.POSITIVE_INFINITY;
};

const maxVolume = (product) => {
  const { sizes } = productAttrs(product);
  return sizes.length ? Math.max(...sizes.map((size) => size.volume)) : 0;
};

export function sortProducts(list, sort) {
  const sorted = [...list];
  switch (sort) {
    case "title":
      return sorted.sort((a, b) => String(a.title).localeCompare(String(b.title), "ru"));
    case "sizeAsc":
      return sorted.sort((a, b) => minVolume(a) - minVolume(b));
    case "sizeDesc":
      return sorted.sort((a, b) => maxVolume(b) - maxVolume(a));
    default:
      /* «Популярные» — порядок, заданный в админке; товары в наличии выше */
      return sorted.sort(
        (a, b) =>
          (productAttrs(b).availability === "stock") - (productAttrs(a).availability === "stock"),
      );
  }
}

/* Все размеры каталога — для фасета «Размер», по возрастанию объёма */
export function collectSizes(products) {
  const map = new Map();
  products.forEach((product) => {
    productAttrs(product).sizes.forEach((size) => {
      if (!map.has(size.label)) map.set(size.label, size);
    });
  });
  return [...map.values()].sort((a, b) => a.volume - b.volume);
}

/* Сколько товаров останется, если добавить это значение к фасету —
   показывается счётчиком рядом с чекбоксом */
export function facetCounts(products, categoryMap, filters, key, values) {
  return values.map((value) => {
    const next = { ...filters, [key]: [value] };
    const count = products.filter((product) =>
      matchesFilters(product, next, categoryMap[product.categoryId]),
    ).length;
    return { value, count };
  });
}

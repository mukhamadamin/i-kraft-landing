import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { ProductCard } from "../components/Cards";
import { PageHead } from "../components/PageHead";
import {
  AVAILABILITY,
  HANDLES,
  MATERIALS,
  PRINTS,
  SORTS,
  collectSizes,
  countActiveFilters,
  emptyFilters,
  facetCounts,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
  sortProducts,
} from "../utils/catalog";

/* ─── Иконки ──────────────────────────────────────────────────── */

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h18M6 12h12M10 19h4" />
  </svg>
);

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/* ─── Медиазапрос как состояние ───────────────────────────────── */

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/* ─── Группа чекбоксов ────────────────────────────────────────── */

function FacetGroup({ title, name, options, selected, counts, onToggle }) {
  return (
    <fieldset className="facet">
      <legend className="facet__title">{title}</legend>
      <div className="facet__list">
        {options.map(({ value, label }) => {
          const count = counts?.find((item) => item.value === value)?.count ?? 0;
          const checked = selected.includes(value);
          return (
            <label className={`facet__item ${checked ? "is-on" : ""} ${!count && !checked ? "is-empty" : ""}`} key={value}>
              <input
                type="checkbox"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onToggle(name, value)}
              />
              <span className="facet__box" aria-hidden="true" />
              <span className="facet__label">{label}</span>
              <span className="facet__count">{count}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ─── Каталог ─────────────────────────────────────────────────── */

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const {
    state: { products, categories, settings },
  } = useStore();

  const filters = useMemo(() => filtersFromParams(params), [params]);

  /* Поле поиска живёт локально и попадает в URL с задержкой —
     иначе каждая буква переписывала бы историю браузера */
  const [query, setQuery] = useState(filters.q);
  const deferredQuery = useDeferredValue(query);
  const pushedQuery = useRef(filters.q);

  /* URL изменился извне (кнопка «назад», снятие чипа) — подтягиваем в поле */
  useEffect(() => {
    if (filters.q !== pushedQuery.current) {
      pushedQuery.current = filters.q;
      setQuery(filters.q);
    }
  }, [filters.q]);

  useEffect(() => {
    if (deferredQuery === filters.q) return undefined;
    const timer = setTimeout(() => {
      pushedQuery.current = deferredQuery;
      setParams(filtersToParams({ ...filters, q: deferredQuery }), { replace: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [deferredQuery, filters, setParams]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const isNarrow = useMediaQuery("(max-width: 980px)");

  useEffect(() => {
    if (!isNarrow) setMobileOpen(false);
  }, [isNarrow]);

  /* Под открытой панелью фильтров страница не прокручивается */
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const update = (patch, { replace = false } = {}) => {
    setParams(filtersToParams({ ...filters, ...patch }), { replace });
  };

  const toggleValue = (key, value) => {
    const list = filters[key] || [];
    update({ [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] });
  };

  const reset = () => {
    pushedQuery.current = "";
    setQuery("");
    setParams(filtersToParams({ ...emptyFilters, sort: filters.sort }));
  };

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.id, item])),
    [categories],
  );

  /* Отложенный поиск: сетка пересчитывается, не блокируя ввод */
  const liveFilters = useMemo(() => ({ ...filters, q: deferredQuery }), [filters, deferredQuery]);

  const filtered = useMemo(
    () =>
      sortProducts(
        products.filter((item) => matchesFilters(item, liveFilters, categoryMap[item.categoryId])),
        liveFilters.sort,
      ),
    [products, categoryMap, liveFilters],
  );

  const sizes = useMemo(() => collectSizes(products), [products]);

  const counts = useMemo(() => {
    const base = liveFilters;
    return {
      handles: facetCounts(products, categoryMap, base, "handles", Object.keys(HANDLES)),
      material: facetCounts(products, categoryMap, base, "material", Object.keys(MATERIALS)),
      print: facetCounts(products, categoryMap, base, "print", Object.keys(PRINTS)),
      size: facetCounts(products, categoryMap, base, "size", sizes.map((size) => size.label)),
      stock: products.filter((item) =>
        matchesFilters(item, { ...base, stock: true }, categoryMap[item.categoryId]),
      ).length,
      category: categories.map((category) => ({
        value: category.id,
        count: products.filter((item) =>
          matchesFilters(item, { ...base, category: category.id }, categoryMap[item.categoryId]),
        ).length,
      })),
    };
  }, [products, categories, categoryMap, sizes, liveFilters]);

  const activeCount = countActiveFilters(liveFilters);

  /* Активные фильтры — чипы с крестиком над сеткой */
  const activeChips = [];
  if (liveFilters.category) {
    const category = categoryMap[liveFilters.category] || categories.find((item) => item.slug === liveFilters.category);
    activeChips.push({ key: "category", label: category?.title || "Категория", onRemove: () => update({ category: "" }) });
  }
  liveFilters.handles.forEach((value) =>
    activeChips.push({ key: `handles-${value}`, label: HANDLES[value], onRemove: () => toggleValue("handles", value) }),
  );
  liveFilters.material.forEach((value) =>
    activeChips.push({ key: `material-${value}`, label: MATERIALS[value], onRemove: () => toggleValue("material", value) }),
  );
  liveFilters.print.forEach((value) =>
    activeChips.push({ key: `print-${value}`, label: `Печать: ${PRINTS[value]}`, onRemove: () => toggleValue("print", value) }),
  );
  liveFilters.size.forEach((value) =>
    activeChips.push({ key: `size-${value}`, label: `${value} см`, onRemove: () => toggleValue("size", value) }),
  );
  if (liveFilters.stock) activeChips.push({ key: "stock", label: AVAILABILITY.stock, onRemove: () => update({ stock: false }) });
  if (liveFilters.q) activeChips.push({ key: "q", label: `«${liveFilters.q}»`, onRemove: () => { pushedQuery.current = ""; setQuery(""); update({ q: "" }, { replace: true }); } });

  const facets = (
    <>
      <fieldset className="facet">
        <legend className="facet__title">Категория</legend>
        <div className="facet__list">
          <label className={`facet__item ${!liveFilters.category ? "is-on" : ""}`}>
            <input type="radio" name="category" checked={!liveFilters.category} onChange={() => update({ category: "" })} />
            <span className="facet__box facet__box--radio" aria-hidden="true" />
            <span className="facet__label">Все категории</span>
            <span className="facet__count">{products.length}</span>
          </label>
          {categories.map((category) => {
            const checked = liveFilters.category === category.id || liveFilters.category === category.slug;
            const count = counts.category.find((item) => item.value === category.id)?.count ?? 0;
            return (
              <label className={`facet__item ${checked ? "is-on" : ""} ${!count && !checked ? "is-empty" : ""}`} key={category.id}>
                <input type="radio" name="category" checked={checked} onChange={() => update({ category: category.id })} />
                <span className="facet__box facet__box--radio" aria-hidden="true" />
                <span className="facet__label">{category.title}</span>
                <span className="facet__count">{count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <FacetGroup
        title="Ручки"
        name="handles"
        options={Object.entries(HANDLES).map(([value, label]) => ({ value, label }))}
        selected={liveFilters.handles}
        counts={counts.handles}
        onToggle={toggleValue}
      />
      <FacetGroup
        title="Материал"
        name="material"
        options={Object.entries(MATERIALS).map(([value, label]) => ({ value, label }))}
        selected={liveFilters.material}
        counts={counts.material}
        onToggle={toggleValue}
      />
      <FacetGroup
        title="Печать"
        name="print"
        options={Object.entries(PRINTS).map(([value, label]) => ({ value, label }))}
        selected={liveFilters.print}
        counts={counts.print}
        onToggle={toggleValue}
      />

      {sizes.length ? (
        <fieldset className="facet">
          <legend className="facet__title">
            Размер <small>Ш × Б × В, см</small>
          </legend>
          <div className="facet__chips">
            {sizes.map((size) => {
              const checked = liveFilters.size.includes(size.label);
              const count = counts.size.find((item) => item.value === size.label)?.count ?? 0;
              return (
                <button
                  type="button"
                  key={size.label}
                  className={`size-chip size-chip--btn ${checked ? "is-on" : ""} ${!count && !checked ? "is-empty" : ""}`}
                  aria-pressed={checked}
                  onClick={() => toggleValue("size", size.label)}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="facet">
        <legend className="facet__title">Наличие</legend>
        <div className="facet__list">
          <label className={`facet__item ${liveFilters.stock ? "is-on" : ""}`}>
            <input type="checkbox" checked={liveFilters.stock} onChange={() => update({ stock: !liveFilters.stock })} />
            <span className="facet__box" aria-hidden="true" />
            <span className="facet__label">Только в наличии</span>
            <span className="facet__count">{counts.stock}</span>
          </label>
        </div>
      </fieldset>
    </>
  );

  return (
    <>
      <PageHead
        eyebrow="Каталог"
        title="Крафт-пакеты для бизнеса"
        subtitle="Пакеты с кручеными ручками и без, натуральный и белый крафт, печать логотипа или готовый дизайн. Подберите формат по фильтрам — цену и сроки посчитаем под ваш тираж."
      />

      <section className="container catalog">
        {/* Панель инструментов */}
        <div className="catalog__toolbar">
          <label className="catalog__search">
            <IconSearch />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск: название, размер, материал…"
              aria-label="Поиск по каталогу"
              autoComplete="off"
            />
            {query ? (
              <button type="button" className="catalog__clear" aria-label="Очистить поиск" onClick={() => setQuery("")}>
                <IconClose />
              </button>
            ) : null}
          </label>

          <div className="catalog__tools">
            <button
              type="button"
              className={`btn btn-secondary btn-inline catalog__filters-btn ${activeCount ? "has-active" : ""}`}
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="catalog-filters"
            >
              <IconFilter /> Фильтры
              {activeCount ? <span className="catalog__filters-count">{activeCount}</span> : null}
            </button>

            <label className="catalog__sort">
              <span>Сортировка</span>
              <select value={liveFilters.sort} onChange={(event) => update({ sort: event.target.value }, { replace: true })}>
                {Object.entries(SORTS).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="catalog__layout">
          {/* Панель фильтров: на десктопе — липкая колонка, на узких экранах —
              выезжающая панель через портал (main создаёт свой stacking
              context, и внутри него панель не поднялась бы над шапкой) */}
          {isNarrow ? (
            mobileOpen
              ? createPortal(
                  <div className="catalog-drawer" role="dialog" aria-modal="true" aria-label="Фильтры каталога">
                    <button type="button" className="catalog-drawer__scrim" aria-label="Закрыть фильтры" onClick={() => setMobileOpen(false)} />
                    <aside className="catalog__aside catalog__aside--drawer">
                      <div className="catalog__aside-head">
                        <b>Фильтры</b>
                        <div className="catalog__aside-actions">
                          {activeCount ? (
                            <button type="button" className="catalog__reset" onClick={reset}>
                              Сбросить
                            </button>
                          ) : null}
                          <button type="button" className="catalog__aside-close" aria-label="Закрыть фильтры" onClick={() => setMobileOpen(false)}>
                            <IconClose />
                          </button>
                        </div>
                      </div>
                      <div className="catalog__facets">{facets}</div>
                      <div className="catalog__aside-foot">
                        <button type="button" className="btn" onClick={() => setMobileOpen(false)}>
                          Показать {filtered.length} {plural(filtered.length, ["позицию", "позиции", "позиций"])}
                        </button>
                      </div>
                    </aside>
                  </div>,
                  document.body,
                )
              : null
          ) : (
            <aside id="catalog-filters" className="catalog__aside" aria-label="Фильтры каталога">
              <div className="catalog__aside-head">
                <b>Фильтры</b>
                {activeCount ? (
                  <button type="button" className="catalog__reset" onClick={reset}>
                    Сбросить
                  </button>
                ) : null}
              </div>
              <div className="catalog__facets">{facets}</div>
            </aside>
          )}

          {/* Результаты */}
          <div className="catalog__results">
            <div className="catalog__status">
              <p className="catalog__count">
                {filtered.length ? (
                  <>
                    <b>{filtered.length}</b> {plural(filtered.length, ["позиция", "позиции", "позиций"])}
                    {activeCount ? ` из ${products.length}` : ""}
                  </>
                ) : (
                  "Ничего не найдено"
                )}
              </p>
              {activeChips.length ? (
                <div className="catalog__active">
                  {activeChips.map((chip) => (
                    <button type="button" className="active-chip" key={chip.key} onClick={chip.onRemove}>
                      {chip.label}
                      <IconClose />
                    </button>
                  ))}
                  <button type="button" className="catalog__reset" onClick={reset}>
                    Сбросить всё
                  </button>
                </div>
              ) : null}
            </div>

            {filtered.length ? (
              <div className="catalog__grid">
                {filtered.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    categoryName={categoryMap[item.categoryId]?.title}
                    settings={settings}
                  />
                ))}
              </div>
            ) : (
              <div className="catalog__empty">
                <b>По этим условиям ничего нет</b>
                <p>Попробуйте убрать часть фильтров — или напишите нам: сделаем нужный размер и печать под заказ.</p>
                <div className="catalog__empty-actions">
                  <button type="button" className="btn btn-secondary" onClick={reset}>
                    Сбросить фильтры
                  </button>
                  <Link className="btn" to="/constructor">
                    Собрать свой пакет
                  </Link>
                </div>
              </div>
            )}

            {/* Подсказка под сеткой: как считается цена */}
            <div className="catalog__note">
              <b>Как формируется цена</b>
              <p>
                Стоимость зависит от размера, плотности бумаги, типа печати и тиража. Нажмите «Запросить цену» —
                в Telegram откроется сообщение с выбранной позицией, останется указать количество.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* 1 позиция / 2 позиции / 5 позиций */
function plural(count, [one, few, many]) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

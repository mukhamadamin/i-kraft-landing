import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { EmptyState, ProductCard, WorkCard } from "../components/Cards";
import { Reveal } from "../components/motion";
import { AVAILABILITY, orderLink, priceLabel, productAttrs, specRows } from "../utils/catalog";

const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L5.7 13.1 1 11.6c-1-.3-1-1 .2-1.5l19.2-7.4c.9-.3 1.6.2 1.5 1.6Z" />
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const benefits = [
  "Макет до печати — покажем, как ляжет логотип",
  "Собственное производство в Самарканде",
  "Доставка по всему Узбекистану",
  "Повторный тираж по сохранённому макету",
];

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    state: { products, categories, works, clients, settings },
  } = useStore();

  const product = products.find((item) => item.id === id);
  const attrs = useMemo(() => (product ? productAttrs(product) : null), [product]);

  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState("");

  /* При переходе между товарами сбрасываем выбор фото и размера */
  useEffect(() => {
    setActiveImage(0);
    setActiveSize(attrs?.sizes[0]?.label || "");
  }, [id, attrs]);

  useEffect(() => {
    if (!product) return undefined;
    const previous = document.title;
    document.title = `${product.title} — ${settings.companyName || "I-Kraft Pack"}`;
    return () => {
      document.title = previous;
    };
  }, [product, settings.companyName]);

  if (!product || !attrs) {
    return (
      <section className="container section">
        <EmptyState text="Товар не найден." />
        <p style={{ textAlign: "center", marginTop: "1.2rem" }}>
          <Link className="btn btn-secondary" to="/catalog">
            В каталог
          </Link>
        </p>
      </section>
    );
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item.title]));
  const clientMap = Object.fromEntries(clients.map((item) => [item.id, item.name]));
  const rows = specRows(product, category?.title);
  const inStock = attrs.availability === "stock";
  const image = attrs.images[Math.min(activeImage, attrs.images.length - 1)] || "";

  /* Кейсы с этим пакетом: по фото из галереи товара, иначе — по категории */
  const relatedWorks = (() => {
    const byImage = works.filter((work) => attrs.images.includes(work.image));
    const list = byImage.length ? byImage : works.filter((work) => work.categoryId === product.categoryId);
    return list.slice(0, 3);
  })();

  const related = products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const score = (item) =>
        (item.categoryId === product.categoryId ? 2 : 0) +
        (productAttrs(item).handles === attrs.handles ? 1 : 0) +
        (productAttrs(item).material === attrs.material ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);

  const tgHref = orderLink(settings, product, activeSize);

  return (
    <>
      <section className="container product">
        <nav className="breadcrumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link to="/catalog">Каталог</Link>
          {category ? (
            <>
              <span aria-hidden="true">/</span>
              <Link to={`/catalog?category=${category.id}`}>{category.title}</Link>
            </>
          ) : null}
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.title}</span>
        </nav>

        <div className="product__layout">
          {/* Галерея */}
          <div className="product__gallery">
            <div className="product__stage">
              {image ? (
                <img src={image} alt={product.title} width="800" height="800" decoding="async" fetchPriority="high" />
              ) : (
                <div className="image-fallback">{product.title}</div>
              )}
              <span className={`pcard__badge ${inStock ? "is-stock" : ""}`}>{AVAILABILITY[attrs.availability]}</span>
            </div>
            {attrs.images.length > 1 ? (
              <div className="product__thumbs" role="tablist" aria-label="Фото товара">
                {attrs.images.map((src, index) => (
                  <button
                    type="button"
                    key={src}
                    role="tab"
                    aria-selected={index === activeImage}
                    className={`product__thumb ${index === activeImage ? "is-active" : ""}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={src} alt="" loading="lazy" decoding="async" width="160" height="160" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Информация и заказ */}
          <div className="product__info">
            <p className="product__category">{category?.title || "Без категории"}</p>
            <h1 className="product__title">{product.title}</h1>
            <p className="product__summary">{product.summary}</p>

            {attrs.sizes.length ? (
              <div className="product__sizes">
                <div className="product__sizes-head">
                  <b>Размер</b>
                  <span>ширина × боковая × высота, см</span>
                </div>
                <div className="product__sizes-list" role="radiogroup" aria-label="Размер">
                  {attrs.sizes.map((size) => (
                    <button
                      type="button"
                      key={size.label}
                      role="radio"
                      aria-checked={activeSize === size.label}
                      className={`size-chip size-chip--btn size-chip--lg ${activeSize === size.label ? "is-on" : ""}`}
                      onClick={() => setActiveSize(size.label)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                <p className="product__sizes-note">Нужен другой размер — сделаем под заказ.</p>
              </div>
            ) : null}

            <div className="product__order">
              <div className="product__price">
                <b>{priceLabel(product)}</b>
                <span>{attrs.minOrder || "Тираж — по запросу"} · зависит от размера, печати и количества</span>
              </div>
              <div className="product__actions">
                <a className="btn btn-lg" href={tgHref} target="_blank" rel="noreferrer">
                  <IconTelegram />
                  Запросить цену
                </a>
                <Link className="btn btn-secondary btn-lg" to="/constructor">
                  Примерить логотип
                </Link>
              </div>
              <ul className="product__benefits">
                {benefits.map((text) => (
                  <li key={text}>
                    <IconCheck />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <table className="spec-table">
              <caption>Характеристики</caption>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Описание */}
        {product.description ? (
          <Reveal className="product__description" delay={60}>
            <h2>О товаре</h2>
            <p>{product.description}</p>
            {attrs.tags.length ? (
              <div className="chip-row">
                {attrs.tags.map((tag) => (
                  <Link className="chip" key={tag} to={`/catalog?q=${encodeURIComponent(tag)}`}>
                    {tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </Reveal>
        ) : null}
      </section>

      {relatedWorks.length ? (
        <section className="container section-tight product-related">
          <div className="section-head">
            <div className="section-head-text">
              <h2>Так выглядит в работе</h2>
              <p>Пакеты этого формата, которые уже печатали для клиентов.</p>
            </div>
            <Link to="/works" className="btn btn-secondary btn-inline">
              Все работы <span className="btn-arrow">→</span>
            </Link>
          </div>
          <div className="grid-cards">
            {relatedWorks.map((work) => (
              <WorkCard
                key={work.id}
                item={work}
                clientName={clientMap[work.clientId]}
                categoryName={categoryMap[work.categoryId]}
              />
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="container section-tight product-related">
          <div className="section-head">
            <div className="section-head-text">
              <h2>Похожие позиции</h2>
            </div>
            <Link to="/catalog" className="btn btn-secondary btn-inline">
              Весь каталог <span className="btn-arrow">→</span>
            </Link>
          </div>
          <div className="catalog__grid">
            {related.map((item) => (
              <ProductCard key={item.id} item={item} categoryName={categoryMap[item.categoryId]} settings={settings} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

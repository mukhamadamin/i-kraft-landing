import { Link } from "react-router-dom";
import { formatDate } from "../utils/format";
import { AVAILABILITY, HANDLES, MATERIALS, PRINTS, orderLink, priceLabel, productAttrs } from "../utils/catalog";
import { Tilt } from "./motion";

/* Карточка товара в каталоге: фото, бейдж наличия, ключевые
   характеристики, размеры и запрос цены. Без Tilt — в сетке из
   десятка карточек 3D-наклон стоил дороже, чем выглядел. */
export function ProductCard({ item, categoryName, settings }) {
  const attrs = productAttrs(item);
  const to = `/product/${item.id}`;
  const inStock = attrs.availability === "stock";

  return (
    <article className="pcard">
      <Link to={to} className="pcard__media" aria-label={item.title}>
        {attrs.images[0] ? (
          <img src={attrs.images[0]} alt={item.title} loading="lazy" decoding="async" width="800" height="800" />
        ) : (
          <div className="image-fallback">{item.title}</div>
        )}
        <span className={`pcard__badge ${inStock ? "is-stock" : ""}`}>
          {AVAILABILITY[attrs.availability]}
        </span>
        {attrs.print === "ready" ? <span className="pcard__badge pcard__badge--ready">Готовый дизайн</span> : null}
      </Link>

      <div className="pcard__body">
        <p className="pcard__meta">{categoryName || "Без категории"}</p>
        <h3 className="pcard__title">
          <Link to={to}>{item.title}</Link>
        </h3>
        <p className="pcard__summary">{item.summary}</p>

        <dl className="pcard__specs">
          {attrs.material ? (
            <div>
              <dt>Материал</dt>
              <dd>{MATERIALS[attrs.material]}</dd>
            </div>
          ) : null}
          {attrs.handles ? (
            <div>
              <dt>Ручки</dt>
              <dd>{HANDLES[attrs.handles]}</dd>
            </div>
          ) : null}
          {attrs.print ? (
            <div>
              <dt>Печать</dt>
              <dd>{PRINTS[attrs.print]}</dd>
            </div>
          ) : null}
        </dl>

        {attrs.sizes.length ? (
          <div className="pcard__sizes" aria-label="Размеры, см">
            {attrs.sizes.map((size) => (
              <span className="size-chip" key={size.label}>
                {size.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="pcard__foot">
          <div className="pcard__price">
            <b>{priceLabel(item)}</b>
            <span>{attrs.minOrder || "Тираж — по запросу"}</span>
          </div>
          <a
            className="btn btn-inline"
            href={orderLink(settings, item)}
            target="_blank"
            rel="noreferrer"
          >
            Запросить цену
          </a>
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ item, type }) {
  return (
    <Tilt as="article" className="card noise-card" max={7}>
      <div className="card-media">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" />
        ) : (
          <div className="image-fallback">{item.title}</div>
        )}
      </div>
      <div className="card-body">
        <p className="card-meta">{formatDate(item.date)}</p>
        <h3 className="card-title">{item.title}</h3>
        <p className="card-text">{item.excerpt}</p>
        <div className="card-actions">
          <span className="chip">{type === "posts" ? item.readTime || "Пост" : "Новость"}</span>
          <Link className="card-link" to={`/article/${type}/${item.id}`}>
            Читать
          </Link>
        </div>
      </div>
    </Tilt>
  );
}

export function ClientCard({ item, worksCount }) {
  return (
    <Tilt as="article" className="card noise-card" max={7}>
      <div className="client-card-logo">
        {item.logo ? (
          <img src={item.logo} alt={item.name} className="client-logo-img" />
        ) : (
          <span className="client-logo-badge">{item.name.charAt(0)}</span>
        )}
      </div>
      <div className="card-body">
        <p className="card-meta">{item.industry}</p>
        <h3 className="card-title">{item.name}</h3>
        <p className="card-text">{item.about}</p>
        <div className="card-actions">
          <span className="chip">Кейсов: {worksCount}</span>
          <a className="card-link" href={item.website || "#"} target="_blank" rel="noreferrer">
            Сайт клиента
          </a>
        </div>
      </div>
    </Tilt>
  );
}

export function WorkCard({ item, clientName, categoryName }) {
  return (
    <Tilt as="article" className="card noise-card" max={7}>
      <div className="card-media">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" />
        ) : (
          <div className="image-fallback">{item.title}</div>
        )}
      </div>
      <div className="card-body">
        <p className="card-meta">
          {clientName || "Клиент"} • {categoryName || "Без категории"}
        </p>
        <h3 className="card-title">{item.title}</h3>
        <p className="card-text">{item.result || item.solution}</p>
        <div className="card-actions">
          <span className="chip">{formatDate(item.date)}</span>
          <Link className="card-link" to={`/work/${item.id}`}>
            Кейс
          </Link>
        </div>
      </div>
    </Tilt>
  );
}

export function CategoryCard({ item, count }) {
  return (
    <Tilt as="article" className="card noise-card" max={7}>
      <div className="card-media">
        {item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" />
        ) : (
          <div className="image-fallback">{item.title}</div>
        )}
      </div>
      <div className="card-body">
        <p className="card-meta">Направление</p>
        <h3 className="card-title">{item.title}</h3>
        <p className="card-text">{item.description}</p>
        <div className="card-actions">
          <span className="chip">Позиции: {count}</span>
          <Link className="card-link" to={`/catalog?category=${item.id}`}>
            Открыть каталог
          </Link>
        </div>
      </div>
    </Tilt>
  );
}

export function EmptyState({ text }) {
  return <p className="empty">{text || "Пока нет данных"}</p>;
}

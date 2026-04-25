import { Link } from "react-router-dom";
import { formatDate } from "../utils/format";

export function ProductCard({ item, categoryName }) {
  return (
    <article className="card reveal-item">
      <div className="card-media">{item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <div className="image-fallback">{item.title}</div>}</div>
      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-meta">{categoryName || "Без категории"}</p>
        <p className="card-text">{item.summary}</p>
        <div className="card-actions">
          <span className="chip">{item.minOrder || "По запросу"}</span>
          <Link className="card-link" to={`/product/${item.id}`}>
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ item, type }) {
  return (
    <article className="card reveal-item">
      <div className="card-media">{item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <div className="image-fallback">{item.title}</div>}</div>
      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-meta">{formatDate(item.date)}</p>
        <p className="card-text">{item.excerpt}</p>
        <div className="card-actions">
          <span className="chip">{type === "posts" ? item.readTime || "Пост" : "Новость"}</span>
          <Link className="card-link" to={`/article/${type}/${item.id}`}>
            Читать
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ClientCard({ item, worksCount }) {
  return (
    <article className="card reveal-item">
      <div className="client-card-logo">
        {item.logo ? (
          <img src={item.logo} alt={item.name} className="client-logo-img" />
        ) : (
          <span className="client-logo-badge">{item.name.charAt(0)}</span>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">{item.name}</h3>
        <p className="card-meta">{item.industry}</p>
        <p className="card-text">{item.about}</p>
        <div className="card-actions">
          <span className="chip">Кейсов: {worksCount}</span>
          <a className="card-link" href={item.website || "#"} target="_blank" rel="noreferrer">
            Сайт клиента
          </a>
        </div>
      </div>
    </article>
  );
}

export function WorkCard({ item, clientName, categoryName }) {
  return (
    <article className="card reveal-item">
      <div className="card-media">{item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <div className="image-fallback">{item.title}</div>}</div>
      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>
        <p className="card-meta">
          {clientName || "Клиент"} • {categoryName || "Без категории"}
        </p>
        <p className="card-text">{item.result || item.solution}</p>
        <div className="card-actions">
          <span className="chip">{formatDate(item.date)}</span>
          <Link className="card-link" to={`/work/${item.id}`}>
            Кейс
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ text }) {
  return <p className="empty">{text || "Пока нет данных"}</p>;
}

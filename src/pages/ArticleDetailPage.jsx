import { Link, useParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { formatDate, paragraphize } from "../utils/format";
import { PageHead } from "../components/PageHead";
import { EmptyState } from "../components/Cards";

export function ArticleDetailPage() {
  const { type, id } = useParams();
  const collectionKey = type === "posts" ? "posts" : "news";

  const { state } = useStore();
  const collection = state[collectionKey] || [];
  const item = collection.find((entry) => entry.id === id);

  if (!item) {
    return (
      <section className="container section">
        <EmptyState text="Материал не найден." />
      </section>
    );
  }

  const related = collection.filter((entry) => entry.id !== item.id).slice(0, 3);

  return (
    <>
      <PageHead
        eyebrow={collectionKey === "posts" ? "Пост" : "Новость"}
        title="Подробности"
        subtitle="Полный текст материала"
      />

      <section className="container">
        <div className="article reveal-item">
          <div className="article-cover">
            {item.image ? <img src={item.image} alt={item.title} /> : <div className="image-fallback">{item.title}</div>}
          </div>
          <div className="article-inner">
            <h1 className="article-title">{item.title}</h1>
            <p className="article-meta">
              {formatDate(item.date)} {collectionKey === "posts" && item.author ? `• ${item.author}` : ""}
            </p>
            <div className="article-body">
              {paragraphize(item.content || item.excerpt).map((paragraph, index) => (
                <p key={`${item.id}_${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="section sidebar-card reveal-item">
          <h3>Другие материалы</h3>
          <div className="chip-row">
            {related.length
              ? related.map((entry) => (
                  <Link className="chip" key={entry.id} to={`/article/${collectionKey}/${entry.id}`}>
                    {entry.title}
                  </Link>
                ))
              : "Других материалов пока нет"}
          </div>
        </div>
      </section>
    </>
  );
}

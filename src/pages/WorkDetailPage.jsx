import { Link, useParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { formatDate } from "../utils/format";
import { PageHead } from "../components/PageHead";
import { EmptyState } from "../components/Cards";

export function WorkDetailPage() {
  const { id } = useParams();
  const {
    state: { works, categories, clients },
  } = useStore();

  const work = works.find((item) => item.id === id);
  if (!work) {
    return (
      <section className="container section">
        <EmptyState text="Кейс не найден." />
      </section>
    );
  }

  const category = categories.find((item) => item.id === work.categoryId);
  const client = clients.find((item) => item.id === work.clientId);
  const related = works.filter((item) => item.id !== work.id).slice(0, 3);

  return (
    <>
      <PageHead eyebrow="Кейс" title="История проекта" subtitle="От задачи клиента до результата" />
      <section className="container">
        <div className="article reveal-item">
          <div className="article-cover">
            {work.image ? <img src={work.image} alt={work.title} /> : <div className="image-fallback">{work.title}</div>}
          </div>
          <div className="article-inner">
            <h1 className="article-title">{work.title}</h1>
            <p className="article-meta">
              {formatDate(work.date)} • {client?.name || "Клиент"}
            </p>
            <div className="chip-row" style={{ marginBottom: "1rem" }}>
              <span className="chip">{category?.title || "Без категории"}</span>
              <span className="chip">{client?.industry || "Сфера не указана"}</span>
            </div>
            <div className="article-body">
              <p>
                <strong>Задача:</strong> {work.challenge || "—"}
              </p>
              <p>
                <strong>Решение:</strong> {work.solution || "—"}
              </p>
              <p>
                <strong>Результат:</strong> {work.result || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="section sidebar-card reveal-item">
          <h3>Другие кейсы</h3>
          <div className="chip-row">
            {related.length
              ? related.map((entry) => (
                  <Link className="chip" key={entry.id} to={`/work/${entry.id}`}>
                    {entry.title}
                  </Link>
                ))
              : "Пока нет других кейсов"}
          </div>
        </div>
      </section>
    </>
  );
}

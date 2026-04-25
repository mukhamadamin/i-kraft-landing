import { Link, useParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";
import { EmptyState } from "../components/Cards";

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    state: { products, categories, settings },
  } = useStore();

  const product = products.find((item) => item.id === id);

  if (!product) {
    return (
      <section className="container section">
        <EmptyState text="Продукт не найден." />
      </section>
    );
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const related = products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 3);

  return (
    <>
      <PageHead eyebrow="Карточка" title="Детали продукта" subtitle="Информация о характеристиках и тираже." />
      <section className="container">
        <div className="article reveal-item">
          <div className="article-cover">
            {product.image ? <img src={product.image} alt={product.title} /> : <div className="image-fallback">{product.title}</div>}
          </div>
          <div className="article-inner">
            <h1 className="article-title">{product.title}</h1>
            <p className="article-meta">
              {category?.title || "Без категории"} • {product.minOrder || "Тираж по запросу"}
            </p>
            <div className="article-body">
              <p>{product.description || product.summary}</p>
              <p>
                <strong>Характеристики:</strong> {product.specs || "—"}
              </p>
            </div>
            <div className="chip-row">
              {String(product.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="two-col section">
          <aside className="sidebar-card reveal-item">
            <h3>Связаться по заказу</h3>
            <p>
              <strong>Телефон:</strong> {settings.phone || "-"}
            </p>
            <p>
              <strong>Email:</strong> {settings.email || "-"}
            </p>
            <p>
              <strong>Telegram:</strong> {settings.telegram || "-"}
            </p>
            <Link className="btn" to="/constructor">
              Собрать мокап бренда
            </Link>
          </aside>

          <div className="sidebar-card reveal-item">
            <h3>Похожие позиции</h3>
            <div className="chip-row">
              {related.length
                ? related.map((item) => (
                    <Link className="chip" key={item.id} to={`/product/${item.id}`}>
                      {item.title}
                    </Link>
                  ))
                : "Пока нет похожих позиций"}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

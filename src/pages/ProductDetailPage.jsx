import { Link, useParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";
import { EmptyState } from "../components/Cards";
import { Reveal } from "../components/motion";

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
        <p style={{ textAlign: "center", marginTop: "1.2rem" }}>
          <Link className="btn btn-secondary" to="/catalog">
            В каталог
          </Link>
        </p>
      </section>
    );
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const related = products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 3);

  return (
    <>
      <PageHead eyebrow="Карточка" title="Детали продукта" subtitle="Информация о характеристиках и тираже." />
      <section className="container">
        <Reveal className="article" variant="blur">
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
        </Reveal>

        <div className="two-col section">
          <Reveal as="aside" className="sidebar-card" delay={80}>
            <h3>Связаться по заказу</h3>
            {settings.phone ? (
              <p>
                <strong>Телефон:</strong> {settings.phone}
              </p>
            ) : null}
            {settings.email ? (
              <p>
                <strong>Email:</strong> {settings.email}
              </p>
            ) : null}
            {settings.telegram ? (
              <p>
                <strong>Telegram:</strong>{" "}
                <a href={`https://t.me/${String(settings.telegram).replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                  {settings.telegram}
                </a>
              </p>
            ) : null}
            {settings.address ? (
              <p>
                <strong>Адрес:</strong> {settings.address}
              </p>
            ) : null}
            <Link className="btn" to="/constructor">
              Собрать мокап бренда
            </Link>
          </Reveal>

          <Reveal className="sidebar-card" delay={160}>
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
          </Reveal>
        </div>
      </section>
    </>
  );
}

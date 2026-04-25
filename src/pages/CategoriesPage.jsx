import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";
import { EmptyState } from "../components/Cards";

export function CategoriesPage() {
  const {
    state: { categories, products },
  } = useStore();

  const productsCount = products.reduce((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHead eyebrow="Справочник" title="Категории упаковки" subtitle="Разделение ассортимента по направлениям бизнеса." />
      <section className="container section">
        <div className="grid-cards">
          {categories.length ? (
            categories.map((item) => (
              <article className="card reveal-item" key={item.id}>
                <div className="card-media">
                  {item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <div className="image-fallback">{item.title}</div>}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-text">{item.description}</p>
                  <div className="card-actions">
                    <span className="chip">Позиции: {productsCount[item.id] || 0}</span>
                    <Link className="card-link" to={`/catalog?category=${item.id}`}>
                      Открыть каталог
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState text="Категории пока не добавлены." />
          )}
        </div>
      </section>
    </>
  );
}

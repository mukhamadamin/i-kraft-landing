import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { ProductCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";
import { Stagger } from "../components/motion";

export function CatalogPage() {
  const [params] = useSearchParams();
  const selected = params.get("category") || "all";

  const {
    state: { products, categories },
  } = useStore();

  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item]));

  const filtered = products.filter((item) => {
    if (selected === "all") return true;
    const category = categoryMap[item.categoryId];
    return item.categoryId === selected || category?.slug === selected;
  });

  return (
    <>
      <PageHead
        eyebrow="Каталог"
        title="Продукция по категориям"
        subtitle={`Найдено позиций: ${filtered.length}`}
      >
        <div className="chip-row">
          <Link className={`chip ${selected === "all" ? "is-active" : ""}`} to="/catalog?category=all">
            Все
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              className={`chip ${selected === item.id || selected === item.slug ? "is-active" : ""}`}
              to={`/catalog?category=${item.id}`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </PageHead>

      <section className="container section">
        <Stagger className="grid-cards" step={90} key={selected}>
          {filtered.length ? filtered.map((item) => <ProductCard key={item.id} item={item} categoryName={categoryMap[item.categoryId]?.title} />) : <EmptyState text="По выбранной категории товаров не найдено." />}
        </Stagger>
      </section>
    </>
  );
}

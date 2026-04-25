import { useStore } from "../store/StoreContext";
import { ProductCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";

export function ProductsPage() {
  const {
    state: { products, categories },
  } = useStore();

  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item.title]));

  return (
    <>
      <PageHead
        eyebrow="Ассортимент"
        title="Продукция"
        subtitle={`Все товарные позиции с быстрым переходом в карточку. Всего: ${products.length}`}
      />
      <section className="container section">
        <div className="grid-cards">
          {products.length ? (
            [...products]
              .sort((a, b) => a.title.localeCompare(b.title, "ru"))
              .map((item) => <ProductCard key={item.id} item={item} categoryName={categoryMap[item.categoryId]} />)
          ) : (
            <EmptyState text="Продукция пока не добавлена." />
          )}
        </div>
      </section>
    </>
  );
}

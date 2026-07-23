import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";
import { CategoryCard, EmptyState } from "../components/Cards";
import { Stagger } from "../components/motion";

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
      <PageHead
        eyebrow="Справочник"
        title="Категории упаковки"
        subtitle="Разделение ассортимента по направлениям бизнеса."
      />
      <section className="container section">
        <Stagger className="grid-cards" step={90}>
          {categories.length ? (
            categories.map((item) => (
              <CategoryCard key={item.id} item={item} count={productsCount[item.id] || 0} />
            ))
          ) : (
            <EmptyState text="Категории пока не добавлены." />
          )}
        </Stagger>
      </section>
    </>
  );
}

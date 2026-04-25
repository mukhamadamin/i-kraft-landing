import { useStore } from "../store/StoreContext";
import { ArticleCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";

export function NewsPage() {
  const {
    state: { news },
  } = useStore();

  return (
    <>
      <PageHead eyebrow="Медиа" title="Новости компании" subtitle="Обновления производства и события бренда." />
      <section className="container section">
        <div className="grid-cards">
          {news.length ? [...news].sort((a, b) => (a.date < b.date ? 1 : -1)).map((item) => <ArticleCard key={item.id} item={item} type="news" />) : <EmptyState text="Новостей пока нет." />}
        </div>
      </section>
    </>
  );
}

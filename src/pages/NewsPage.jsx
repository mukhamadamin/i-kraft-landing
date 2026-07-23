import { useStore } from "../store/StoreContext";
import { ArticleCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";
import { Stagger } from "../components/motion";

export function NewsPage() {
  const {
    state: { news },
  } = useStore();

  return (
    <>
      <PageHead eyebrow="Медиа" title="Новости компании" subtitle="Обновления производства и события бренда." />
      <section className="container section">
        <Stagger className="grid-cards" step={90}>
          {news.length ? [...news].sort((a, b) => (a.date < b.date ? 1 : -1)).map((item) => <ArticleCard key={item.id} item={item} type="news" />) : <EmptyState text="Новостей пока нет." />}
        </Stagger>
      </section>
    </>
  );
}

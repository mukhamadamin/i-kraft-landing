import { useStore } from "../store/StoreContext";
import { ArticleCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";
import { Stagger } from "../components/motion";

export function PostsPage() {
  const {
    state: { posts },
  } = useStore();

  return (
    <>
      <PageHead eyebrow="Блог" title="Посты и экспертные материалы" subtitle="Практика брендинга упаковки и оптимизация себестоимости." />
      <section className="container section">
        <Stagger className="grid-cards" step={90}>
          {posts.length ? [...posts].sort((a, b) => (a.date < b.date ? 1 : -1)).map((item) => <ArticleCard key={item.id} item={item} type="posts" />) : <EmptyState text="Постов пока нет." />}
        </Stagger>
      </section>
    </>
  );
}

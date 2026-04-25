import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { WorkCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";

export function WorksPage() {
  const [params] = useSearchParams();
  const selected = params.get("category") || "all";

  const {
    state: { works, categories, clients },
  } = useStore();

  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item]));
  const clientMap = Object.fromEntries(clients.map((item) => [item.id, item]));

  const filtered = works
    .filter((item) => {
      if (selected === "all") return true;
      const category = categoryMap[item.categoryId];
      return item.categoryId === selected || category?.slug === selected;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <PageHead eyebrow="Кейсы" title="Наши работы" subtitle="Реальные проекты: задача, решение и результат.">
        <div className="chip-row">
          <Link className={`chip ${selected === "all" ? "is-active" : ""}`} to="/works?category=all">
            Все
          </Link>
          {categories.map((item) => (
            <Link key={item.id} className={`chip ${selected === item.id || selected === item.slug ? "is-active" : ""}`} to={`/works?category=${item.id}`}>
              {item.title}
            </Link>
          ))}
        </div>
      </PageHead>

      <section className="container section">
        <div className="grid-cards">
          {filtered.length ? filtered.map((item) => <WorkCard key={item.id} item={item} clientName={clientMap[item.clientId]?.name} categoryName={categoryMap[item.categoryId]?.title} />) : <EmptyState text="По выбранному фильтру кейсов нет." />}
        </div>
      </section>
    </>
  );
}

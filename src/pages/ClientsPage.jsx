import { useStore } from "../store/StoreContext";
import { ClientCard, EmptyState } from "../components/Cards";
import { PageHead } from "../components/PageHead";

export function ClientsPage() {
  const {
    state: { clients, works },
  } = useStore();

  const worksCount = works.reduce((acc, item) => {
    acc[item.clientId] = (acc[item.clientId] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHead eyebrow="Портфель" title="Наши клиенты" subtitle="С кем мы работаем: сетевые проекты и локальные бренды." />
      <section className="container section">
        <div className="grid-cards">
          {clients.length ? clients.map((item) => <ClientCard key={item.id} item={item} worksCount={worksCount[item.id] || 0} />) : <EmptyState text="Клиентов пока нет." />}
        </div>
      </section>
    </>
  );
}

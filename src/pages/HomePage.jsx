import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { ArticleCard, ProductCard, WorkCard, EmptyState } from "../components/Cards";
import { SectionHead } from "../components/PageHead";

const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconGrid = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconAward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconBag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconPrint = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const IconFries = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v6M12 2v6M16 2v6"/>
    <path d="M5 8h14l-2 14H7L5 8z"/>
  </svg>
);

const IconDiamond = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 0L12 6L6 12L0 6Z"/>
  </svg>
);

function PartnersMarquee({ clients }) {
  if (!clients.length) return null;
  const items = [...clients, ...clients, ...clients];

  return (
    <section className="partners-section container">
      <SectionHead eyebrow="Партнёры" title="Нам доверяют" />
      <div className="marquee-wrap">
        <div className="marquee-track">
          {items.map((item, i) => (
            <div className="marquee-item" key={i}>
              {item.logo ? (
                <img src={item.logo} alt={item.name} className="marquee-logo-img" />
              ) : (
                <span className="marquee-logo-badge">{item.name.charAt(0)}</span>
              )}
              <span className="marquee-item-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const {
    state: { settings, categories, products, news, clients, works },
  } = useStore();

  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item.title]));
  const clientMap = Object.fromEntries(clients.map((item) => [item.id, item.name]));

  return (
    <>
      <section className="hero container reveal-item">
        <div>
          <p className="eyebrow"><IconDiamond /> Производство крафтовых пакетов</p>
          <h1>{settings.heroTitle}</h1>
          <p>{settings.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn" to="/constructor">
              Открыть конструктор →
            </Link>
            <Link className="btn btn-secondary" to="/catalog">
              Смотреть каталог
            </Link>
          </div>
          <div className="info-strip">
            <div className="info-cell">
              <span className="info-cell-icon"><IconPackage /></span>
              <b>{products.length}</b>
              <span>Товаров в каталоге</span>
            </div>
            <div className="info-cell">
              <span className="info-cell-icon"><IconGrid /></span>
              <b>{categories.length}</b>
              <span>Категорий</span>
            </div>
            <div className="info-cell">
              <span className="info-cell-icon"><IconUsers /></span>
              <b>{clients.length}</b>
              <span>Клиентов</span>
            </div>
            <div className="info-cell">
              <span className="info-cell-icon"><IconAward /></span>
              <b>{works.length}</b>
              <span>Кейсов</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-bg-blob" />
          <div className="float-card float-card-a">
            <span className="float-card-icon"><IconBag /></span>
            <small>Крафт-пакеты</small>
            <strong>С кручеными ручками</strong>
            <span className="float-card-tag">Наше производство</span>
          </div>
          <div className="float-card float-card-b">
            <span className="float-card-icon"><IconPrint /></span>
            <small>Фирменная печать</small>
            <strong>Логотип до 3 цветов</strong>
            <span className="float-card-tag">Брендинг</span>
          </div>
          <div className="float-card float-card-c">
            <span className="float-card-icon"><IconFries /></span>
            <small>Фастфуд-серия</small>
            <strong>Бургер · Лаваш · Фри</strong>
            <span className="float-card-tag">Быстрая печать</span>
          </div>
        </div>
      </section>

      <PartnersMarquee clients={clients} />

      <section className="section container">
        <SectionHead eyebrow="Продукция" title="Популярные позиции" link={{ to: "/catalog", label: "Весь каталог" }} />
        <div className="grid-cards">
          {products.slice(0, 3).map((item) => (
            <ProductCard key={item.id} item={item} categoryName={categoryMap[item.categoryId]} />
          ))}
          {!products.length && <EmptyState text="Товары можно добавить в панели управления." />}
        </div>
      </section>

      <section className="section container">
        <SectionHead eyebrow="Новости" title="Последние обновления" link={{ to: "/news", label: "Все новости" }} />
        <div className="grid-cards">
          {news.length
            ? news.slice(0, 3).map((item) => <ArticleCard key={item.id} item={item} type="news" />)
            : <EmptyState text="Новостей пока нет." />}
        </div>
      </section>

      <section className="section container">
        <SectionHead eyebrow="Кейсы" title="Наши работы" link={{ to: "/works", label: "Все работы" }} />
        <div className="grid-cards">
          {works.length
            ? works.slice(0, 3).map((item) => (
                <WorkCard key={item.id} item={item} clientName={clientMap[item.clientId]} categoryName={categoryMap[item.categoryId]} />
              ))
            : <EmptyState text="Кейсов пока нет." />}
        </div>
      </section>
    </>
  );
}

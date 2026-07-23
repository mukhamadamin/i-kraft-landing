import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { kraftLogo } from "../assets";
import { Magnetic, Reveal } from "./motion";

const featuredLinks = [
  { to: "/", label: "Главная" },
  { to: "/products", label: "Продукция" },
  { to: "/catalog", label: "Каталог" },
  { to: "/news", label: "Новости" },
  { to: "/works", label: "Наши работы" },
  { to: "/constructor", label: "Конструктор" },
];

const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-8c.4-.3-.1-.5-.6-.2L5.7 13.1 1 11.6c-1-.3-1-1 .2-1.5l19.2-7.4c.9-.3 1.6.2 1.5 1.6Z" />
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);

export function Footer() {
  const {
    state: { settings, categories },
  } = useStore();

  const year = new Date().getFullYear();
  const phoneHref = String(settings.phone || "").replace(/[^\d+]/g, "");
  const email = settings.email || "sales@ikraftpack.uz";
  const telegram = String(settings.telegram || "").replace(/^@/, "");

  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <Reveal variant="blur" className="footer-hero noise-card">
          <p className="eyebrow">Готовы обсудить тираж</p>
          <h4>
            Ваш бренд <span className="text-grad">на крафте</span> — уже через 10 дней
          </h4>
          <p>
            Пришлите логотип и формат — вернёмся с макетом, расчётом себестоимости и сроком
            производства.
          </p>
          <div className="footer-cta-row">
            <Magnetic strength={0.25}>
              <Link to="/constructor" className="btn">
                Собрать дизайн
                <span className="btn-arrow">→</span>
              </Link>
            </Magnetic>
            <a className="btn btn-secondary" href={`mailto:${email}`}>
              Написать в отдел продаж
            </a>
          </div>
        </Reveal>

        <div className="footer-columns">
          <div className="footer-brand-col">
            <Link to="/" className="brand">
              <img src={kraftLogo} alt="" className="brand-logo-img" />
              <span className="brand-stack">
                <span className="brand-name">{settings.companyName || "I-Kraft-Pack"}</span>
                <span className="brand-sub">{settings.slogan || "Крафтовая упаковка"}</span>
              </span>
            </Link>
            <p>
              Собственное производство бумажных пакетов и упаковки с фирменной печатью до 3 цветов.
            </p>
            <div className="footer-socials">
              {telegram ? (
                <a
                  className="footer-social"
                  href={`https://t.me/${telegram}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <IconTelegram />
                </a>
              ) : null}
              <a className="footer-social" href={`mailto:${email}`} aria-label="Email">
                <IconMail />
              </a>
              {phoneHref ? (
                <a className="footer-social" href={`tel:${phoneHref}`} aria-label="Телефон">
                  <IconPhone />
                </a>
              ) : null}
            </div>
          </div>

          <div className="footer-col">
            <h5>Разделы</h5>
            <div className="footer-links">
              {featuredLinks.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h5>Каталог</h5>
            <div className="footer-links">
              {categories.length ? (
                categories.slice(0, 5).map((item) => (
                  <Link key={item.id} to={`/catalog?category=${item.id}`}>
                    {item.title}
                  </Link>
                ))
              ) : (
                <span>Категории можно добавить в панели управления</span>
              )}
            </div>
          </div>

          <div className="footer-col">
            <h5>Контакты</h5>
            <div className="footer-contact">
              <p>
                <span>Телефон</span>
                <a href={`tel:${phoneHref}`}>{settings.phone || "—"}</a>
              </p>
              <p>
                <span>Email</span>
                <a href={`mailto:${email}`}>{email}</a>
              </p>
              <p>
                <span>Адрес</span>
                <b>{settings.address || "—"}</b>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          <span>{settings.companyName || "I-KRAFT-PACK"}</span>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {settings.companyName || "I-Kraft-Pack"}. Все права защищены.
          </p>
          <p>Собственное производство крафтовых пакетов и упаковки с фирменной печатью.</p>
        </div>
      </div>
    </footer>
  );
}

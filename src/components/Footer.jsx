import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { Logo } from "./Logo";
import { Magnetic, Reveal } from "./motion";

const featuredLinks = [
  { to: "/", label: "Главная" },
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

const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
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
  const email = settings.email || "";
  const telegram = String(settings.telegram || "").replace(/^@/, "");
  const channel = String(settings.telegramChannel || "").replace(/^@/, "");
  const instagram = String(settings.instagram || "").replace(/^@/, "");
  /* Основной канал связи: Telegram, если телефона/почты нет */
  const contactHref = telegram ? `https://t.me/${telegram}` : email ? `mailto:${email}` : phoneHref ? `tel:${phoneHref}` : "/constructor";

  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <Reveal variant="blur" className="footer-hero noise-card">
          <p className="eyebrow">Готовы обсудить тираж</p>
          <h4>
            Ваш бренд <span className="text-grad">на крафте</span> — с доставкой по всему Узбекистану
          </h4>
          <p>
            Пришлите логотип и нужный размер — подберём формат, покажем макет и посчитаем
            стоимость тиража.
          </p>
          <div className="footer-cta-row">
            <Magnetic strength={0.25}>
              <Link to="/constructor" className="btn">
                Собрать дизайн
                <span className="btn-arrow">→</span>
              </Link>
            </Magnetic>
            <a className="btn btn-secondary" href={contactHref} target="_blank" rel="noreferrer">
              Написать в Telegram
            </a>
          </div>
        </Reveal>

        <div className="footer-columns">
          <div className="footer-brand-col">
            <Link to="/" className="brand">
              <Logo className="brand-logo-img" />
              <span className="brand-stack">
                <span className="brand-name">{settings.companyName || "I-Kraft Pack"}</span>
                <span className="brand-sub">{settings.slogan || "Крафтовая упаковка"}</span>
              </span>
            </Link>
            <p>
              Собственное производство крафт-пакетов в Самарканде: с ручками и без, натуральный и
              белый крафт, печать логотипа.
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
              {channel ? (
                <a
                  className="footer-social"
                  href={`https://t.me/${channel}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram-канал"
                >
                  <IconTelegram />
                </a>
              ) : null}
              {instagram ? (
                <a
                  className="footer-social"
                  href={`https://instagram.com/${instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <IconInstagram />
                </a>
              ) : null}
              {email ? (
                <a className="footer-social" href={`mailto:${email}`} aria-label="Email">
                  <IconMail />
                </a>
              ) : null}
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
              {settings.phone ? (
                <p>
                  <span>Телефон</span>
                  <a href={`tel:${phoneHref}`}>{settings.phone}</a>
                </p>
              ) : null}
              {telegram ? (
                <p>
                  <span>Telegram</span>
                  <a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer">
                    @{telegram}
                  </a>
                </p>
              ) : null}
              {channel ? (
                <p>
                  <span>Канал</span>
                  <a href={`https://t.me/${channel}`} target="_blank" rel="noreferrer">
                    t.me/{channel}
                  </a>
                </p>
              ) : null}
              {instagram ? (
                <p>
                  <span>Instagram</span>
                  <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">
                    @{instagram}
                  </a>
                </p>
              ) : null}
              {email ? (
                <p>
                  <span>Email</span>
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              ) : null}
              <p>
                <span>Адрес</span>
                <b>{settings.address || "—"}</b>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          <span>{settings.companyName || "I-KRAFT PACK"}</span>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {settings.companyName || "I-Kraft Pack"}. Все права защищены.
          </p>
          <p>Собственное производство крафтовых пакетов и упаковки с фирменной печатью.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";

const allLinks = [
  { to: "/", label: "Главная" },
  { to: "/products", label: "Продукция" },
  { to: "/catalog", label: "Каталог" },
  { to: "/categories", label: "Категории" },
  { to: "/news", label: "Новости" },
  { to: "/posts", label: "Посты" },
  { to: "/clients", label: "Клиенты" },
  { to: "/works", label: "Наши работы" },
  { to: "/constructor", label: "Конструктор" },
];

export function Footer() {
  const {
    state: { settings, categories },
  } = useStore();

  const year = new Date().getFullYear();
  const featuredLinks = allLinks.filter((item) => ["/", "/products", "/catalog", "/news", "/works", "/constructor"].includes(item.to));

  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-hero">
          <p className="eyebrow">Производство крафтовых пакетов</p>
          <h4>{settings.companyName || "I-Kraft-Pack"}</h4>
          <p>{settings.slogan || "Крафтовые пакеты с фирменной печатью под ваш бренд"}</p>
          <div className="footer-cta-row">
            <Link to="/constructor" className="btn">
              Собрать дизайн
            </Link>
            <a className="btn btn-secondary" href={`mailto:${settings.email || "sales@ikraftpack.uz"}`}>
              Написать в отдел продаж
            </a>
          </div>
        </div>

        <div className="footer-columns">
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
                categories.slice(0, 4).map((item) => (
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
                <a href={`tel:${String(settings.phone || "").replace(/[^\d+]/g, "")}`}>{settings.phone || "-"}</a>
              </p>
              <p>
                <span>Email</span>
                <a href={`mailto:${settings.email || "sales@ikraftpack.uz"}`}>{settings.email || "-"}</a>
              </p>
              <p>
                <span>Адрес</span>
                <b>{settings.address || "-"}</b>
              </p>
            </div>
          </div>
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

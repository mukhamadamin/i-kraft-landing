import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../store/StoreContext";

const mainNav = [
  { to: "/", label: "Главная" },
  { to: "/products", label: "Продукция" },
  { to: "/catalog", label: "Каталог" },
  { to: "/news", label: "Новости" },
  { to: "/works", label: "Наши работы" },
  { to: "/constructor", label: "Конструктор" },
];

export function Header() {
  const {
    state: { settings },
  } = useStore();
  const [open, setOpen] = useState(false);

  const phoneHref = useMemo(() => String(settings.phone || "").replace(/[^\d+]/g, ""), [settings.phone]);

  return (
    <header className="site-header">
      <div className="container">
        <div className="nav-shell">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src="/assets/kraft.svg" alt="I-Kraft-Pack" className="brand-logo-img" />
            <span className="brand-stack">
              <span className="brand-name">{settings.companyName || "I-Kraft-Pack"}</span>
              <span className="brand-sub">{settings.slogan || "Крафтовая упаковка"}</span>
            </span>
          </Link>

          <button className="nav-toggle" onClick={() => setOpen((prev) => !prev)} type="button">
            Меню
          </button>

          <nav className={`site-nav ${open ? "is-open" : ""}`}>
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/admin" className="nav-link nav-link-admin" onClick={() => setOpen(false)}>
              Управление
            </Link>
          </nav>

          <div className="nav-meta">
            {settings.phone ? (
              <a className="nav-phone" href={`tel:${phoneHref}`}>
                {settings.phone}
              </a>
            ) : (
              <Link className="nav-phone" to="/constructor">
                Собрать мокап
              </Link>
            )}
            <Link to="/constructor" className="nav-cta">
              Заказать дизайн
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

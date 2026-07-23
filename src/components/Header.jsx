import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { kraftLogo } from "../assets";
import { ThemeToggle } from "../theme";
import { Magnetic } from "./motion";

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

  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const navRef = useRef(null);

  const phoneHref = useMemo(
    () => String(settings.phone || "").replace(/[^\d+]/g, ""),
    [settings.phone],
  );

  /* Шапка уплотняется после первого экрана прокрутки */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  /* Блокируем прокрутку под открытым мобильным меню */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Подсветка-пилюля переезжает к активному разделу */
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const move = () => {
      const active = nav.querySelector(".nav-link.is-active");
      if (!active) {
        nav.style.setProperty("--pill-o", "0");
        return;
      }
      nav.style.setProperty("--pill-x", `${active.offsetLeft}px`);
      nav.style.setProperty("--pill-w", `${active.offsetWidth}px`);
      nav.style.setProperty("--pill-o", "1");
    };

    move();
    window.addEventListener("resize", move);
    const timer = setTimeout(move, 260);

    return () => {
      window.removeEventListener("resize", move);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <header className={`site-header ${stuck ? "is-stuck" : ""}`}>
      <div className="container">
        <div className="nav-shell">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src={kraftLogo} alt="" className="brand-logo-img" />
            <span className="brand-stack">
              <span className="brand-name">{settings.companyName || "I-Kraft-Pack"}</span>
              <span className="brand-sub">{settings.slogan || "Производство крафтовых пакетов"}</span>
            </span>
          </Link>

          <nav className={`site-nav ${open ? "is-open" : ""}`} ref={navRef}>
            <span className="nav-pill" aria-hidden="true" />
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/constructor" className="nav-cta nav-cta-mobile" onClick={() => setOpen(false)}>
              Заказать дизайн
            </Link>
          </nav>

          {/* Переключатель темы вне .nav-meta — остаётся видимым на мобильных */}
          <ThemeToggle className="nav-theme" />

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
            <Magnetic strength={0.22}>
              <Link to="/constructor" className="nav-cta">
                Заказать дизайн
              </Link>
            </Magnetic>
          </div>

          <button
            className={`nav-toggle ${open ? "is-open" : ""}`}
            onClick={() => setOpen((prev) => !prev)}
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { ArticleCard, ProductCard, WorkCard, EmptyState } from "../components/Cards";
import { SectionHead } from "../components/PageHead";
import { KraftBag3D } from "../components/KraftBag3D";
import {
  Counter,
  Magnetic,
  Marquee,
  Parallax,
  Reveal,
  SplitText,
  Stagger,
  Tilt,
  useSectionProgress,
} from "../components/motion";

/* ─── Иконки ──────────────────────────────────────────────────── */

const svg = (props) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

const IconPackage = ({ size = 20 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconGrid = ({ size = 20 }) => (
  <svg width={size} height={size} {...svg()}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconUsers = ({ size = 20 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconAward = ({ size = 20 }) => (
  <svg width={size} height={size} {...svg()}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const IconBag = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconPrint = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconFries = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M8 2v6M12 2v6M16 2v6" />
    <path d="M5 8h14l-2 14H7L5 8z" />
  </svg>
);

const IconLeaf = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6" />
  </svg>
);

const IconBolt = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
);

const IconShield = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconFactory = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="M2 20h20V9l-6 4V9l-6 4V4H4l-2 16Z" />
    <path d="M7 20v-4M12 20v-4M17 20v-4" />
  </svg>
);

const IconRuler = ({ size = 22 }) => (
  <svg width={size} height={size} {...svg()}>
    <path d="m14.6 2.6 6.8 6.8a2 2 0 0 1 0 2.8L11.2 22.4a2 2 0 0 1-2.8 0l-6.8-6.8a2 2 0 0 1 0-2.8L11.8 2.6a2 2 0 0 1 2.8 0Z" />
    <path d="m7 12 2 2M10 9l2 2M13 6l2 2" />
  </svg>
);

const IconCheck = ({ size = 16 }) => (
  <svg width={size} height={size} {...svg({ strokeWidth: "2" })}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSpark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0l2.4 8.2L22 12l-7.6 3.8L12 24l-2.4-8.2L2 12l7.6-3.8L12 0z" />
  </svg>
);

/* ─── Содержимое секций ───────────────────────────────────────── */

const tickerItems = [
  "Производство в Самарканде",
  "Доставка по всему Узбекистану",
  "Натуральный и белый крафт",
  "Кручёные ручки и без ручек",
  "Печать логотипа и полноцвет",
  "Готовые дизайны в наличии",
  "Экологично и современно",
];

/* Высоты столбиков мини-графика «стабильность тиража» */
const barHeights = [34, 52, 44, 68, 58, 86, 62, 74, 48, 90, 56, 96, 66, 84];

const processSteps = [
  {
    no: "Шаг 01",
    title: "Бриф и подбор формата",
    text: "Смотрим на продукт, вес и логистику. Подбираем размер (ширина × боковая × высота), натуральный или белый крафт и тип пакета — с кручеными ручками или без.",
    tags: ["Размеры", "Плотность", "Тип ручек"],
  },
  {
    no: "Шаг 02",
    title: "Макет и цветопроба",
    text: "Раскладываем логотип, контакты и QR-код по лицевой и боковым сторонам. Показываем макет до запуска — вы видите, как бренд ляжет на крафт.",
    tags: ["Дизайн", "Макет", "Согласование"],
  },
  {
    no: "Шаг 03",
    title: "Печать и склейка",
    text: "Печатаем логотип, паттерн или полноцветную заливку, склеиваем и вклеиваем ручки на собственном производстве в Самарканде.",
    tags: ["Печать", "Склейка", "Контроль"],
  },
  {
    no: "Шаг 04",
    title: "Упаковка и отгрузка",
    text: "Пакуем тираж и отправляем по всему Узбекистану. Повторный тираж — по сохранённому макету, без новых согласований.",
    tags: ["Блоки", "Маркировка", "Доставка"],
  },
];

const faqItems = [
  {
    q: "Какой минимальный тираж?",
    a: "Зависит от формата и печати — напишите нам в Telegram размер и примерный объём, и мы посчитаем стоимость. Пакеты без надписей и пакеты «Приятного аппетита» есть в наличии.",
  },
  {
    q: "Какую печать можно сделать?",
    a: "От одноцветного логотипа до полноцветной заливки с паттерном на боковых сторонах — как пакет BBQ Burger. На натуральном крафте хорошо читаются тёмные цвета и белая печать, на белом крафте — любые яркие цвета.",
  },
  {
    q: "Какие размеры бывают?",
    a: "Размер подбираем под продукт. Примеры из наших работ (ширина × боковая × высота): 18×10×27, 18×11×23, 22×12×30, 24×15×32, 27×15×30, 30×18×31, 30×15×40 и 32×12×42 см.",
  },
  {
    q: "Вы работаете только по Самарканду?",
    a: "Производство находится в Самаркандской области (Джамбай), а доставляем по всему Узбекистану. Напишите нам в Telegram — обсудим сроки и доставку в ваш город.",
  },
  {
    q: "Подходит ли упаковка для доставки еды?",
    a: "Да — пакеты без ручек с прямоугольным дном делаем для бургерных, куриного фастфуда и ресторанов: Chicken Eleven, Rich Burger, BBQ Burger, Shirin Tabaka. Пакет устойчиво стоит и выдерживает горячие заказы.",
  },
];

/* ─── Процесс производства ────────────────────────────────────── */

function ProcessSection() {
  const [ref, progress] = useSectionProgress();
  const activeIndex = Math.min(
    processSteps.length - 1,
    Math.floor(progress * processSteps.length + 0.0001),
  );

  return (
    <section className="section container">
      <SectionHead
        eyebrow="Процесс"
        title="Как рождается ваш пакет"
        subtitle="Четыре шага от брифа до паллеты на складе — без сюрпризов в цене и сроках."
      />
      <div className="process" style={{ "--progress": progress }}>
        <div className="process__aside">
          <div className="process__counter">
            {String(activeIndex + 1).padStart(2, "0")}
            <em>/ {String(processSteps.length).padStart(2, "0")}</em>
          </div>
          <div className="process__meter">
            <i />
          </div>
        </div>

        <div className="process__steps" ref={ref}>
          {processSteps.map((step, index) => (
            <Reveal
              key={step.no}
              variant="right"
              delay={index * 60}
              className={`process-step ${index <= activeIndex ? "is-active" : ""}`}
            >
              <span className="process-step__no">{step.no}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <div className="process-step__tags">
                {step.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────────── */

function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section container">
      <SectionHead
        eyebrow="Вопросы"
        title="Коротко о главном"
        subtitle="То, что чаще всего спрашивают до первого тиража."
      />
      <Stagger className="faq" step={60}>
        {faqItems.map((item, index) => (
          <div className={`faq-item ${open === index ? "is-open" : ""}`} key={item.q}>
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpen(open === index ? -1 : index)}
              aria-expanded={open === index}
            >
              {item.q}
              <span className="faq-sign" aria-hidden="true" />
            </button>
            <div className="faq-a">
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* «250+» из настроек → число для анимированного счётчика и суффикс */
function parseStat(value, fallback) {
  const match = String(value ?? "").match(/(\d[\d\s]*)(.*)/);
  if (!match) return { to: fallback, suffix: "" };
  return { to: Number(match[1].replace(/\s/g, "")), suffix: match[2].trim() };
}

/* ─── Главная ─────────────────────────────────────────────────── */

export function HomePage() {
  const {
    state: { settings, categories, products, news, clients, works },
  } = useStore();

  const statClients = parseStat(settings.statClients, clients.length);
  const statWorks = parseStat(settings.statWorks, works.length);

  const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item.title]));
  const clientMap = Object.fromEntries(clients.map((item) => [item.id, item.name]));

  return (
    <>
      {/* ═══ ГЕРОЙ ═══ */}
      <section className="hero container">
        <div className="hero-copy">
          <Reveal as="p" variant="down" className="eyebrow">
            Производство крафтовых пакетов
          </Reveal>

          <h1>
            <SplitText text={settings.heroTitle} step={58} />
          </h1>

          <Reveal as="p" className="hero-lead" delay={220}>
            {settings.heroSubtitle}
          </Reveal>

          <Reveal className="hero-actions" delay={320}>
            <Magnetic strength={0.28}>
              <Link className="btn btn-lg" to="/constructor">
                Открыть конструктор
                <span className="btn-arrow">→</span>
              </Link>
            </Magnetic>
            <Link className="btn btn-secondary btn-lg" to="/catalog">
              Смотреть каталог
            </Link>
          </Reveal>

          <Reveal className="hero-trust" delay={420}>
            <span className="hero-trust-dots">
              {clients.slice(0, 3).map((client) => (
                <i key={client.id}>{client.name.charAt(0)}</i>
              ))}
              <i>+</i>
            </span>
            Сети и локальные бренды уже печатают у нас
          </Reveal>

          <Reveal className="info-strip" delay={500}>
            <div className="info-cell">
              <span className="info-cell-icon">
                <IconPackage />
              </span>
              <b>
                <Counter to={products.length} />
              </b>
              <span>Товаров в каталоге</span>
            </div>
            <div className="info-cell">
              <span className="info-cell-icon">
                <IconGrid />
              </span>
              <b>
                <Counter to={categories.length} />
              </b>
              <span>Категорий</span>
            </div>
            <div className="info-cell">
              <span className="info-cell-icon">
                <IconUsers />
              </span>
              <b>
                <Counter to={statClients.to} suffix={statClients.suffix} />
              </b>
              <span>Клиентов</span>
            </div>
            <div className="info-cell">
              <span className="info-cell-icon">
                <IconAward />
              </span>
              <b>
                <Counter to={statWorks.to} suffix={statWorks.suffix} />
              </b>
              <span>Кейсов</span>
            </div>
          </Reveal>
        </div>

        <Parallax className="hero-visual" speed={0.06}>
          <KraftBag3D brandName={(settings.companyName || "I-KRAFT").toUpperCase()} tagline="PACK · SAMARKAND">
            <div className="float-card float-card-a">
              <span className="float-card-icon">
                <IconBag />
              </span>
              <small>Крафт-пакеты</small>
              <strong>С кручеными ручками</strong>
              <span className="float-card-tag">Наше производство</span>
            </div>
            <div className="float-card float-card-b">
              <span className="float-card-icon">
                <IconPrint />
              </span>
              <small>Фирменная печать</small>
              <strong>Логотип и полноцвет</strong>
              <span className="float-card-tag">Брендинг</span>
            </div>
            <div className="float-card float-card-c">
              <span className="float-card-icon">
                <IconFries />
              </span>
              <small>Доставка</small>
              <strong>По всему Узбекистану</strong>
              <span className="float-card-tag">Из Самарканда</span>
            </div>
          </KraftBag3D>
        </Parallax>
      </section>

      {/* ═══ БЕГУЩАЯ СТРОКА ═══ */}
      <div className="ticker">
        <Marquee speed={30}>
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span className="ticker__item" key={`${item}-${index}`}>
              <IconSpark />
              {item}
            </span>
          ))}
        </Marquee>
      </div>

      {/* ═══ БЕНТО ═══ */}
      <section className="section container">
        <SectionHead
          eyebrow="Почему мы"
          title="Производство, а не посредник"
          subtitle="Своя линия, свой отдел дизайна и контроль качества на каждом прогоне."
        />
        <Stagger className="bento" step={80}>
          <Tilt className="bento-tile bento-tile--wide bento-tile--accent noise-card" max={5}>
            <span className="bento-icon">
              <IconFactory />
            </span>
            <h3>Собственное производство</h3>
            <p>
              Печать, склейка и вклейка ручек — в нашем цехе в Самарканде. Мы не перепродаём чужой
              тираж: вы общаетесь напрямую с производителем.
            </p>
            <div className="bento-metric">
              <b>
                <Counter to={statClients.to} suffix={statClients.suffix} />
              </b>
              <span>брендов уже с нашими пакетами</span>
            </div>
          </Tilt>

          <Tilt className="bento-tile bento-tile--tall noise-card" max={5}>
            <span className="bento-icon">
              <IconPrint />
            </span>
            <h3>Печать под ваш бренд</h3>
            <p>Логотип, паттерн или полноцветная заливка — на натуральном или белом крафте.</p>
            <div className="bento-print" aria-hidden="true">
              <i />
              <i />
              <i />
              <span className="bento-print__reg" />
            </div>
            <div className="bento-swatches">
              <i style={{ background: "linear-gradient(135deg,#2b332c,#0f1411)" }} />
              <i style={{ background: "linear-gradient(135deg,#a9d0bd,#4b7e66)" }} />
              <i style={{ background: "linear-gradient(135deg,#f2cea6,#a97243)" }} />
            </div>
          </Tilt>

          <Tilt className="bento-tile noise-card" max={5}>
            <span className="bento-icon">
              <IconBolt />
            </span>
            <h3>Макет до печати</h3>
            <p>Присылаете логотип — показываем, как он ляжет на пакет, и считаем тираж.</p>
          </Tilt>

          <Tilt className="bento-tile noise-card" max={5}>
            <span className="bento-icon">
              <IconLeaf />
            </span>
            <h3>Экологично</h3>
            <p>Бумага вместо пластика: с 2027 года в Узбекистане пластиковые пакеты под запретом.</p>
          </Tilt>

          <Tilt className="bento-tile bento-tile--wide noise-card" max={5}>
            <span className="bento-icon">
              <IconRuler />
            </span>
            <h3>Стабильность от партии к партии</h3>
            <p>
              Сохраняем макет и профиль цвета: повторный тираж выходит таким же, как первый — без
              новых согласований.
            </p>
            <div className="bento-layers" aria-hidden="true">
              {barHeights.map((height, index) => (
                <i
                  key={index}
                  className={height >= 84 ? "is-accent" : ""}
                  style={{ height: `${height}%`, animationDelay: `${index * -0.18}s` }}
                />
              ))}
            </div>
          </Tilt>

          <Tilt className="bento-tile noise-card" max={5}>
            <span className="bento-icon">
              <IconShield />
            </span>
            <h3>Контроль качества</h3>
            <p>Проверка геометрии шва и прочности ручек на каждом прогоне.</p>
          </Tilt>
        </Stagger>
      </section>

      {/* ═══ ПРОДУКЦИЯ ═══ */}
      <section className="section container">
        <SectionHead
          eyebrow="Продукция"
          title="Популярные позиции"
          link={{ to: "/catalog", label: "Весь каталог" }}
        />
        <Stagger className="grid-cards" step={90}>
          {products.slice(0, 3).map((item) => (
            <ProductCard key={item.id} item={item} categoryName={categoryMap[item.categoryId]} />
          ))}
          {!products.length && <EmptyState text="Товары можно добавить в панели управления." />}
        </Stagger>
      </section>

      <ProcessSection />

      {/* ═══ ЦИФРЫ ═══ */}
      <section className="section-tight container">
        <Reveal variant="zoom" className="stats-band">
          <div className="stat-cell">
            <b>
              <Counter to={statClients.to} suffix={statClients.suffix} />
            </b>
            <strong>Клиентов</strong>
            <span>Рестораны, магазины, доставка и подарки</span>
          </div>
          <div className="stat-cell">
            <b>
              <Counter to={statWorks.to} suffix={statWorks.suffix} />
            </b>
            <strong>Кейсов</strong>
            <span>Пакетов с логотипом, которые уже в руках покупателей</span>
          </div>
          <div className="stat-cell">
            <b>
              <Counter to={8} suffix="+" />
            </b>
            <strong>Размеров</strong>
            <span>От 18×10×27 до 32×12×42 см и под заказ</span>
          </div>
          <div className="stat-cell">
            <b>
              <Counter to={14} />
            </b>
            <strong>Регионов</strong>
            <span>Доставка по всему Узбекистану</span>
          </div>
        </Reveal>
      </section>

      {/* ═══ НОВОСТИ ═══ */}
      <section className="section container">
        <SectionHead
          eyebrow="Новости"
          title="Последние обновления"
          link={{ to: "/news", label: "Все новости" }}
        />
        <Stagger className="grid-cards" step={90}>
          {news.length ? (
            news.slice(0, 3).map((item) => <ArticleCard key={item.id} item={item} type="news" />)
          ) : (
            <EmptyState text="Новостей пока нет." />
          )}
        </Stagger>
      </section>

      {/* ═══ КЕЙСЫ ═══ */}
      <section className="section container">
        <SectionHead
          eyebrow="Кейсы"
          title="Наши работы"
          link={{ to: "/works", label: "Все работы" }}
        />
        <Stagger className="grid-cards" step={90}>
          {works.length ? (
            works
              .slice(0, 3)
              .map((item) => (
                <WorkCard
                  key={item.id}
                  item={item}
                  clientName={clientMap[item.clientId]}
                  categoryName={categoryMap[item.categoryId]}
                />
              ))
          ) : (
            <EmptyState text="Кейсов пока нет." />
          )}
        </Stagger>
      </section>

      <FaqSection />

      {/* ═══ ФИНАЛЬНЫЙ CTA ═══ */}
      <section className="section container">
        <Reveal variant="zoom" className="cta-panel noise-card">
          <p className="eyebrow">Обсудим ваш тираж</p>
          <h2>
            Соберите свой пакет <span className="text-grad">прямо сейчас</span>
          </h2>
          <p>
            Конструктор покажет, как логотип ляжет на крафт, а мы посчитаем стоимость под ваш
            размер и тираж.
          </p>
          <div className="cta-actions">
            <Magnetic strength={0.3}>
              <Link className="btn btn-lg" to="/constructor">
                Открыть конструктор
                <span className="btn-arrow">→</span>
              </Link>
            </Magnetic>
            {settings.phone ? (
              <a className="btn btn-secondary btn-lg" href={`tel:${String(settings.phone).replace(/[^\d+]/g, "")}`}>
                {settings.phone}
              </a>
            ) : (
              <a
                className="btn btn-secondary btn-lg"
                href={`https://t.me/${String(settings.telegram || "").replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Написать в Telegram
              </a>
            )}
          </div>
          <div className="cta-note">
            <span>
              <IconCheck /> Макет до печати
            </span>
            <span>
              <IconCheck /> Готовые дизайны в наличии
            </span>
            <span>
              <IconCheck /> Доставка по Узбекистану
            </span>
          </div>
        </Reveal>
      </section>
    </>
  );
}

(function () {
  const navItems = [
    { href: "index.html", label: "Главная" },
    { href: "products.html", label: "Продукция" },
    { href: "catalog.html", label: "Каталог" },
    { href: "news.html", label: "Новости" },
    { href: "works.html", label: "Наши работы" },
    { href: "constructor.html", label: "Конструктор" },
  ];

  const footerItems = [
    { href: "index.html", label: "Главная" },
    { href: "products.html", label: "Продукция" },
    { href: "catalog.html", label: "Каталог" },
    { href: "categories.html", label: "Категории" },
    { href: "news.html", label: "Новости" },
    { href: "posts.html", label: "Посты" },
    { href: "clients.html", label: "Клиенты" },
    { href: "works.html", label: "Наши работы" },
    { href: "constructor.html", label: "Конструктор" },
  ];

  function getCurrentFile() {
    const path = window.location.pathname.replace(/\\/g, "/");
    const file = path.split("/").pop();
    return file || "index.html";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function nl2br(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
  }

  function getQuery(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function renderHeader() {
    const holder = document.querySelector("[data-site-header]");
    if (!holder) return;

    const settings = window.KraftStore ? window.KraftStore.getState().settings : { companyName: "KraftVision" };
    const current = getCurrentFile();
    const phoneRaw = String(settings.phone || "").trim();
    const phoneHref = phoneRaw.replace(/[^\d+]/g, "");

    const links = navItems
      .map((item) => {
        const active = item.href === current ? "is-active" : "";
        return `<a class="nav-link ${active}" href="${item.href}">${item.label}</a>`;
      })
      .join("");

    holder.innerHTML = `
      <header class="site-header">
        <div class="container">
          <div class="nav-shell">
            <a class="brand" href="index.html">
              <span class="brand-mark">KV</span>
              <span class="brand-stack">
                <span class="brand-name">${escapeHtml(settings.companyName || "KraftVision")}</span>
                <span class="brand-sub">${escapeHtml(settings.slogan || "Крафтовая упаковка")}</span>
              </span>
            </a>

            <button class="nav-toggle" id="navToggle" aria-label="Открыть меню">Меню</button>

            <nav class="site-nav" id="siteNav">
              ${links}
              <a class="nav-link nav-link-admin" href="admin.html">Управление</a>
            </nav>

            <div class="nav-meta">
              ${
                phoneRaw
                  ? `<a class="nav-phone" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(phoneRaw)}</a>`
                  : `<a class="nav-phone" href="constructor.html">Собрать мокап</a>`
              }
              <a class="nav-cta" href="constructor.html">Заказать дизайн</a>
            </div>
          </div>
        </div>
      </header>
    `;

    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", function () {
          nav.classList.remove("is-open");
        });
      });
    }
  }

  function renderFooter() {
    const holder = document.querySelector("[data-site-footer]");
    if (!holder) return;

    const state = window.KraftStore ? window.KraftStore.getState() : { settings: {}, categories: [] };
    const settings = state.settings || {};
    const categories = Array.isArray(state.categories) ? state.categories.slice(0, 4) : [];
    const year = new Date().getFullYear();
    const footerPhone = String(settings.phone || "").trim();
    const footerPhoneHref = footerPhone ? `tel:${footerPhone.replace(/[^\d+]/g, "")}` : "#";

    const quickLinks = footerItems
      .filter((item) => ["index.html", "products.html", "catalog.html", "works.html", "constructor.html", "news.html"].includes(item.href))
      .map((item) => `<a href="${item.href}">${escapeHtml(item.label)}</a>`)
      .join("") + `<a href="admin.html">Панель управления</a>`;

    const categoryLinks = categories.length
      ? categories
          .map(
            (category) =>
              `<a href="catalog.html?category=${encodeURIComponent(category.id)}">${escapeHtml(category.title)}</a>`,
          )
          .join("")
      : `<span>Категории можно добавить в разделе управления</span>`;

    holder.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-shell">
          <div class="footer-hero">
            <p class="eyebrow">KraftVision Production</p>
            <h4>${escapeHtml(settings.companyName || "KraftVision")}</h4>
            <p>${escapeHtml(settings.slogan || "Крафтовая упаковка, которая продает ваш бренд")}</p>
            <div class="footer-cta-row">
              <a class="btn" href="constructor.html">Собрать дизайн</a>
              <a class="btn btn-secondary" href="mailto:${escapeHtml(settings.email || "sales@kraftvision.uz")}">Написать в отдел продаж</a>
            </div>
          </div>

          <div class="footer-columns">
            <div class="footer-col">
              <h5>Разделы</h5>
              <div class="footer-links">
                ${quickLinks}
              </div>
            </div>

            <div class="footer-col">
              <h5>Каталог</h5>
              <div class="footer-links">
                ${categoryLinks}
              </div>
            </div>

            <div class="footer-col">
              <h5>Контакты</h5>
              <div class="footer-contact">
                <p><span>Телефон</span><a href="${escapeHtml(footerPhoneHref)}">${escapeHtml(settings.phone || "-")}</a></p>
                <p><span>Email</span><a href="mailto:${escapeHtml(settings.email || "sales@kraftvision.uz")}">${escapeHtml(settings.email || "-")}</a></p>
                <p><span>Адрес</span><b>${escapeHtml(settings.address || "-")}</b></p>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <p>© ${year} ${escapeHtml(settings.companyName || "KraftVision")}. Все права защищены.</p>
            <p>Производство крафтовой упаковки для лаваша, бургеров и фри.</p>
          </div>
        </div>
      </footer>
    `;
  }

  function initReveal() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!revealItems.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function cardImage(url, alt) {
    const safeAlt = escapeHtml(alt || "image");
    const safeUrl = escapeHtml(url || "");
    if (!safeUrl) {
      return `<div class="image-fallback">${safeAlt}</div>`;
    }
    return `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy" />`;
  }

  function paragraphize(text) {
    return String(text || "")
      .split("\n")
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  }

  window.KraftUI = {
    getCurrentFile,
    formatDate,
    escapeHtml,
    nl2br,
    getQuery,
    cardImage,
    paragraphize,
    initReveal,
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    initReveal();
  });
})();

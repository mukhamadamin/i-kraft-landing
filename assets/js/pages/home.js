(function () {
  function renderHome() {
    const state = window.KraftStore.getState();
    const settings = state.settings;

    const heroTitle = document.getElementById("heroTitle");
    const heroSubtitle = document.getElementById("heroSubtitle");
    if (heroTitle) heroTitle.textContent = settings.heroTitle || "";
    if (heroSubtitle) heroSubtitle.textContent = settings.heroSubtitle || "";

    const statsHost = document.getElementById("homeStats");
    if (statsHost) {
      statsHost.innerHTML = `
        <div class="info-cell"><b>${state.products.length}</b><span>Продуктов в каталоге</span></div>
        <div class="info-cell"><b>${state.categories.length}</b><span>Категорий упаковки</span></div>
        <div class="info-cell"><b>${state.clients.length}</b><span>Клиентов в портфеле</span></div>
        <div class="info-cell"><b>${state.works.length}</b><span>Реализованных кейсов</span></div>
      `;
    }

    const categoryById = Object.fromEntries(state.categories.map((cat) => [cat.id, cat.title]));

    const productsHost = document.getElementById("homeProducts");
    if (productsHost) {
      const featured = state.products.slice(0, 3);
      productsHost.innerHTML = featured.length
        ? featured
            .map((item) => window.KraftRenderers.productCard(item, categoryById[item.categoryId]))
            .join("")
        : window.KraftRenderers.emptyState("Добавьте продукцию через страницу управления.");
    }

    const newsHost = document.getElementById("homeNews");
    if (newsHost) {
      const news = [...state.news].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
      newsHost.innerHTML = news.length
        ? news.map((item) => window.KraftRenderers.articleCard(item, "news")).join("")
        : window.KraftRenderers.emptyState("Новостей пока нет.");
    }

    const clientsById = Object.fromEntries(state.clients.map((client) => [client.id, client.name]));
    const worksHost = document.getElementById("homeWorks");
    if (worksHost) {
      const works = [...state.works].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
      worksHost.innerHTML = works.length
        ? works
            .map((work) => window.KraftRenderers.workCard(work, clientsById[work.clientId], categoryById[work.categoryId]))
            .join("")
        : window.KraftRenderers.emptyState("Добавьте кейсы в раздел «Наши работы».");
    }

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderHome);
})();

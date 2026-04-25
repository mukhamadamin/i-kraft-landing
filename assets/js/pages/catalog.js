(function () {
  function renderCatalog() {
    const state = window.KraftStore.getState();
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("category") || "all";

    const categoryById = Object.fromEntries(state.categories.map((cat) => [cat.id, cat]));

    const chipsHost = document.getElementById("categoryChips");
    if (chipsHost) {
      const chips = [
        `<a class="chip ${selected === "all" ? "is-active" : ""}" href="catalog.html?category=all">Все</a>`,
        ...state.categories.map((cat) => {
          const active = selected === cat.id || selected === cat.slug;
          return `<a class="chip ${active ? "is-active" : ""}" href="catalog.html?category=${encodeURIComponent(cat.id)}">${window.KraftUI.escapeHtml(cat.title)}</a>`;
        }),
      ];
      chipsHost.innerHTML = chips.join("");
    }

    const filtered = state.products.filter((product) => {
      if (selected === "all") return true;
      const category = categoryById[product.categoryId];
      return product.categoryId === selected || (category && category.slug === selected);
    });

    const grid = document.getElementById("productsGrid");
    if (grid) {
      grid.innerHTML = filtered.length
        ? filtered
            .map((item) => window.KraftRenderers.productCard(item, (categoryById[item.categoryId] || {}).title))
            .join("")
        : window.KraftRenderers.emptyState("По выбранной категории пока нет продукции.");
    }

    const count = document.getElementById("catalogCount");
    if (count) {
      count.textContent = `Найдено позиций: ${filtered.length}`;
    }

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderCatalog);
})();

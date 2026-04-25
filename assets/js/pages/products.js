(function () {
  function renderProducts() {
    const state = window.KraftStore.getState();
    const host = document.getElementById("productsOnlyGrid");
    if (!host) return;

    const categoryById = Object.fromEntries(state.categories.map((cat) => [cat.id, cat.title]));
    const products = [...state.products].sort((a, b) => String(a.title).localeCompare(String(b.title), "ru"));

    host.innerHTML = products.length
      ? products.map((item) => window.KraftRenderers.productCard(item, categoryById[item.categoryId])).join("")
      : window.KraftRenderers.emptyState("Продукция пока не добавлена.");

    const count = document.getElementById("productsOnlyCount");
    if (count) count.textContent = `Всего товаров: ${products.length}`;

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderProducts);
})();

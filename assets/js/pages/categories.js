(function () {
  function renderCategories() {
    const state = window.KraftStore.getState();
    const grid = document.getElementById("categoriesGrid");
    if (!grid) return;

    const countByCategory = state.products.reduce((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
      return acc;
    }, {});

    if (!state.categories.length) {
      grid.innerHTML = window.KraftRenderers.emptyState("Категории пока не добавлены.");
      return;
    }

    grid.innerHTML = state.categories
      .map((category) => {
        const image = window.KraftUI.cardImage(category.image, category.title);
        return `
          <article class="card reveal">
            <div class="card-media">${image}</div>
            <div class="card-body">
              <h3 class="card-title">${window.KraftUI.escapeHtml(category.title)}</h3>
              <p class="card-text">${window.KraftUI.escapeHtml(category.description || "")}</p>
              <div class="card-actions">
                <span class="chip">Позиции: ${countByCategory[category.id] || 0}</span>
                <a class="card-link" href="catalog.html?category=${encodeURIComponent(category.id)}">Открыть каталог</a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderCategories);
})();

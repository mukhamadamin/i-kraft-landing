(function () {
  function renderProductDetail() {
    const id = window.KraftUI.getQuery("id");
    const host = document.getElementById("productDetail");
    if (!host) return;

    if (!id) {
      host.innerHTML = window.KraftRenderers.emptyState("Не передан идентификатор продукта.");
      return;
    }

    const state = window.KraftStore.getState();
    const product = state.products.find((item) => item.id === id);
    if (!product) {
      host.innerHTML = window.KraftRenderers.emptyState("Продукт не найден.");
      return;
    }

    const category = state.categories.find((item) => item.id === product.categoryId);
    const related = state.products
      .filter((item) => item.id !== product.id && item.categoryId === product.categoryId)
      .slice(0, 3);

    const settings = state.settings;

    host.innerHTML = `
      <div class="article reveal">
        <div class="article-cover">${window.KraftUI.cardImage(product.image, product.title)}</div>
        <div class="article-inner">
          <h1 class="article-title">${window.KraftUI.escapeHtml(product.title)}</h1>
          <p class="article-meta">${window.KraftUI.escapeHtml((category || {}).title || "Без категории")} • ${window.KraftUI.escapeHtml(product.minOrder || "Тираж по запросу")}</p>
          <div class="article-body">
            <p>${window.KraftUI.escapeHtml(product.description || product.summary || "")}</p>
            <p><strong>Характеристики:</strong> ${window.KraftUI.escapeHtml(product.specs || "")}</p>
          </div>
          <div class="chip-row">
            ${(product.tags || "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => `<span class="chip">${window.KraftUI.escapeHtml(tag)}</span>`)
              .join("")}
          </div>
        </div>
      </div>

      <div class="two-col section">
        <aside class="sidebar-card reveal">
          <h3>Связаться по заказу</h3>
          <p><strong>Телефон:</strong> ${window.KraftUI.escapeHtml(settings.phone || "-")}</p>
          <p><strong>Email:</strong> ${window.KraftUI.escapeHtml(settings.email || "-")}</p>
          <p><strong>Telegram:</strong> ${window.KraftUI.escapeHtml(settings.telegram || "-")}</p>
          <a class="btn" href="constructor.html">Собрать мокап бренда</a>
        </aside>
        <div class="sidebar-card reveal">
          <h3>Похожие позиции</h3>
          <div class="chip-row">
            ${
              related.length
                ? related
                    .map(
                      (item) =>
                        `<a class="chip" href="product.html?id=${encodeURIComponent(item.id)}">${window.KraftUI.escapeHtml(item.title)}</a>`,
                    )
                    .join("")
                : "<span class='chip'>Пока нет похожих позиций</span>"
            }
          </div>
        </div>
      </div>
    `;

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderProductDetail);
})();

(function () {
  function renderArticleDetail() {
    const host = document.getElementById("articleDetail");
    if (!host) return;

    const id = window.KraftUI.getQuery("id");
    const typeParam = window.KraftUI.getQuery("type");
    const type = typeParam === "posts" ? "posts" : "news";

    if (!id) {
      host.innerHTML = window.KraftRenderers.emptyState("Не передан идентификатор материала.");
      return;
    }

    const state = window.KraftStore.getState();
    const collection = state[type];
    const item = collection.find((entry) => entry.id === id);

    if (!item) {
      host.innerHTML = window.KraftRenderers.emptyState("Материал не найден.");
      return;
    }

    const related = collection.filter((entry) => entry.id !== id).slice(0, 3);

    host.innerHTML = `
      <div class="article reveal">
        <div class="article-cover">${window.KraftUI.cardImage(item.image, item.title)}</div>
        <div class="article-inner">
          <h1 class="article-title">${window.KraftUI.escapeHtml(item.title)}</h1>
          <p class="article-meta">${window.KraftUI.formatDate(item.date)}${type === "posts" ? ` • ${window.KraftUI.escapeHtml(item.author || "")}` : ""}</p>
          <div class="article-body">${window.KraftUI.paragraphize(item.content || item.excerpt || "")}</div>
        </div>
      </div>

      <div class="section sidebar-card reveal">
        <h3>Другие материалы</h3>
        <div class="chip-row">
          ${
            related.length
              ? related
                  .map(
                    (entry) =>
                      `<a class="chip" href="article.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(entry.id)}">${window.KraftUI.escapeHtml(entry.title)}</a>`,
                  )
                  .join("")
              : "<span class='chip'>Других материалов пока нет</span>"
          }
        </div>
      </div>
    `;

    const typeBadge = document.getElementById("articleTypeBadge");
    if (typeBadge) {
      typeBadge.textContent = type === "posts" ? "Пост" : "Новость";
    }

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderArticleDetail);
})();

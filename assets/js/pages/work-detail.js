(function () {
  function renderWorkDetail() {
    const host = document.getElementById("workDetail");
    if (!host) return;

    const id = window.KraftUI.getQuery("id");
    if (!id) {
      host.innerHTML = window.KraftRenderers.emptyState("Не передан идентификатор кейса.");
      return;
    }

    const state = window.KraftStore.getState();
    const work = state.works.find((item) => item.id === id);
    if (!work) {
      host.innerHTML = window.KraftRenderers.emptyState("Кейс не найден.");
      return;
    }

    const client = state.clients.find((item) => item.id === work.clientId);
    const category = state.categories.find((item) => item.id === work.categoryId);

    const related = state.works.filter((item) => item.id !== work.id).slice(0, 3);

    host.innerHTML = `
      <div class="article reveal">
        <div class="article-cover">${window.KraftUI.cardImage(work.image, work.title)}</div>
        <div class="article-inner">
          <h1 class="article-title">${window.KraftUI.escapeHtml(work.title)}</h1>
          <p class="article-meta">${window.KraftUI.formatDate(work.date)} • ${window.KraftUI.escapeHtml((client || {}).name || "Клиент")}</p>
          <div class="chip-row" style="margin-bottom: 1rem;">
            <span class="chip">${window.KraftUI.escapeHtml((category || {}).title || "Без категории")}</span>
            <span class="chip">${window.KraftUI.escapeHtml((client || {}).industry || "")}</span>
          </div>
          <div class="article-body">
            <p><strong>Задача:</strong> ${window.KraftUI.escapeHtml(work.challenge || "")}</p>
            <p><strong>Решение:</strong> ${window.KraftUI.escapeHtml(work.solution || "")}</p>
            <p><strong>Результат:</strong> ${window.KraftUI.escapeHtml(work.result || "")}</p>
          </div>
        </div>
      </div>

      <div class="section sidebar-card reveal">
        <h3>Другие кейсы</h3>
        <div class="chip-row">
          ${
            related.length
              ? related
                  .map(
                    (item) =>
                      `<a class="chip" href="work.html?id=${encodeURIComponent(item.id)}">${window.KraftUI.escapeHtml(item.title)}</a>`,
                  )
                  .join("")
              : "<span class='chip'>Пока нет других кейсов</span>"
          }
        </div>
      </div>
    `;

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderWorkDetail);
})();

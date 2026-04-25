(function () {
  function renderWorks() {
    const state = window.KraftStore.getState();
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("category") || "all";

    const categoryById = Object.fromEntries(state.categories.map((cat) => [cat.id, cat]));
    const clientById = Object.fromEntries(state.clients.map((client) => [client.id, client]));

    const chipsHost = document.getElementById("worksFilters");
    if (chipsHost) {
      const chips = [
        `<a class="chip ${selected === "all" ? "is-active" : ""}" href="works.html?category=all">Все кейсы</a>`,
        ...state.categories.map((cat) => {
          const active = selected === cat.id || selected === cat.slug;
          return `<a class="chip ${active ? "is-active" : ""}" href="works.html?category=${encodeURIComponent(cat.id)}">${window.KraftUI.escapeHtml(cat.title)}</a>`;
        }),
      ];
      chipsHost.innerHTML = chips.join("");
    }

    const works = state.works
      .filter((work) => {
        if (selected === "all") return true;
        const category = categoryById[work.categoryId];
        return work.categoryId === selected || (category && category.slug === selected);
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const grid = document.getElementById("worksGrid");
    if (grid) {
      grid.innerHTML = works.length
        ? works
            .map((work) =>
              window.KraftRenderers.workCard(
                work,
                (clientById[work.clientId] || {}).name,
                (categoryById[work.categoryId] || {}).title,
              ),
            )
            .join("")
        : window.KraftRenderers.emptyState("По выбранному фильтру кейсов не найдено.");
    }

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderWorks);
})();

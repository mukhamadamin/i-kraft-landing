(function () {
  function renderNews() {
    const state = window.KraftStore.getState();
    const list = document.getElementById("newsGrid");
    if (!list) return;

    const news = [...state.news].sort((a, b) => (a.date < b.date ? 1 : -1));
    list.innerHTML = news.length
      ? news.map((item) => window.KraftRenderers.articleCard(item, "news")).join("")
      : window.KraftRenderers.emptyState("Новостей пока нет.");

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderNews);
})();

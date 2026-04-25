(function () {
  function renderPosts() {
    const state = window.KraftStore.getState();
    const list = document.getElementById("postsGrid");
    if (!list) return;

    const posts = [...state.posts].sort((a, b) => (a.date < b.date ? 1 : -1));
    list.innerHTML = posts.length
      ? posts.map((item) => window.KraftRenderers.articleCard(item, "posts")).join("")
      : window.KraftRenderers.emptyState("Посты пока не добавлены.");

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderPosts);
})();

(function () {
  function renderClients() {
    const state = window.KraftStore.getState();
    const list = document.getElementById("clientsGrid");
    if (!list) return;

    const worksCount = state.works.reduce((acc, work) => {
      acc[work.clientId] = (acc[work.clientId] || 0) + 1;
      return acc;
    }, {});

    list.innerHTML = state.clients.length
      ? state.clients.map((client) => window.KraftRenderers.clientCard(client, worksCount[client.id] || 0)).join("")
      : window.KraftRenderers.emptyState("Клиенты пока не добавлены.");

    window.KraftUI.initReveal();
  }

  document.addEventListener("DOMContentLoaded", renderClients);
})();

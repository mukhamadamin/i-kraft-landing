(function () {
  function safe(value) {
    return window.KraftUI.escapeHtml(value);
  }

  function image(url, alt) {
    return window.KraftUI.cardImage(url, alt);
  }

  function productCard(product, categoryName) {
    return `
      <article class="card reveal">
        <div class="card-media">${image(product.image, product.title)}</div>
        <div class="card-body">
          <h3 class="card-title">${safe(product.title)}</h3>
          <p class="card-meta">${safe(categoryName || "Без категории")}</p>
          <p class="card-text">${safe(product.summary || "")}</p>
          <div class="card-actions">
            <span class="chip">${safe(product.minOrder || "По запросу")}</span>
            <a class="card-link" href="product.html?id=${encodeURIComponent(product.id)}">Подробнее</a>
          </div>
        </div>
      </article>
    `;
  }

  function articleCard(item, type) {
    const date = window.KraftUI.formatDate(item.date);
    return `
      <article class="card reveal">
        <div class="card-media">${image(item.image, item.title)}</div>
        <div class="card-body">
          <h3 class="card-title">${safe(item.title)}</h3>
          <p class="card-meta">${safe(date)}</p>
          <p class="card-text">${safe(item.excerpt || "")}</p>
          <div class="card-actions">
            <span class="chip">${type === "posts" ? safe(item.readTime || "Статья") : "Новость"}</span>
            <a class="card-link" href="article.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(item.id)}">Читать</a>
          </div>
        </div>
      </article>
    `;
  }

  function clientCard(client, worksCount) {
    return `
      <article class="card reveal">
        <div class="card-body">
          <h3 class="card-title">${safe(client.name)}</h3>
          <p class="card-meta">${safe(client.industry || "")}</p>
          <p class="card-text">${safe(client.about || "")}</p>
          <div class="card-actions">
            <span class="chip">Кейсов: ${worksCount}</span>
            <a class="card-link" href="${safe(client.website || "#")}" target="_blank" rel="noopener">Сайт клиента</a>
          </div>
        </div>
      </article>
    `;
  }

  function workCard(work, clientName, categoryName) {
    const date = window.KraftUI.formatDate(work.date);
    return `
      <article class="card reveal">
        <div class="card-media">${image(work.image, work.title)}</div>
        <div class="card-body">
          <h3 class="card-title">${safe(work.title)}</h3>
          <p class="card-meta">${safe(clientName || "Клиент не указан")} • ${safe(categoryName || "Без категории")}</p>
          <p class="card-text">${safe(work.result || work.solution || "")}</p>
          <div class="card-actions">
            <span class="chip">${safe(date)}</span>
            <a class="card-link" href="work.html?id=${encodeURIComponent(work.id)}">Кейс</a>
          </div>
        </div>
      </article>
    `;
  }

  function emptyState(text) {
    return `<p class="empty">${safe(text || "Пока нет данных")}</p>`;
  }

  window.KraftRenderers = {
    productCard,
    articleCard,
    clientCard,
    workCard,
    emptyState,
  };
})();

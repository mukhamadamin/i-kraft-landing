(function () {
  const state = {
    currentEntity: "products",
    editingId: null,
  };

  const app = document.getElementById("adminApp");
  const topbar = document.getElementById("adminTopbar");

  if (!app) return;

  function defs(store) {
    return {
      settings: {
        title: "Настройки сайта",
        subtitle: "Контакты и тексты главного экрана.",
        fields: [
          { name: "companyName", label: "Название компании", type: "text", required: true },
          { name: "slogan", label: "Слоган", type: "text" },
          { name: "phone", label: "Телефон", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "address", label: "Адрес", type: "text" },
          { name: "telegram", label: "Telegram", type: "text" },
          { name: "whatsapp", label: "WhatsApp", type: "text" },
          { name: "heroTitle", label: "Заголовок на главной", type: "textarea" },
          { name: "heroSubtitle", label: "Подзаголовок на главной", type: "textarea" },
        ],
      },
      categories: {
        title: "Категории",
        subtitle: "Сегменты каталога и фильтры.",
        fields: [
          { name: "title", label: "Название", type: "text", required: true },
          { name: "slug", label: "Slug (можно пустым)", type: "text" },
          { name: "description", label: "Описание", type: "textarea" },
          { name: "image", label: "Изображение URL", type: "text" },
        ],
        columns: [
          { key: "title", label: "Название" },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Описание" },
        ],
      },
      products: {
        title: "Продукция",
        subtitle: "Карточки товаров в каталоге.",
        fields: [
          { name: "title", label: "Название", type: "text", required: true },
          {
            name: "categoryId",
            label: "Категория",
            type: "select",
            options: store.categories.map((cat) => ({ value: cat.id, label: cat.title })),
          },
          { name: "summary", label: "Краткое описание", type: "textarea" },
          { name: "description", label: "Полное описание", type: "textarea" },
          { name: "specs", label: "Характеристики", type: "textarea" },
          { name: "minOrder", label: "Минимальный тираж", type: "text" },
          { name: "tags", label: "Теги (через запятую)", type: "text" },
          { name: "image", label: "Изображение URL", type: "text" },
        ],
        columns: [
          { key: "title", label: "Название" },
          { key: "categoryId", label: "Категория", map: "category" },
          { key: "minOrder", label: "Мин. тираж" },
          { key: "summary", label: "Описание" },
        ],
      },
      news: {
        title: "Новости",
        subtitle: "Новости компании и производства.",
        fields: [
          { name: "title", label: "Заголовок", type: "text", required: true },
          { name: "date", label: "Дата", type: "date", required: true },
          { name: "excerpt", label: "Краткий текст", type: "textarea" },
          { name: "content", label: "Полный текст", type: "textarea" },
          { name: "image", label: "Изображение URL", type: "text" },
        ],
        columns: [
          { key: "date", label: "Дата" },
          { key: "title", label: "Заголовок" },
          { key: "excerpt", label: "Кратко" },
        ],
      },
      posts: {
        title: "Посты",
        subtitle: "Экспертные статьи и материалы блога.",
        fields: [
          { name: "title", label: "Заголовок", type: "text", required: true },
          { name: "date", label: "Дата", type: "date", required: true },
          { name: "author", label: "Автор", type: "text" },
          { name: "readTime", label: "Время чтения", type: "text" },
          { name: "excerpt", label: "Краткий текст", type: "textarea" },
          { name: "content", label: "Полный текст", type: "textarea" },
          { name: "image", label: "Изображение URL", type: "text" },
        ],
        columns: [
          { key: "date", label: "Дата" },
          { key: "title", label: "Заголовок" },
          { key: "author", label: "Автор" },
        ],
      },
      clients: {
        title: "Наши клиенты",
        subtitle: "Список брендов и компаний-партнеров.",
        fields: [
          { name: "name", label: "Название", type: "text", required: true },
          { name: "industry", label: "Сфера", type: "text" },
          { name: "about", label: "Описание", type: "textarea" },
          { name: "website", label: "Сайт", type: "text" },
        ],
        columns: [
          { key: "name", label: "Название" },
          { key: "industry", label: "Сфера" },
          { key: "about", label: "Описание" },
        ],
      },
      works: {
        title: "Наши работы",
        subtitle: "Кейсы и реализованные проекты.",
        fields: [
          { name: "title", label: "Название кейса", type: "text", required: true },
          { name: "date", label: "Дата", type: "date", required: true },
          {
            name: "clientId",
            label: "Клиент",
            type: "select",
            options: store.clients.map((client) => ({ value: client.id, label: client.name })),
          },
          {
            name: "categoryId",
            label: "Категория",
            type: "select",
            options: store.categories.map((cat) => ({ value: cat.id, label: cat.title })),
          },
          { name: "challenge", label: "Задача", type: "textarea" },
          { name: "solution", label: "Решение", type: "textarea" },
          { name: "result", label: "Результат", type: "textarea" },
          { name: "image", label: "Изображение URL", type: "text" },
        ],
        columns: [
          { key: "date", label: "Дата" },
          { key: "title", label: "Кейс" },
          { key: "clientId", label: "Клиент", map: "client" },
          { key: "result", label: "Результат" },
        ],
      },
    };
  }

  function esc(value) {
    return window.KraftUI.escapeHtml(value || "");
  }

  function short(value, max) {
    const text = String(value || "");
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1)}…`;
  }

  function fieldMarkup(field, value) {
    const safeValue = value == null ? "" : String(value);

    if (field.type === "textarea") {
      return `
        <div class="field-wide">
          <label for="fld_${field.name}">${esc(field.label)}</label>
          <textarea id="fld_${field.name}" name="${esc(field.name)}" ${field.required ? "required" : ""}>${esc(safeValue)}</textarea>
        </div>
      `;
    }

    if (field.type === "select") {
      const options = (field.options || [])
        .map((option) => {
          const selected = option.value === safeValue ? "selected" : "";
          return `<option value="${esc(option.value)}" ${selected}>${esc(option.label)}</option>`;
        })
        .join("");

      return `
        <div class="field">
          <label for="fld_${field.name}">${esc(field.label)}</label>
          <select id="fld_${field.name}" name="${esc(field.name)}">
            <option value="">Не выбрано</option>
            ${options}
          </select>
        </div>
      `;
    }

    const inputType = field.type === "date" ? "date" : "text";
    return `
      <div class="field">
        <label for="fld_${field.name}">${esc(field.label)}</label>
        <input id="fld_${field.name}" type="${inputType}" name="${esc(field.name)}" value="${esc(safeValue)}" ${
          field.required ? "required" : ""
        } />
      </div>
    `;
  }

  function extractPayload(form, fields) {
    const formData = new FormData(form);
    const payload = {};

    fields.forEach((field) => {
      payload[field.name] = String(formData.get(field.name) || "").trim();
    });

    return payload;
  }

  function renderTopbar(storeState) {
    if (!topbar) return;

    topbar.innerHTML = `
      <button class="btn btn-inline" data-action="export-json">Экспорт JSON</button>
      <label class="btn btn-inline btn-secondary" style="cursor:pointer;">
        Импорт JSON
        <input id="importJsonInput" type="file" accept="application/json" style="display:none;" />
      </label>
      <button class="btn btn-inline btn-danger" data-action="reset-demo">Сбросить демо-данные</button>
      <span class="chip">Продукция: ${storeState.products.length}</span>
      <span class="chip">Новости: ${storeState.news.length}</span>
      <span class="chip">Посты: ${storeState.posts.length}</span>
      <span class="chip">Клиенты: ${storeState.clients.length}</span>
      <span class="chip">Кейсы: ${storeState.works.length}</span>
    `;
  }

  function renderSettings(def, storeState) {
    const fields = def.fields.map((field) => fieldMarkup(field, storeState.settings[field.name])).join("");

    return `
      <div>
        <h2 class="admin-title">${esc(def.title)}</h2>
        <p class="admin-subtitle">${esc(def.subtitle)}</p>

        <form id="settingsForm" class="form-grid">
          ${fields}
          <div class="field-wide form-actions">
            <button class="btn" type="submit">Сохранить настройки</button>
          </div>
        </form>
      </div>
    `;
  }

  function mappedValue(column, value, refs) {
    if (!column.map) return value;
    if (column.map === "category") return (refs.category[value] || {}).title || "-";
    if (column.map === "client") return (refs.client[value] || {}).name || "-";
    return value;
  }

  function renderTable(entity, def, items, refs) {
    if (!items.length) {
      return window.KraftRenderers.emptyState("Пока нет записей. Добавьте первую запись через форму.");
    }

    const head = def.columns.map((col) => `<th>${esc(col.label)}</th>`).join("");

    const rows = items
      .map((item) => {
        const cells = def.columns
          .map((column) => {
            const raw = mappedValue(column, item[column.key], refs);
            const output = column.key === "date" ? window.KraftUI.formatDate(raw) : short(raw, 90);
            return `<td>${esc(output)}</td>`;
          })
          .join("");

        return `
          <tr>
            ${cells}
            <td>
              <button class="btn btn-inline btn-secondary" data-action="edit-item" data-id="${esc(item.id)}" data-entity="${esc(entity)}">Изменить</button>
              <button class="btn btn-inline btn-danger" data-action="delete-item" data-id="${esc(item.id)}" data-entity="${esc(entity)}">Удалить</button>
            </td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>${head}<th>Действия</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function renderEntity(entity, def, storeState) {
    const refs = {
      category: Object.fromEntries(storeState.categories.map((cat) => [cat.id, cat])),
      client: Object.fromEntries(storeState.clients.map((client) => [client.id, client])),
    };

    const items = [...storeState[entity]];
    if (items.length && items[0].date) {
      items.sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    const editingItem = state.editingId ? items.find((item) => item.id === state.editingId) : null;
    const formFields = def.fields.map((field) => fieldMarkup(field, editingItem ? editingItem[field.name] : "")).join("");

    return `
      <div>
        <h2 class="admin-title">${esc(def.title)}</h2>
        <p class="admin-subtitle">${esc(def.subtitle)}</p>

        <form id="entityForm" class="form-grid" data-entity="${esc(entity)}">
          ${formFields}
          <div class="field-wide form-actions">
            <button class="btn" type="submit">${editingItem ? "Сохранить изменения" : "Добавить запись"}</button>
            ${
              editingItem
                ? '<button class="btn btn-secondary" type="button" data-action="cancel-edit">Отменить редактирование</button>'
                : ""
            }
          </div>
        </form>

        ${renderTable(entity, def, items, refs)}
      </div>
    `;
  }

  function render() {
    const storeState = window.KraftStore.getState();
    const allDefs = defs(storeState);

    if (!allDefs[state.currentEntity]) {
      state.currentEntity = "products";
      state.editingId = null;
    }

    renderTopbar(storeState);

    const sidebar = document.getElementById("adminSidebar");
    if (sidebar) {
      sidebar.innerHTML = `
        <h3>Разделы</h3>
        ${Object.keys(allDefs)
          .map((entity) => {
            const active = entity === state.currentEntity ? "is-active" : "";
            return `<button class="admin-tab ${active}" data-action="switch-entity" data-entity="${esc(entity)}">${esc(allDefs[entity].title)}</button>`;
          })
          .join("")}
      `;
    }

    const def = allDefs[state.currentEntity];
    app.innerHTML =
      state.currentEntity === "settings" ? renderSettings(def, storeState) : renderEntity(state.currentEntity, def, storeState);
  }

  function onSubmit(event) {
    if (event.target.id === "settingsForm") {
      event.preventDefault();
      const storeState = window.KraftStore.getState();
      const fields = defs(storeState).settings.fields;
      const payload = extractPayload(event.target, fields);
      window.KraftStore.updateSettings(payload);
      render();
      return;
    }

    if (event.target.id === "entityForm") {
      event.preventDefault();
      const entity = event.target.getAttribute("data-entity");
      const storeState = window.KraftStore.getState();
      const def = defs(storeState)[entity];
      const payload = extractPayload(event.target, def.fields);

      if (entity === "categories" && !payload.slug) {
        payload.slug = window.KraftStore.toSlug(payload.title);
      }

      if (state.editingId) {
        window.KraftStore.updateItem(entity, state.editingId, payload);
      } else {
        window.KraftStore.addItem(entity, payload);
      }

      state.editingId = null;
      render();
    }
  }

  function exportJson() {
    const data = window.KraftStore.exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    link.href = url;
    link.download = `kraftvision-cms-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function onClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;

    const action = trigger.getAttribute("data-action");

    if (action === "switch-entity") {
      state.currentEntity = trigger.getAttribute("data-entity");
      state.editingId = null;
      render();
      return;
    }

    if (action === "cancel-edit") {
      state.editingId = null;
      render();
      return;
    }

    if (action === "edit-item") {
      state.currentEntity = trigger.getAttribute("data-entity");
      state.editingId = trigger.getAttribute("data-id");
      render();
      return;
    }

    if (action === "delete-item") {
      const entity = trigger.getAttribute("data-entity");
      const id = trigger.getAttribute("data-id");
      if (!window.confirm("Удалить запись? Действие нельзя отменить.")) return;
      window.KraftStore.deleteItem(entity, id);
      if (state.editingId === id) state.editingId = null;
      render();
      return;
    }

    if (action === "export-json") {
      exportJson();
      return;
    }

    if (action === "reset-demo") {
      if (!window.confirm("Сбросить все данные до демо-версии?")) return;
      window.KraftStore.reset();
      state.editingId = null;
      render();
    }
  }

  function onImportChange(event) {
    const input = event.target;
    if (!input || input.id !== "importJsonInput") return;

    const [file] = input.files || [];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      try {
        window.KraftStore.importStateFromJson(String(reader.result || "{}"));
        state.editingId = null;
        render();
        window.alert("Импорт выполнен.");
      } catch (_error) {
        window.alert("Не удалось импортировать JSON. Проверьте структуру файла.");
      }
    };
    reader.readAsText(file, "utf-8");
    input.value = "";
  }

  document.addEventListener("submit", onSubmit);
  document.addEventListener("click", onClick);
  document.addEventListener("change", onImportChange);
  window.addEventListener("kraftstore:change", render);

  render();
})();

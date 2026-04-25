import { useMemo, useRef, useState } from "react";
import { useStore } from "../store/StoreContext";
import { PageHead } from "../components/PageHead";
import { formatDate, shortText } from "../utils/format";

function fieldClass(type) {
  return type === "textarea" ? "field-wide" : "field";
}

export function AdminPage() {
  const store = useStore();
  const { state } = store;
  const [entity, setEntity] = useState("products");
  const [editingId, setEditingId] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const importRef = useRef(null);

  const refs = useMemo(
    () => ({
      category: Object.fromEntries(state.categories.map((item) => [item.id, item])),
      client: Object.fromEntries(state.clients.map((item) => [item.id, item])),
    }),
    [state.categories, state.clients],
  );

  const definitions = useMemo(
    () => ({
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
          { name: "slug", label: "Slug", type: "text" },
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
            options: state.categories.map((item) => ({ value: item.id, label: item.title })),
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
          { key: "minOrder", label: "Тираж" },
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
        subtitle: "Экспертные статьи и материалы.",
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
        title: "Клиенты",
        subtitle: "Партнеры и бренды.",
        fields: [
          { name: "name", label: "Название", type: "text", required: true },
          { name: "industry", label: "Сфера", type: "text" },
          { name: "logo", label: "Логотип (URL изображения)", type: "text" },
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
        subtitle: "Кейсы и результаты.",
        fields: [
          { name: "title", label: "Название кейса", type: "text", required: true },
          { name: "date", label: "Дата", type: "date", required: true },
          {
            name: "clientId",
            label: "Клиент",
            type: "select",
            options: state.clients.map((item) => ({ value: item.id, label: item.name })),
          },
          {
            name: "categoryId",
            label: "Категория",
            type: "select",
            options: state.categories.map((item) => ({ value: item.id, label: item.title })),
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
    }),
    [state.categories, state.clients],
  );

  const def = definitions[entity];
  const list = entity === "settings" ? [] : state[entity] || [];
  const sortedList = [...list].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date < b.date ? 1 : -1;
  });

  const editingItem = entity === "settings" ? state.settings : sortedList.find((item) => item.id === editingId);

  const pickMappedValue = (column, value) => {
    if (!column.map) return value;
    if (column.map === "category") return refs.category[value]?.title || "-";
    if (column.map === "client") return refs.client[value]?.name || "-";
    return value;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload = {};
    def.fields.forEach((field) => {
      payload[field.name] = String(formData.get(field.name) || "").trim();
    });

    if (entity === "settings") {
      store.updateSettings(payload);
      setFormNonce((prev) => prev + 1);
      return;
    }

    if (entity === "categories" && !payload.slug) {
      payload.slug = store.toSlug(payload.title || "category");
    }

    if (editingId) {
      store.updateItem(entity, editingId, payload);
    } else {
      store.addItem(entity, payload);
    }

    setEditingId(null);
    setFormNonce((prev) => prev + 1);
  };

  const downloadExport = () => {
    const data = store.exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kraftvision-cms-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();

    try {
      store.importStateFromJson(text);
      setEditingId(null);
      setFormNonce((prev) => prev + 1);
      window.alert("Импорт выполнен");
    } catch (_error) {
      window.alert("Ошибка импорта JSON");
    }

    event.target.value = "";
  };

  return (
    <>
      <PageHead
        eyebrow="Панель управления"
        title="Контент и структура сайта"
        subtitle="Управляйте новостями, постами, продукцией, категориями, клиентами и кейсами."
      />

      <section className="container section">
        <div className="admin-topbar reveal-item">
          <button className="btn btn-inline" onClick={downloadExport} type="button">
            Экспорт JSON
          </button>
          <button className="btn btn-inline btn-secondary" type="button" onClick={() => importRef.current?.click()}>
            Импорт JSON
          </button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={onImport} />
          <button
            className="btn btn-inline btn-danger"
            onClick={() => {
              if (window.confirm("Сбросить данные до демо-состояния?")) {
                store.reset();
                setEditingId(null);
                setFormNonce((prev) => prev + 1);
              }
            }}
            type="button"
          >
            Сброс
          </button>
          <span className="chip">Продукция: {state.products.length}</span>
          <span className="chip">Новости: {state.news.length}</span>
          <span className="chip">Посты: {state.posts.length}</span>
          <span className="chip">Клиенты: {state.clients.length}</span>
          <span className="chip">Кейсы: {state.works.length}</span>
        </div>

        <div className="admin-layout">
          <aside className="admin-sidebar reveal-item">
            <h3>Разделы</h3>
            {Object.keys(definitions).map((key) => (
              <button
                key={key}
                type="button"
                className={`admin-tab ${key === entity ? "is-active" : ""}`}
                onClick={() => {
                  setEntity(key);
                  setEditingId(null);
                  setFormNonce((prev) => prev + 1);
                }}
              >
                {definitions[key].title}
              </button>
            ))}
          </aside>

          <div className="admin-content reveal-item">
            <h2 className="admin-title">{def.title}</h2>
            <p className="admin-subtitle">{def.subtitle}</p>

            <form className="form-grid" onSubmit={handleSubmit} key={`${entity}_${editingId || "new"}_${formNonce}`}>
              {def.fields.map((field) => {
                const defaultValue = editingItem?.[field.name] || "";

                if (field.type === "textarea") {
                  return (
                    <div className={fieldClass(field.type)} key={field.name}>
                      <label>{field.label}</label>
                      <textarea name={field.name} defaultValue={defaultValue} required={field.required} />
                    </div>
                  );
                }

                if (field.type === "select") {
                  return (
                    <div className={fieldClass(field.type)} key={field.name}>
                      <label>{field.label}</label>
                      <select name={field.name} defaultValue={defaultValue}>
                        <option value="">Не выбрано</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                const inputType = field.type === "date" ? "date" : "text";
                return (
                  <div className={fieldClass(field.type)} key={field.name}>
                    <label>{field.label}</label>
                    <input type={inputType} name={field.name} defaultValue={defaultValue} required={field.required} />
                  </div>
                );
              })}

              <div className="field-wide form-actions">
                <button className="btn" type="submit">
                  {entity === "settings" ? "Сохранить настройки" : editingId ? "Сохранить изменения" : "Добавить запись"}
                </button>
                {entity !== "settings" && editingId ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormNonce((prev) => prev + 1);
                    }}
                  >
                    Отменить редактирование
                  </button>
                ) : null}
              </div>
            </form>

            {entity !== "settings" ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {def.columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedList.map((item) => (
                      <tr key={item.id}>
                        {def.columns.map((column) => {
                          const raw = pickMappedValue(column, item[column.key]);
                          const value = column.key === "date" ? formatDate(raw) : shortText(raw, 88);
                          return <td key={`${item.id}_${column.key}`}>{value || "-"}</td>;
                        })}
                        <td>
                          <button
                            className="btn btn-inline btn-secondary"
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setFormNonce((prev) => prev + 1);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Изменить
                          </button>{" "}
                          <button
                            className="btn btn-inline btn-danger"
                            type="button"
                            onClick={() => {
                              if (window.confirm("Удалить запись?")) {
                                store.deleteItem(entity, item.id);
                                if (editingId === item.id) {
                                  setEditingId(null);
                                }
                              }
                            }}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!sortedList.length ? (
                      <tr>
                        <td colSpan={def.columns.length + 1}>Записей пока нет.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

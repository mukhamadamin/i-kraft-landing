import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { kraftLogo } from "../assets";
import { ThemeToggle } from "../theme";
import { Atmosphere } from "../components/motion";
import { formatDate, shortText } from "../utils/format";

function fieldClass(type) {
  return type === "textarea" ? "field-wide" : "field";
}

/* ── Вход в панель ── */

const AUTH_KEY = "kraftvision.admin.session";
const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "admin123";

function readAuth() {
  try {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  } catch (_error) {
    return false;
  }
}

function AdminLogin({ onSuccess }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (login.trim() === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch (_error) {
        /* режим инкогнито без хранилища — просто пускаем в рамках рендера */
      }
      onSuccess();
      return;
    }
    setError(true);
    setPassword("");
  };

  return (
    <div className="admin-login-screen">
      <Atmosphere />
      <form className={`admin-login-card ${error ? "is-error" : ""}`} onSubmit={submit}>
        <img src={kraftLogo} alt="" className="admin-login-logo" />
        <h1>Панель управления</h1>
        <p>Введите логин и пароль администратора</p>

        <div className="field-wide">
          <label>Логин</label>
          <input
            value={login}
            onChange={(e) => {
              setLogin(e.target.value);
              setError(false);
            }}
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="field-wide">
          <label>Пароль</label>
          <div className="admin-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="admin-password-toggle"
              title={showPassword ? "Скрыть пароль" : "Показать пароль"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error ? <p className="admin-login-error">Неверный логин или пароль</p> : null}

        <button className="btn admin-login-submit" type="submit">
          Войти
        </button>

        <Link to="/" className="admin-login-back">
          ← Вернуться на сайт
        </Link>
      </form>
    </div>
  );
}

const ENTITY_ICONS = {
  settings: "⚙️",
  categories: "🗂️",
  products: "📦",
  news: "📰",
  posts: "✍️",
  clients: "🤝",
  works: "🏆",
};

export function AdminPage() {
  const [authed, setAuthed] = useState(readAuth);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminPanel onLogout={() => setAuthed(false)} />;
}

function AdminPanel({ onLogout }) {
  const store = useStore();
  const { state } = store;
  const [entity, setEntity] = useState("products");
  const [editingId, setEditingId] = useState(null);
  const [formNonce, setFormNonce] = useState(0);
  const [query, setQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const importRef = useRef(null);
  const formRef = useRef(null);
  const toastId = useRef(0);

  useEffect(() => {
    const previous = document.title;
    document.title = "Панель управления — I-Kraft-Pack";
    return () => {
      document.title = previous;
    };
  }, []);

  const notify = (text, tone = "ok") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const askConfirm = (text, action) => setConfirmState({ text, action });

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
        imageKey: "image",
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
        imageKey: "image",
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
        imageKey: "image",
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
        imageKey: "image",
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
        imageKey: "logo",
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
        imageKey: "image",
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

  const sortedList = useMemo(() => {
    const sorted = [...list].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
    const term = query.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((item) =>
      Object.values(item).some((value) => typeof value === "string" && value.toLowerCase().includes(term)),
    );
  }, [list, query]);

  const editingItem =
    entity === "settings" ? state.settings : list.find((item) => item.id === editingId);

  const pickMappedValue = (column, value) => {
    if (!column.map) return value;
    if (column.map === "category") return refs.category[value]?.title || "—";
    if (column.map === "client") return refs.client[value]?.name || "—";
    return value;
  };

  const switchEntity = (key) => {
    setEntity(key);
    setEditingId(null);
    setQuery("");
    setFormNonce((prev) => prev + 1);
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
      notify("Настройки сохранены");
      return;
    }

    if (entity === "categories" && !payload.slug) {
      payload.slug = store.toSlug(payload.title || "category");
    }

    if (editingId) {
      store.updateItem(entity, editingId, payload);
      notify("Изменения сохранены");
    } else {
      store.addItem(entity, payload);
      notify("Запись добавлена");
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
    notify("Экспорт скачан");
  };

  const onImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();

    try {
      store.importStateFromJson(text);
      setEditingId(null);
      setFormNonce((prev) => prev + 1);
      notify("Импорт выполнен");
    } catch (_error) {
      notify("Ошибка импорта JSON", "error");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormNonce((prev) => prev + 1);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const counts = {
    categories: state.categories.length,
    products: state.products.length,
    news: state.news.length,
    posts: state.posts.length,
    clients: state.clients.length,
    works: state.works.length,
  };

  return (
    <div className="admin-shell">
      <Atmosphere />
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <img src={kraftLogo} alt="" className="admin-brand-logo" />
            <div>
              <b>{state.settings.companyName || "I-Kraft-Pack"}</b>
              <span>Панель управления</span>
            </div>
          </div>
          <div className="admin-header-actions">
            <ThemeToggle />
            <Link to="/" className="btn btn-inline admin-ghost-btn">
              ← Открыть сайт
            </Link>
            <button className="btn btn-inline admin-ghost-btn" onClick={downloadExport} type="button">
              Экспорт
            </button>
            <button
              className="btn btn-inline admin-ghost-btn"
              type="button"
              onClick={() => importRef.current?.click()}
            >
              Импорт
            </button>
            <input ref={importRef} type="file" accept="application/json" hidden onChange={onImport} />
            <button
              className="btn btn-inline btn-danger"
              type="button"
              onClick={() =>
                askConfirm("Сбросить все данные до демо-состояния? Действие необратимо.", () => {
                  store.reset();
                  setEditingId(null);
                  setFormNonce((prev) => prev + 1);
                  notify("Данные сброшены");
                })
              }
            >
              Сброс
            </button>
            <button
              className="btn btn-inline admin-ghost-btn"
              type="button"
              title="Завершить сессию"
              onClick={() => {
                try {
                  sessionStorage.removeItem(AUTH_KEY);
                } catch (_error) {
                  /* хранилище недоступно — просто выходим */
                }
                onLogout();
              }}
            >
              Выйти ⎋
            </button>
          </div>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-side">
          <p className="admin-side-title">Разделы</p>
          {Object.keys(definitions).map((key) => (
            <button
              key={key}
              type="button"
              className={`admin-tab ${key === entity ? "is-active" : ""}`}
              onClick={() => switchEntity(key)}
            >
              <span className="admin-tab-icon">{ENTITY_ICONS[key]}</span>
              <span className="admin-tab-label">{definitions[key].title}</span>
              {key !== "settings" ? <span className="admin-tab-count">{counts[key]}</span> : null}
            </button>
          ))}
        </aside>

        <main className="admin-main">
          <section className="admin-card" ref={formRef}>
            <div className="admin-card-head">
              <div>
                <h2 className="admin-title">{def.title}</h2>
                <p className="admin-subtitle">{def.subtitle}</p>
              </div>
              {entity !== "settings" && editingId ? (
                <span className="admin-editing-chip">
                  Редактирование: {shortText(editingItem?.title || editingItem?.name || editingId, 40)}
                </span>
              ) : null}
            </div>

            <form
              className="form-grid"
              onSubmit={handleSubmit}
              key={`${entity}_${editingId || "new"}_${formNonce}`}
            >
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
          </section>

          {entity !== "settings" ? (
            <section className="admin-card">
              <div className="admin-card-head">
                <h3 className="admin-list-title">
                  Записи <span className="admin-tab-count">{sortedList.length}</span>
                </h3>
                <input
                  className="admin-search"
                  type="search"
                  placeholder="Поиск по разделу…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {def.imageKey ? <th className="admin-th-thumb" /> : null}
                      {def.columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedList.map((item) => (
                      <tr key={item.id} className={item.id === editingId ? "is-editing" : ""}>
                        {def.imageKey ? (
                          <td className="admin-td-thumb">
                            {item[def.imageKey] ? (
                              <img src={item[def.imageKey]} alt="" className="table-thumb" loading="lazy" />
                            ) : (
                              <span className="table-thumb table-thumb-empty">
                                {(item.title || item.name || "•").charAt(0)}
                              </span>
                            )}
                          </td>
                        ) : null}
                        {def.columns.map((column) => {
                          const raw = pickMappedValue(column, item[column.key]);
                          const value = column.key === "date" ? formatDate(raw) : shortText(raw, 88);
                          return <td key={`${item.id}_${column.key}`}>{value || "—"}</td>;
                        })}
                        <td className="admin-td-actions">
                          <button
                            className="btn btn-inline btn-secondary"
                            type="button"
                            onClick={() => startEdit(item)}
                          >
                            Изменить
                          </button>
                          <button
                            className="btn btn-inline btn-danger"
                            type="button"
                            onClick={() =>
                              askConfirm(
                                `Удалить «${shortText(item.title || item.name || "запись", 60)}»?`,
                                () => {
                                  store.deleteItem(entity, item.id);
                                  if (editingId === item.id) setEditingId(null);
                                  notify("Запись удалена");
                                },
                              )
                            }
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!sortedList.length ? (
                      <tr>
                        <td colSpan={def.columns.length + (def.imageKey ? 2 : 1)}>
                          {query ? "Ничего не найдено по запросу." : "Записей пока нет."}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </main>
      </div>

      {/* Тосты */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone === "error" ? "toast-error" : ""}`}>
            {toast.text}
          </div>
        ))}
      </div>

      {/* Модалка подтверждения */}
      {confirmState ? (
        <div className="modal-backdrop" onClick={() => setConfirmState(null)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <p className="modal-text">{confirmState.text}</p>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => {
                  confirmState.action();
                  setConfirmState(null);
                }}
              >
                Подтвердить
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setConfirmState(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

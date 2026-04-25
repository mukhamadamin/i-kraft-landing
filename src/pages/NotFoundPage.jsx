import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="container section" style={{ paddingTop: "5rem", textAlign: "center" }}>
      <p className="eyebrow">404</p>
      <h1>Страница не найдена</h1>
      <p>Похоже, адрес изменился или страница была удалена.</p>
      <Link className="btn" to="/">
        Вернуться на главную
      </Link>
    </section>
  );
}

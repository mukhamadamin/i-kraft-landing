import { Link } from "react-router-dom";
import { Magnetic, Reveal, SplitText } from "../components/motion";

export function NotFoundPage() {
  return (
    <section className="container notfound">
      <Reveal as="p" variant="down" className="eyebrow">
        Ошибка маршрута
      </Reveal>
      <Reveal variant="zoom" className="notfound__code">
        404
      </Reveal>
      <h1>
        <SplitText text="Такой страницы у нас не печатали" step={45} />
      </h1>
      <Reveal as="p" delay={160}>
        Похоже, адрес изменился или страница была удалена. Загляните в каталог — там точно есть что
        посмотреть.
      </Reveal>
      <Reveal delay={240} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Magnetic strength={0.28}>
          <Link className="btn" to="/">
            На главную <span className="btn-arrow">→</span>
          </Link>
        </Magnetic>
        <Link className="btn btn-secondary" to="/catalog">
          Открыть каталог
        </Link>
      </Reveal>
    </section>
  );
}

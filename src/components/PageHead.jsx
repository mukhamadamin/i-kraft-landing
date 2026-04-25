import { Link } from "react-router-dom";

export function PageHead({ eyebrow, title, subtitle, children }) {
  return (
    <section className="container page-head reveal-item">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </section>
  );
}

export function SectionHead({ eyebrow, title, subtitle, link }) {
  return (
    <div className="section-head reveal-item">
      <div className="section-head-text">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {link ? (
        <Link to={link.to} className="btn btn-secondary btn-inline" style={{ flexShrink: 0, alignSelf: "flex-end" }}>
          {link.label} →
        </Link>
      ) : null}
    </div>
  );
}

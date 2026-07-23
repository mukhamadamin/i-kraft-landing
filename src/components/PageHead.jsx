import { Link } from "react-router-dom";
import { Reveal, SplitText } from "./motion";

export function PageHead({ eyebrow, title, subtitle, children }) {
  return (
    <section className="container page-head">
      {eyebrow ? (
        <Reveal as="p" variant="down" className="eyebrow">
          {eyebrow}
        </Reveal>
      ) : null}
      <h1>
        <SplitText text={title} step={45} />
      </h1>
      {subtitle ? (
        <Reveal as="p" delay={140}>
          {subtitle}
        </Reveal>
      ) : null}
      {children ? (
        <Reveal delay={220} style={{ width: "100%" }}>
          {children}
        </Reveal>
      ) : null}
    </section>
  );
}

export function SectionHead({ eyebrow, title, subtitle, link }) {
  return (
    <div className="section-head">
      <div className="section-head-text">
        {eyebrow ? (
          <Reveal as="p" variant="down" className="eyebrow" style={{ alignSelf: "flex-start" }}>
            {eyebrow}
          </Reveal>
        ) : null}
        <Reveal as="h2" delay={80}>
          <SplitText text={title} step={40} />
        </Reveal>
        {subtitle ? (
          <Reveal as="p" delay={160}>
            {subtitle}
          </Reveal>
        ) : null}
      </div>
      {link ? (
        <Reveal variant="left" delay={200} style={{ flexShrink: 0 }}>
          <Link to={link.to} className="btn btn-secondary btn-inline">
            {link.label} <span className="btn-arrow">→</span>
          </Link>
        </Reveal>
      ) : null}
    </div>
  );
}

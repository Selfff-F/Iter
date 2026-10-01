import type { ArticleSection } from "../content/article";
import { useOnceInView } from "../hooks/useMotion";

export function SectionHeading({ section }: { section: ArticleSection }) {
  const { ref, visible } = useOnceInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`section-heading ${visible ? "is-visible" : ""}`}>
      <p className="section-number">{section.number}</p>
      <h2 id={`${section.id}-title`}>{section.title}</h2>
      <div className="section-rule" aria-hidden="true" />
    </div>
  );
}

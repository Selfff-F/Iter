import type { ArticleSection } from "../content/article";

interface SiteNavProps {
  sections: ArticleSection[];
  activeId: string;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onNavigate: () => void;
}

export function SiteNav({ sections, activeId, menuOpen, onMenuToggle, onNavigate }: SiteNavProps) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="返回专题封面">陪诊观察录</a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="chapter-navigation"
        onClick={onMenuToggle}
      >
        章节目录
      </button>
      <nav id="chapter-navigation" className={menuOpen ? "chapter-nav is-open" : "chapter-nav"} aria-label="文章章节">
        {sections.map((section) => (
          <a
            key={section.id}
            className={section.id === activeId ? "is-active" : undefined}
            href={`#${section.id}`}
            onClick={onNavigate}
          >
            {section.title}
          </a>
        ))}
      </nav>
    </header>
  );
}

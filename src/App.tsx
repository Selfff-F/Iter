import { useEffect, useState } from "react";
import { ArticleContent } from "./components/ArticleContent";
import { ReadingProgress } from "./components/ReadingProgress";
import { SectionHeading } from "./components/SectionHeading";
import { SiteNav } from "./components/SiteNav";
import { article } from "./content/article";
import "./styles/app.css";

export default function App() {
  const [activeId, setActiveId] = useState(article.sections[0]?.id ?? "introduction");
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
      setShowBackToTop(window.scrollY > 640);
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const sectionElements = article.sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visible) setActiveId(visible.target.id);
    }, { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.1, 0.5] });
    sectionElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="top" className="site-shell">
      <ReadingProgress progress={progress} />
      <SiteNav
        sections={article.sections}
        activeId={activeId}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        onNavigate={closeMenu}
      />

      <main>
        <section className="hero" aria-labelledby="site-title">
          <div className="hero__layout">
            <div className="hero__content">
              <p className="hero__eyebrow eyebrow">数据新闻 · 老龄化与陪诊服务</p>
              <h1 id="site-title">{article.title}</h1>
              <p className="hero__summary">一位 65 岁老人独自就医，用整整五小时走完一次看诊。</p>
              <a className="button button--primary hero__action" href="#introduction">开始阅读 <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero__media" aria-hidden="true">
              <img src="/images/cover.png" alt="" />
            </div>
          </div>
          <div className="hero__facts" aria-label="核心数据">
            <div><strong>5小时</strong><span>一次就医耗时</span></div>
            <div><strong>15.9%</strong><span>老年人口占比</span></div>
            <div><strong>达到四成</strong><span>空巢老年家庭</span></div>
          </div>
        </section>

        <div className="article-shell">
          {article.sections.map((section) => (
            <section id={section.id} className="article-section" key={section.id} aria-labelledby={`${section.id}-title`}>
              <SectionHeading section={section} />
              <ArticleContent section={section} />
            </section>
          ))}
        </div>
      </main>

      <aside className="section-dots" aria-label="章节快速跳转">
        {article.sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} className={section.id === activeId ? "is-active" : undefined} aria-label={`跳转至${section.title}`}>
            <span />
          </a>
        ))}
      </aside>

      <button
        className={showBackToTop ? "back-to-top is-visible" : "back-to-top"}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        返回顶部 ↑
      </button>
    </div>
  );
}

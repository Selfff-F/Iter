import { useEffect, useState } from "react";
import { EndMatterScreen } from "./components/EndMatterScreen";
import { ReadingProgress } from "./components/ReadingProgress";
import { SiteNav } from "./components/SiteNav";
import { StoryScreen } from "./components/StoryScreen";
import { article } from "./content/article";
import { storyScreensBySection } from "./content/storyScreens";
import { useScreenTransitions } from "./hooks/useScreenTransitions";
import "./styles/app.css";

export default function App() {
  const [activeId, setActiveId] = useState(article.sections[0]?.id ?? "introduction");
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  useScreenTransitions();

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
    const sectionElements = Array.from(document.querySelectorAll<HTMLElement>(".story-screen[data-section-id]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
      if (visible) setActiveId((visible.target as HTMLElement).dataset.sectionId ?? "introduction");
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
          <div className="hero__visual" aria-hidden="true">
            <img className="hero__background" src="/images/hero.png" alt="" />
          </div>
          <div className="hero__overlay" aria-hidden="true" />
          <div className="hero__bottom-fade" aria-hidden="true" />
          <div className="hero__content">
            <h1 id="site-title">{article.title}</h1>
            <p className="hero__summary">一位 65 岁老人独自就医，用整整五小时走完一次看诊。</p>
          </div>
        </section>

        <div className="article-backdrop-region">
          <div className="article-backdrop" aria-hidden="true">
            <div className="article-backdrop__viewport">
              <div className="article-backdrop__canvas">
                <span className="article-backdrop__photo article-backdrop__photo--ward" />
                <span className="article-backdrop__photo article-backdrop__photo--surgery" />
                <span className="article-backdrop__photo article-backdrop__photo--corridor" />
                <span className="article-backdrop__photo article-backdrop__photo--ct" />
                <span className="article-backdrop__photo article-backdrop__photo--stethoscope" />
                <span className="article-backdrop__photo article-backdrop__photo--medical-tools" />
                <span className="article-backdrop__photo article-backdrop__photo--wheelchair" />
              </div>
            </div>
            <div className="article-backdrop__noise" />
          </div>

          <div className="article-shell">
            {article.sections.map((section) => (
              <section id={section.id} className="article-section" key={section.id} aria-labelledby={`${section.id}-title`}>
                {storyScreensBySection[section.id].map((screen) => (
                  <StoryScreen key={screen.id} screen={screen} section={section} />
                ))}
              </section>
            ))}
            <EndMatterScreen />
          </div>
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

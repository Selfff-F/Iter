import { endMatter } from "../content/endMatter";

export function EndMatterScreen() {
  return (
    <section
      id="references"
      className="story-screen story-screen--end-matter screen-transition"
      data-section-id="conclusion"
      aria-labelledby="references-title"
    >
      <div className="story-screen__inner screen-transition__inner end-matter">
        <header className="end-matter__header">
          <span>资料与说明</span>
          <h2 id="references-title">{endMatter.title}</h2>
        </header>

        <section className="end-matter__references" aria-labelledby="reference-list-title">
          <h3 id="reference-list-title">参考文献</h3>
          <ol>
            {endMatter.references.map((reference) => (
              <li key={reference.number}>
                <cite>{reference.title}</cite>
                {reference.url && (
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    查看原文 <span aria-hidden="true">↗</span>
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="end-matter__stories" aria-labelledby="story-source-title">
          <h3 id="story-source-title">故事素材来源</h3>
          <ul>
            {endMatter.storySources.map((source) => <li key={source}>{source}</li>)}
          </ul>
        </section>

        <section className="end-matter__about" aria-labelledby="about-title">
          <h3 id="about-title">{endMatter.aboutTitle}</h3>
          <dl>
            <div>
              <dt>作者</dt>
              <dd>{endMatter.about.author}</dd>
            </div>
            <div className="end-matter__about-origin">
              <dt>报道缘起</dt>
              <dd>{endMatter.about.origin}</dd>
            </div>
            <div>
              <dt>数据来源说明</dt>
              <dd>{endMatter.about.dataSource}</dd>
            </div>
            <div>
              <dt>版权说明</dt>
              <dd>{endMatter.about.copyright}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}

import type { ArticleSection } from "../content/article";
import type { StoryScreenData } from "../content/storyScreens";
import { ArticleContent } from "./ArticleContent";
import { SectionHeading } from "./SectionHeading";

export function StoryScreen({ screen, section }: { screen: StoryScreenData; section: ArticleSection }) {
  const classes = [
    "story-screen",
    "screen-transition",
    `story-screen--${screen.kind}`,
    screen.layout ? `story-screen--${screen.layout}` : "",
    screen.chartIds.length > 1 ? "story-screen--multi-chart" : "",
  ].filter(Boolean).join(" ");

  const content = (
    <div className="story-screen__inner screen-transition__inner">
      {screen.includeHeading && <SectionHeading section={section} />}
      <ArticleContent screen={screen} />
    </div>
  );

  return (
    <div id={screen.id} className={classes} data-section-id={screen.sectionId}>
      {screen.kind === "carousel" ? <div className="carousel-stage">{content}</div> : content}
    </div>
  );
}

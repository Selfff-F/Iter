import { getChartLayout, type ChartId } from "../content/article";
import type { StoryScreenData } from "../content/storyScreens";
import { ChartFrame } from "./ChartFrame";
import { CoreCharts } from "./CoreCharts";
import { PlatformCarousel } from "./PlatformCarousel";
import { PolicyTimelineChart } from "./PolicyTimelineChart";
import { SecondaryCharts, type ImplementedChartId } from "./SecondaryCharts";
import { WordCloudChart } from "./WordCloudChart";

export function ArticleContent({ screen }: { screen: StoryScreenData }) {
  const renderChart = (chartId: ChartId) => {
    if (chartId === "08") {
      return <WordCloudChart key={`${screen.id}-chart-${chartId}`} />;
    }
    if (chartId === "12") {
      return <PolicyTimelineChart key={`${screen.id}-chart-${chartId}`} />;
    }
    if (chartId === "01" || chartId === "02") {
      return <CoreCharts key={`${screen.id}-chart-${chartId}`} chartId={chartId} />;
    }
    if (["03", "04", "05", "06", "07", "09", "10", "11", "13"].includes(chartId)) {
      return <SecondaryCharts key={`${screen.id}-chart-${chartId}`} chartId={chartId as ImplementedChartId} />;
    }
    return (
      <ChartFrame key={`${screen.id}-chart-${chartId}`} chartId={chartId}>
        <p className="chart-message">本图表将在下一轮实现</p>
      </ChartFrame>
    );
  };

  const hasCharts = screen.chartIds.length > 0;
  const hasCopy = screen.paragraphs.length > 0;
  const splitChartIds = hasCopy
    ? screen.chartIds.filter((chartId) => getChartLayout(chartId) === "split")
    : [];
  const pairChartIds = screen.chartIds.filter((chartId) => getChartLayout(chartId) === "pair");
  const fullChartIds = screen.chartIds.filter((chartId) => !splitChartIds.includes(chartId) && !pairChartIds.includes(chartId));
  const bodyClass = screen.carouselId
    ? "story-screen__body story-screen__body--carousel"
    : hasCharts
      ? "story-screen__body story-screen__body--charts"
      : "story-screen__body story-screen__body--text-only";

  const copy = hasCopy ? (
    <div className="story-screen__copy">
      {screen.paragraphs.map((paragraph, index) => <p key={`${screen.id}-paragraph-${index}`}>{paragraph}</p>)}
    </div>
  ) : null;

  return (
    <div className={bodyClass}>
      {screen.carouselId ? (
        <>
          {copy}
          {screen.carouselId === "platforms" && <PlatformCarousel />}
        </>
      ) : hasCharts ? (
        <>
          {splitChartIds.length > 0 ? (
            <div className="story-screen__layout story-screen__layout--split">
              {copy}
              <div className="story-screen__visuals story-screen__visuals--split">
                {splitChartIds.map(renderChart)}
              </div>
            </div>
          ) : copy}
          {pairChartIds.length > 0 && (
            <div className="story-screen__visuals story-screen__visuals--pair">
              {pairChartIds.map(renderChart)}
            </div>
          )}
          {fullChartIds.length > 0 && (
            <div className="story-screen__visuals story-screen__visuals--full">
              {fullChartIds.map(renderChart)}
            </div>
          )}
        </>
      ) : (
        copy
      )}
    </div>
  );
}

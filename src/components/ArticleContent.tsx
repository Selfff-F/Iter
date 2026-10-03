import type { ChartId } from "../content/article";
import type { StoryScreenData } from "../content/storyScreens";
import { ChartFrame } from "./ChartFrame";
import { CoreCharts } from "./CoreCharts";
import { PlatformCarousel } from "./PlatformCarousel";
import { SecondaryCharts, type ImplementedChartId } from "./SecondaryCharts";

export function ArticleContent({ screen }: { screen: StoryScreenData }) {
  const renderChart = (chartId: ChartId) => {
    if (chartId === "01" || chartId === "02") {
      return <CoreCharts key={`${screen.id}-chart-${chartId}`} chartId={chartId} />;
    }
    if (["03", "04", "05", "06", "07", "08", "09", "10", "11"].includes(chartId)) {
      return <SecondaryCharts key={`${screen.id}-chart-${chartId}`} chartId={chartId as ImplementedChartId} />;
    }
    return (
      <ChartFrame key={`${screen.id}-chart-${chartId}`} chartId={chartId}>
        <p className="chart-message">本图表将在下一轮实现</p>
      </ChartFrame>
    );
  };

  const hasCharts = screen.chartIds.length > 0;
  const bodyClass = screen.carouselId
    ? "story-screen__body story-screen__body--carousel"
    : hasCharts
      ? `story-screen__body story-screen__body--${screen.chartIds.length > 1 ? "multi-chart" : "single-chart"}`
      : "story-screen__body story-screen__body--text-only";

  return (
    <div className={bodyClass}>
      {screen.paragraphs.length > 0 && (
        <div className="story-screen__copy">
          {screen.paragraphs.map((paragraph, index) => <p key={`${screen.id}-paragraph-${index}`}>{paragraph}</p>)}
        </div>
      )}
      {screen.carouselId === "platforms" && <PlatformCarousel />}
      {hasCharts && (
        <div className="story-screen__visuals">
          {screen.chartIds.map(renderChart)}
        </div>
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { getChartLayout, type ArticleSection, type ChartId } from "../content/article";
import { CoreCharts } from "./CoreCharts";
import { SecondaryCharts } from "./SecondaryCharts";
import { RevealGroup } from "./RevealGroup";

interface ArticleContentProps {
  section: ArticleSection;
}

export function ArticleContent({ section }: ArticleContentProps) {
  const renderedBlocks: ReactNode[] = [];
  let paragraphs: ReactNode[] = [];
  let groupIndex = 0;

  const createParagraphGroups = (items: ReactNode[]) => {
    const groups: ReactNode[] = [];
    for (let index = 0; index < items.length; index += 3) {
      groups.push(<RevealGroup key={`${section.id}-group-${groupIndex++}`}>{items.slice(index, index + 3)}</RevealGroup>);
    }
    return groups;
  };

  const flushParagraphs = () => {
    if (!paragraphs.length) return;
    renderedBlocks.push(...createParagraphGroups(paragraphs));
    paragraphs = [];
  };

  const renderChart = (chartId: ChartId) => {
    if (chartId === "01" || chartId === "02") {
      return <CoreCharts key={`${section.id}-chart-${chartId}`} chartId={chartId} />;
    }
    return <SecondaryCharts key={`${section.id}-chart-${chartId}`} chartId={chartId} />;
  };

  section.blocks.forEach((block, index) => {
    if (block.type === "paragraph") {
      paragraphs.push(<p key={`${section.id}-paragraph-${index}`}>{block.content}</p>);
      return;
    }
    const chart = renderChart(block.chartId);
    if (getChartLayout(block.chartId) === "split" && paragraphs.length) {
      const copy = createParagraphGroups(paragraphs);
      paragraphs = [];
      renderedBlocks.push(
        <div className="article-split" key={`${section.id}-split-${block.chartId}`}>
          <div className="article-split__copy">{copy}</div>
          <div className="article-split__chart">{chart}</div>
        </div>,
      );
      return;
    }
    flushParagraphs();
    renderedBlocks.push(chart);
  });
  flushParagraphs();

  return (
    <div className="article-content">{renderedBlocks}</div>
  );
}

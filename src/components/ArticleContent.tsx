import type { ReactNode } from "react";
import type { ArticleSection } from "../content/article";
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

  const flushParagraphs = () => {
    if (!paragraphs.length) return;
    for (let index = 0; index < paragraphs.length; index += 3) {
      renderedBlocks.push(<RevealGroup key={`${section.id}-group-${groupIndex++}`}>{paragraphs.slice(index, index + 3)}</RevealGroup>);
    }
    paragraphs = [];
  };

  section.blocks.forEach((block, index) => {
    if (block.type === "paragraph") {
      paragraphs.push(<p key={`${section.id}-paragraph-${index}`}>{block.content}</p>);
      return;
    }
    flushParagraphs();
    if (block.chartId === "01" || block.chartId === "02") {
      renderedBlocks.push(<CoreCharts key={`${section.id}-chart-${block.chartId}`} chartId={block.chartId} />);
      return;
    }
    if (block.chartId === "03" || block.chartId === "04" || block.chartId === "05") {
      renderedBlocks.push(<SecondaryCharts key={`${section.id}-chart-${block.chartId}`} chartId={block.chartId} />);
      return;
    }
  });
  flushParagraphs();

  return (
    <div className="article-content">{renderedBlocks}</div>
  );
}

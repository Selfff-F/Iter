import articleSource from "../../docs/article.md?raw";
import contentSource from "../../docs/content.md?raw";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type ChartId = `${Digit}${Digit}`;
export type ChartLayout = "full" | "split" | "pair";

export interface ChartMetadata {
  title: string;
  dataFile: string;
  source: string;
  unit: string;
  conclusion: string;
}

interface ChartCatalogEntry extends ChartMetadata {
  layout: ChartLayout;
}

export type ArticleBlock =
  | { type: "paragraph"; content: string }
  | { type: "carousel"; carouselId: "platforms" }
  | { type: "chart"; chartId: ChartId };

export interface ArticleSection {
  id: string;
  number: string;
  title: string;
  blocks: ArticleBlock[];
}

const sectionIds: Record<string, string> = {
  导语: "introduction",
  老龄化双重现实: "aging",
  数字门槛: "digital-barrier",
  陪诊行业应运而生: "accompaniment",
  陪诊赛道下半场: "industry",
  结尾: "conclusion",
};

function cleanField(value: string | undefined) {
  return (value ?? "").replace(/^`|`$/g, "").trim();
}

function parseChartTitles(source: string) {
  const titles: Record<string, string> = {};
  for (const match of source.matchAll(/<!--图表(\d{2})：(.+?)-->/g)) {
    titles[match[1]] = match[2].trim();
  }
  return titles;
}

function parseChartCatalog(source: string, titles: Record<string, string>) {
  const charts: Record<string, ChartCatalogEntry> = {};

  for (const rawLine of source.replace(/\r/g, "").split("\n")) {
    const parts = rawLine.trim().split("｜").map((part) => part.trim());
    const chartMatch = parts[0]?.match(/^图表\s*(\d{2})$/);
    if (!chartMatch) continue;

    const fields = Object.fromEntries(parts.slice(1).map((part) => {
      const separator = part.indexOf("：");
      return separator < 0
        ? [part, ""]
        : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
    }));
    const chartId = chartMatch[1];
    charts[chartId] = {
      title: titles[chartId] ?? `图表 ${chartId}`,
      dataFile: cleanField(fields["数据文件"]),
      layout: fields["布局"] === "split" || fields["布局"] === "pair" ? fields["布局"] : "full",
      source: cleanField(fields["来源"]),
      unit: cleanField(fields["单位"]),
      conclusion: cleanField(fields["结论"]),
    };
  }

  return charts;
}

const chartTitles = parseChartTitles(articleSource);
const chartCatalog = parseChartCatalog(contentSource, chartTitles);

export const chartIds = Object.keys(chartCatalog)
  .sort((first, second) => Number(first) - Number(second)) as ChartId[];

const chartIdSet = new Set<string>(chartIds);

function isChartId(value: string): value is ChartId {
  return chartIdSet.has(value);
}

function flushParagraph(lines: string[], blocks: ArticleBlock[]) {
  const content = lines.join(" ").trim();
  if (content) blocks.push({ type: "paragraph", content });
  lines.length = 0;
}

export function parseArticle(source: string): { title: string; sections: ArticleSection[] } {
  const lines = source.replace(/\r/g, "").split("\n");
  const title = lines.find((line) => line.trim())?.trim() ?? "陪诊观察录";
  const sections: ArticleSection[] = [];
  let current: ArticleSection | undefined;
  let paragraphLines: string[] = [];

  for (const rawLine of lines.slice(lines.indexOf(title) + 1)) {
    const line = rawLine.trim();
    const heading = line.match(/^#####\s+(.+)$/);
    if (heading) {
      if (current) flushParagraph(paragraphLines, current.blocks);
      const sectionTitle = heading[1].trim();
      current = {
        id: sectionIds[sectionTitle] ?? `section-${sections.length + 1}`,
        number: String(sections.length + 1).padStart(2, "0"),
        title: sectionTitle,
        blocks: [],
      };
      sections.push(current);
      paragraphLines = [];
      continue;
    }

    if (!current) continue;
    if (/^<!--轮播01：陪诊服务平台-->$/.test(line)) {
      flushParagraph(paragraphLines, current.blocks);
      current.blocks.push({ type: "carousel", carouselId: "platforms" });
      continue;
    }
    const chart = line.match(/^<!--图表(\d{2})：.*-->$/);
    if (chart) {
      flushParagraph(paragraphLines, current.blocks);
      if (isChartId(chart[1])) current.blocks.push({ type: "chart", chartId: chart[1] });
      continue;
    }
    if (/^<!--.*-->$/.test(line)) {
      flushParagraph(paragraphLines, current.blocks);
      continue;
    }
    if (!line) {
      flushParagraph(paragraphLines, current.blocks);
    } else {
      paragraphLines.push(line);
    }
  }
  if (current) flushParagraph(paragraphLines, current.blocks);

  return { title, sections };
}

export const article = parseArticle(articleSource);

export const chartLayouts = Object.fromEntries(
  chartIds.map((chartId) => [chartId, chartCatalog[chartId].layout]),
) as Record<ChartId, ChartLayout>;

export function getChartLayout(chartId: ChartId): ChartLayout {
  return chartLayouts[chartId] ?? "full";
}

export const chartMetadata = Object.fromEntries(
  chartIds.map((chartId) => {
    const { layout: _layout, ...metadata } = chartCatalog[chartId];
    return [chartId, metadata];
  }),
) as Record<ChartId, ChartMetadata>;

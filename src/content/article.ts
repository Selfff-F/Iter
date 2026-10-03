import articleSource from "../../docs/article.md?raw";
import contentSource from "../../docs/content.md?raw";

export const chartIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"] as const;
export type ChartId = (typeof chartIds)[number];
export type ChartLayout = "full" | "split";

export interface ChartMetadata {
  title: string;
  dataFile: string;
  source: string;
  unit: string;
  conclusion: string;
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
    const chart = line.match(/^<!--图表((?:0[1-9]|1[01]))：.*-->$/);
    if (chart) {
      flushParagraph(paragraphLines, current.blocks);
      current.blocks.push({ type: "chart", chartId: chart[1] as ChartId });
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

const chartTitles: Record<ChartId, string> = {
  "01": "2016—2025年全国65岁及以上人口数量及占比",
  "02": "2000—2020年中国老年家庭空巢化基本情况",
  "03": "中国60周岁及以上老年人慢性病患病情况",
  "04": "中国就医老年人年龄结构",
  "05": "中国60周岁及以上老年人跨区就医情况",
  "06": "我国60周岁及以上老年人智能手机使用情况",
  "07": "陪诊服务的核心流程",
  "08": "陪诊服务需求对象占比",
  "09": "我国陪诊相关现存企业所属地区分布",
  "10": "大厂入局行动线",
  "11": "老年受访者对医院智慧终端的建议",
};

function isChartId(value: string): value is ChartId {
  return (chartIds as readonly string[]).includes(value);
}

function cleanTableCell(value: string | undefined) {
  return (value ?? "").replace(/^`|`$/g, "").trim();
}

function parseChartTable(source: string): Partial<Record<ChartId, ChartMetadata & { layout: ChartLayout }>> {
  const lines = source.replace(/\r/g, "").split("\n");
  const headerIndex = lines.findIndex((line) => line.includes("| 编号 ") && line.includes("| 布局 "));
  if (headerIndex < 0) return {};

  const headerCells = lines[headerIndex].split("|").map((cell) => cell.trim());
  const chartIndex = headerCells.indexOf("编号");
  const dataFileIndex = headerCells.indexOf("数据文件");
  const layoutIndex = headerCells.indexOf("布局");
  const sourceIndex = headerCells.indexOf("来源");
  const unitIndex = headerCells.indexOf("单位");
  const conclusionIndex = headerCells.indexOf("结论");
  if ([chartIndex, dataFileIndex, layoutIndex, sourceIndex, unitIndex, conclusionIndex].some((index) => index < 0)) return {};

  const charts: Partial<Record<ChartId, ChartMetadata & { layout: ChartLayout }>> = {};
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").map((cell) => cell.trim());
    const chartMatch = cells[chartIndex]?.match(/^图表\s*((?:0[1-9]|1[01]))$/);
    const chartId = chartMatch?.[1];
    if (!chartId || !isChartId(chartId)) continue;
    charts[chartId] = {
      title: chartTitles[chartId],
      dataFile: cleanTableCell(cells[dataFileIndex]),
      layout: cells[layoutIndex] === "split" ? "split" : "full",
      source: cleanTableCell(cells[sourceIndex]),
      unit: cleanTableCell(cells[unitIndex]),
      conclusion: cleanTableCell(cells[conclusionIndex]),
    };
  }

  return charts;
}

const chartTable = parseChartTable(contentSource);

export const chartLayouts = Object.fromEntries(
  chartIds.map((chartId) => [chartId, chartTable[chartId]?.layout ?? "full"]),
) as Record<ChartId, ChartLayout>;

export function getChartLayout(chartId: ChartId): ChartLayout {
  return chartLayouts[chartId] ?? "full";
}

export const chartMetadata = Object.fromEntries(
  chartIds.map((chartId) => [chartId, chartTable[chartId] ?? {
    title: chartTitles[chartId],
    dataFile: "—",
    source: "—",
    unit: "—",
    conclusion: "—",
  }]),
) as Record<ChartId, ChartMetadata>;

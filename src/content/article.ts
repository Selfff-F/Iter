import articleSource from "../../docs/article.md?raw";
import contentSource from "../../docs/content.md?raw";

export type ChartId = "01" | "02" | "03" | "04" | "05";
export type ChartLayout = "full" | "split";

export type ArticleBlock =
  | { type: "paragraph"; content: string }
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
    const chart = line.match(/^<!--图表(0[1-5])：.*-->$/);
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

function parseChartLayouts(source: string): Partial<Record<ChartId, ChartLayout>> {
  const lines = source.replace(/\r/g, "").split("\n");
  const headerIndex = lines.findIndex((line) => line.includes("| 编号 ") && line.includes("| 布局 "));
  if (headerIndex < 0) return {};

  const headerCells = lines[headerIndex].split("|").map((cell) => cell.trim());
  const chartIndex = headerCells.indexOf("编号");
  const layoutIndex = headerCells.indexOf("布局");
  if (chartIndex < 0 || layoutIndex < 0) return {};

  const layouts: Partial<Record<ChartId, ChartLayout>> = {};
  for (const line of lines.slice(headerIndex + 2)) {
    if (!line.trim().startsWith("|")) break;
    const cells = line.split("|").map((cell) => cell.trim());
    const chartMatch = cells[chartIndex]?.match(/^图表\s*(0[1-5])$/);
    if (!chartMatch) continue;
    layouts[chartMatch[1] as ChartId] = cells[layoutIndex] === "split" ? "split" : "full";
  }

  return layouts;
}

export const chartLayouts = parseChartLayouts(contentSource);

export function getChartLayout(chartId: ChartId): ChartLayout {
  return chartLayouts[chartId] ?? "full";
}

export const chartMetadata: Record<ChartId, { title: string; conclusion: string }> = {
  "01": { title: "2016—2025年65岁及以上人口数量及占比", conclusion: "老年人口规模和占比持续增长，2025年占比达到15.9%。" },
  "02": { title: "2000—2020年空巢老年家庭变化", conclusion: "夫妻与独居空巢老年家庭均明显增长，达到四成老年家庭为空巢家庭。" },
  "03": { title: "老年人智能手机使用比例", conclusion: "老年人智能手机使用仍有缺口，数字医疗流程可能成为就医障碍。" },
  "04": { title: "陪诊服务的核心流程", conclusion: "现有数据呈现挂号、问诊与检查三步协助流程。" },
  "05": { title: "大厂入局行动线", conclusion: "平台探索与入局构成陪诊行业的发展轨迹。" },
};

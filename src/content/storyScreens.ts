import { article, type ArticleSection, type ChartId } from "./article";

export type StoryScreenKind = "standard" | "carousel" | "closing";
export type StoryScreenLayout = "chart-only";

export interface StoryScreenData {
  id: string;
  sectionId: string;
  kind: StoryScreenKind;
  layout?: StoryScreenLayout;
  includeHeading: boolean;
  paragraphs: string[];
  chartIds: ChartId[];
  carouselId?: "platforms";
}

function getSection(sectionId: string) {
  const section = article.sections.find((item) => item.id === sectionId);
  if (!section) throw new Error(`Missing article section: ${sectionId}`);
  return section;
}

function getParagraphs(section: ArticleSection) {
  return section.blocks
    .filter((block) => block.type === "paragraph")
    .map((block) => block.content);
}

function createScreen(
  id: string,
  sectionId: string,
  paragraphIndexes: number[],
  chartIds: ChartId[] = [],
  options: Partial<Pick<StoryScreenData, "kind" | "layout" | "includeHeading" | "carouselId">> = {},
): StoryScreenData {
  const paragraphs = getParagraphs(getSection(sectionId));
  return {
    id,
    sectionId,
    kind: options.kind ?? "standard",
    layout: options.layout,
    includeHeading: options.includeHeading ?? false,
    paragraphs: paragraphIndexes.map((index) => paragraphs[index]).filter((paragraph): paragraph is string => Boolean(paragraph)),
    chartIds,
    carouselId: options.carouselId,
  };
}

export const storyScreens: StoryScreenData[] = [
  createScreen("screen-introduction", "introduction", [0, 1], [], { includeHeading: true }),

  createScreen("screen-aging-population", "aging", [0], ["01"], { includeHeading: true }),
  createScreen("screen-aging-empty-nest", "aging", [1], ["02"]),
  createScreen("screen-aging-medical", "aging", [2, 3], ["03", "04"]),

  createScreen("screen-digital-barrier", "digital-barrier", [0], ["05"], { includeHeading: true }),
  createScreen("screen-who-accompanies", "digital-barrier", [1]),

  createScreen("screen-accompaniment-service", "accompaniment", [0], ["06", "07"], { includeHeading: true }),
  createScreen("screen-platform-carousel", "accompaniment", [1], [], { kind: "carousel", carouselId: "platforms" }),
  createScreen("screen-public-opinion", "accompaniment", [2], ["08"]),
  createScreen("screen-accompaniment-value", "accompaniment", [3]),
  createScreen("screen-company-stock", "accompaniment", [4], ["09"]),
  createScreen("screen-company-distribution", "accompaniment", [], ["10"]),

  createScreen("screen-industry-entry", "industry", [0], ["11"], { includeHeading: true }),
  createScreen("screen-industry-rules", "industry", [1]),
  createScreen("screen-industry-policy-timeline", "industry", [], ["12"], { layout: "chart-only" }),

  createScreen("screen-conclusion", "conclusion", [0, 1], ["13"], { kind: "closing", includeHeading: true }),
  createScreen("screen-return-to-zheng", "conclusion", [2, 3], [], { kind: "closing" }),
];

export const storyScreensBySection = Object.fromEntries(
  article.sections.map((section) => [section.id, storyScreens.filter((screen) => screen.sectionId === section.id)]),
) as Record<string, StoryScreenData[]>;

import { article, type ArticleSection, type ChartId } from "./article";

export type StoryScreenKind = "standard" | "carousel" | "closing";

export interface StoryScreenData {
  id: string;
  sectionId: string;
  kind: StoryScreenKind;
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
  options: Partial<Pick<StoryScreenData, "kind" | "includeHeading" | "carouselId">> = {},
): StoryScreenData {
  const paragraphs = getParagraphs(getSection(sectionId));
  return {
    id,
    sectionId,
    kind: options.kind ?? "standard",
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
  createScreen("screen-aging-chronic-disease", "aging", [2], ["03"]),
  createScreen("screen-aging-medical", "aging", [3], ["04", "05"]),

  createScreen("screen-digital-barrier", "digital-barrier", [0], ["06"], { includeHeading: true }),
  createScreen("screen-who-accompanies", "digital-barrier", [1]),

  createScreen("screen-accompaniment-service", "accompaniment", [0], ["07", "08"], { includeHeading: true }),
  createScreen("screen-platform-carousel", "accompaniment", [1], [], { kind: "carousel", carouselId: "platforms" }),
  createScreen("screen-company-distribution", "accompaniment", [2], ["09"]),
  createScreen("screen-public-opinion", "accompaniment", [3]),
  createScreen("screen-accompaniment-value", "accompaniment", [4]),

  createScreen("screen-industry-entry", "industry", [0], ["10"], { includeHeading: true }),
  createScreen("screen-industry-rules", "industry", [1]),

  createScreen("screen-conclusion", "conclusion", [0, 1], ["11"], { kind: "closing", includeHeading: true }),
  createScreen("screen-return-to-zheng", "conclusion", [2, 3], [], { kind: "closing" }),
];

export const storyScreensBySection = Object.fromEntries(
  article.sections.map((section) => [section.id, storyScreens.filter((screen) => screen.sectionId === section.id)]),
) as Record<string, StoryScreenData[]>;

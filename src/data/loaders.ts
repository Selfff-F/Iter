import type { ChartId } from "../content/article";

export interface PopulationRow { year: number; elderlyPopulation: number; share: number }
export interface EmptyNestRow { year: number; couple: number; solo: number; share: number }
export interface SmartphoneRow { indicator: string; value: number }
export interface FlowRow { step: number; title: string; description: string; icon: string }
export interface TimelineRow { date: string; category: string; title: string; description: string; source: string }

export interface SiteData {
  "01": PopulationRow[];
  "02": EmptyNestRow[];
  "03": SmartphoneRow[];
  "04": FlowRow[];
  "05": TimelineRow[];
}

let firstChartDataPromise: Promise<Pick<SiteData, "01" | "02">> | undefined;
let secondaryChartDataPromise: Promise<Pick<SiteData, "03" | "04" | "05">> | undefined;

function parseCsv(input: string): Record<string, string>[] {
  const [header, ...rows] = input.trim().split(/\r?\n/);
  const keys = header.split(",").map((key) => key.trim());
  return rows.filter(Boolean).map((row) => Object.fromEntries(row.split(",").map((value, index) => [keys[index], value.trim()])));
}

async function text(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法加载数据：${path}`);
  return response.text();
}

export async function loadSiteData(): Promise<SiteData> {
  const [populationCsv, nestCsv, usageCsv, flowJson, timelineCsv] = await Promise.all([
    text("/data/elderly_population_2016_2025.csv"),
    text("/data/empty_nest_households_2000_2020.csv"),
    text("/data/elderly_smartphone_usage.csv"),
    text("/data/accompaniment_service_flow.json"),
    text("/data/accompaniment_industry_timeline.csv"),
  ]);
  return {
    "01": parseCsv(populationCsv).map((row) => ({ year: Number(row.year), elderlyPopulation: Number(row.elderly_population), share: Number(row.elderly_population_share) })),
    "02": parseCsv(nestCsv).map((row) => ({ year: Number(row.year), couple: Number(row.couple_empty_nest_households), solo: Number(row.solo_empty_nest_households), share: Number(row.empty_nest_share) })),
    "03": parseCsv(usageCsv).map((row) => ({ indicator: row.indicator, value: Number(row.value) })),
    "04": JSON.parse(flowJson) as FlowRow[],
    "05": parseCsv(timelineCsv).map((row) => ({ date: row.date, category: row.category, title: row.title, description: row.description, source: row.source })),
  };
}

export async function loadFirstChartData(): Promise<Pick<SiteData, "01" | "02">> {
  firstChartDataPromise ??= Promise.all([
    text("/data/elderly_population_2016_2025.csv"),
    text("/data/empty_nest_households_2000_2020.csv"),
  ]).then(([populationCsv, nestCsv]) => ({
    "01": parseCsv(populationCsv).map((row) => ({ year: Number(row.year), elderlyPopulation: Number(row.elderly_population), share: Number(row.elderly_population_share) })),
    "02": parseCsv(nestCsv).map((row) => ({ year: Number(row.year), couple: Number(row.couple_empty_nest_households), solo: Number(row.solo_empty_nest_households), share: Number(row.empty_nest_share) })),
  }));
  return firstChartDataPromise;
}

export async function loadSecondaryChartData(): Promise<Pick<SiteData, "03" | "04" | "05">> {
  secondaryChartDataPromise ??= Promise.all([
    text("/data/elderly_smartphone_usage.csv"),
    text("/data/accompaniment_service_flow.json"),
    text("/data/accompaniment_industry_timeline.csv"),
  ]).then(([usageCsv, flowJson, timelineCsv]) => ({
    "03": parseCsv(usageCsv).map((row) => ({ indicator: row.indicator, value: Number(row.value) })),
    "04": JSON.parse(flowJson) as FlowRow[],
    "05": parseCsv(timelineCsv).map((row) => ({ date: row.date, category: row.category, title: row.title, description: row.description, source: row.source })),
  }));
  return secondaryChartDataPromise;
}

export type ChartData = SiteData[ChartId];

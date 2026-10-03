import type { ChartId } from "../content/article";

export interface PopulationRow { year: number; elderlyPopulation: number; share: number }
export interface EmptyNestRow { year: number; couple: number; solo: number; share: number }
export interface ChronicDiseaseRow { disease: string; rate: number }
export interface AgeStructureRow { ageGroup: string; ratio: number }
export interface CrossRegionMedicalRow { type: string; visits: number; ratio: number }
export interface SmartphoneRow { indicator: string; value: number; unit: string; source: string }
export interface FlowRow { step: number; title: string; description: string; icon: string }
export interface ServiceUserRow { type: string; ratio: number }
export interface CompanyDistributionRow { region: string; ratio: number }
export interface TimelineRow { date: string; category: string; title: string; description: string; source: string }
export interface FriendlySuggestionRow { suggestion: string; ratio: number }
export interface ChinaGeoJsonFeature {
  type: "Feature";
  properties: { name: string; adcode?: string; [key: string]: unknown };
  geometry: { type: string; coordinates: unknown };
}
export interface ChinaGeoJson {
  type: "FeatureCollection";
  features: ChinaGeoJsonFeature[];
}

export interface SiteData {
  "01": PopulationRow[];
  "02": EmptyNestRow[];
  "03": ChronicDiseaseRow[];
  "04": AgeStructureRow[];
  "05": CrossRegionMedicalRow[];
  "06": SmartphoneRow[];
  "07": FlowRow[];
  "08": ServiceUserRow[];
  "09": CompanyDistributionRow[];
  "10": TimelineRow[];
  "11": FriendlySuggestionRow[];
}

let siteDataPromise: Promise<SiteData> | undefined;
let chinaGeoJsonPromise: Promise<ChinaGeoJson> | undefined;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}

function parseCsv(input: string): Record<string, string>[] {
  const [header, ...rows] = input.trim().split(/\r?\n/);
  const keys = parseCsvLine(header);
  return rows
    .filter((row) => row.trim())
    .map((row) => Object.fromEntries(parseCsvLine(row).map((value, index) => [keys[index], value])));
}

async function text(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`无法加载数据：${path}`);
  return response.text();
}

export async function loadSiteData(): Promise<SiteData> {
  siteDataPromise ??= Promise.all([
    text("/data/elderly_population_2016_2025.csv"),
    text("/data/empty_nest_households_2000_2020.csv"),
    text("/data/chronic_disease.csv"),
    text("/data/elderly_age_structure.csv"),
    text("/data/cross_region_medical.csv"),
    text("/data/elderly_smartphone_usage.csv"),
    text("/data/accompaniment_service_flow.json"),
    text("/data/service_users_ratio.csv"),
    text("/data/company_distribution.csv"),
    text("/data/accompaniment_industry_timeline.csv"),
    text("/data/friendly_medical_suggestions.csv"),
  ]).then(([
    populationCsv,
    nestCsv,
    diseaseCsv,
    ageCsv,
    crossRegionCsv,
    smartphoneCsv,
    flowJson,
    serviceUsersCsv,
    companyCsv,
    timelineCsv,
    suggestionsCsv,
  ]) => ({
    "01": parseCsv(populationCsv).map((row) => ({ year: Number(row.year), elderlyPopulation: Number(row.elderly_population), share: Number(row.elderly_population_share) })),
    "02": parseCsv(nestCsv).map((row) => ({ year: Number(row.year), couple: Number(row.couple_empty_nest_households), solo: Number(row.solo_empty_nest_households), share: Number(row.empty_nest_share) })),
    "03": parseCsv(diseaseCsv).map((row) => ({ disease: row.disease, rate: Number(row.rate) })),
    "04": parseCsv(ageCsv).map((row) => ({ ageGroup: row.age_group, ratio: Number(row.ratio) })),
    "05": parseCsv(crossRegionCsv).map((row) => ({ type: row.type, visits: Number(row.visits), ratio: Number(row.ratio) })),
    "06": parseCsv(smartphoneCsv).map((row) => ({ indicator: row.indicator, value: Number(row.value), unit: row.unit, source: row.source })),
    "07": JSON.parse(flowJson) as FlowRow[],
    "08": parseCsv(serviceUsersCsv).map((row) => ({ type: row.type, ratio: Number(row.ratio) })),
    "09": parseCsv(companyCsv).map((row) => ({ region: row.region, ratio: Number(row.ratio) })),
    "10": parseCsv(timelineCsv).map((row) => ({ date: row.date, category: row.category, title: row.title, description: row.description, source: row.source })),
    "11": parseCsv(suggestionsCsv).map((row) => ({ suggestion: row.suggestion, ratio: Number(row.ratio) })),
  }));

  return siteDataPromise;
}

export async function loadFirstChartData(): Promise<Pick<SiteData, "01" | "02">> {
  const data = await loadSiteData();
  return { "01": data["01"], "02": data["02"] };
}

export async function loadImplementedChartData(): Promise<Pick<SiteData, "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11">> {
  const data = await loadSiteData();
  return {
    "03": data["03"],
    "04": data["04"],
    "05": data["05"],
    "06": data["06"],
    "07": data["07"],
    "08": data["08"],
    "09": data["09"],
    "10": data["10"],
    "11": data["11"],
  };
}

export async function loadChinaGeoJson(): Promise<ChinaGeoJson> {
  chinaGeoJsonPromise ??= text("/data/china-provinces.geojson").then((source) => JSON.parse(source) as ChinaGeoJson);
  return chinaGeoJsonPromise;
}

export type ChartData = SiteData[ChartId];

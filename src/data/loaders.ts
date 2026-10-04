import { chartIds, chartMetadata } from "../content/article";

export interface PopulationRow { year: number; elderlyPopulation: number; share: number }
export interface EmptyNestRow { year: number; couple: number; solo: number; share: number }
export interface AgeStructureRow { ageGroup: string; ratio: number }
export interface CrossRegionMedicalRow { type: string; visits: number; ratio: number }
export interface SmartphoneRow { indicator: string; value: number; unit: string; source: string }
export interface FlowRow { step: number; title: string; description: string; icon: string }
export interface ServiceUserRow { type: string; ratio: number }
export interface CompanyDistributionRow { region: string; ratio: number }
export interface WordCloudRow { word: string; weight: number }
export interface CompanyStockRow { year: number; count: number }
export interface TimelineRow { date: string; category: string; title: string; description: string; source: string }
export interface PolicyTimelineRow { date: string; title: string; description: string; source: string }
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
  "03": AgeStructureRow[];
  "04": CrossRegionMedicalRow[];
  "05": SmartphoneRow[];
  "06": FlowRow[];
  "07": ServiceUserRow[];
  "08": WordCloudRow[];
  "09": CompanyStockRow[];
  "10": CompanyDistributionRow[];
  "11": TimelineRow[];
  "12": PolicyTimelineRow[];
  "13": FriendlySuggestionRow[];
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

const dataParsers: Record<keyof SiteData, (source: string) => SiteData[keyof SiteData]> = {
  "01": (source) => parseCsv(source).map((row) => ({ year: Number(row.year), elderlyPopulation: Number(row.elderly_population), share: Number(row.elderly_population_share) })),
  "02": (source) => parseCsv(source).map((row) => ({ year: Number(row.year), couple: Number(row.couple_empty_nest_households), solo: Number(row.solo_empty_nest_households), share: Number(row.empty_nest_share) })),
  "03": (source) => parseCsv(source).map((row) => ({ ageGroup: row.age_group, ratio: Number(row.ratio) })),
  "04": (source) => parseCsv(source).map((row) => ({ type: row.type, visits: Number(row.visits), ratio: Number(row.ratio) })),
  "05": (source) => parseCsv(source).map((row) => ({ indicator: row.indicator, value: Number(row.value), unit: row.unit, source: row.source })),
  "06": (source) => JSON.parse(source) as FlowRow[],
  "07": (source) => parseCsv(source).map((row) => ({ type: row.type, ratio: Number(row.ratio) })),
  "08": (source) => parseCsv(source).map((row) => ({ word: row.word, weight: Number(row.weight) })),
  "09": (source) => parseCsv(source).map((row) => ({ year: Number(row.year), count: Number(row.count) })),
  "10": (source) => parseCsv(source).map((row) => ({ region: row.region, ratio: Number(row.ratio) })),
  "11": (source) => parseCsv(source).map((row) => ({ date: row.date, category: row.category, title: row.title, description: row.description, source: row.source })),
  "12": (source) => parseCsv(source).map((row) => ({ date: row.date, title: row.title, description: row.description, source: row.source })),
  "13": (source) => parseCsv(source).map((row) => ({ suggestion: row.suggestion, ratio: Number(row.ratio) })),
};

export async function loadSiteData(): Promise<SiteData> {
  siteDataPromise ??= Promise.all(chartIds.map(async (chartId) => {
    if (!(chartId in dataParsers)) throw new Error(`缺少图表 ${chartId} 的数据解析器`);
    const dataFile = chartMetadata[chartId]?.dataFile;
    if (!dataFile) throw new Error(`图表 ${chartId} 未配置数据文件`);
    const source = await text(`/data/${dataFile}`);
    return [chartId, dataParsers[chartId as keyof SiteData](source)] as const;
  })).then((entries) => Object.fromEntries(entries) as unknown as SiteData);

  return siteDataPromise;
}

export async function loadFirstChartData(): Promise<Pick<SiteData, "01" | "02">> {
  const data = await loadSiteData();
  return { "01": data["01"], "02": data["02"] };
}

export async function loadWordCloudData(): Promise<WordCloudRow[]> {
  const data = await loadSiteData();
  return data["08"];
}

export async function loadPolicyTimelineData(): Promise<PolicyTimelineRow[]> {
  const data = await loadSiteData();
  return data["12"];
}

export type ImplementedSecondaryChartId = "03" | "04" | "05" | "06" | "07" | "09" | "10" | "11" | "13";

export async function loadImplementedChartData(): Promise<Pick<SiteData, ImplementedSecondaryChartId>> {
  const data = await loadSiteData();
  return {
    "03": data["03"],
    "04": data["04"],
    "05": data["05"],
    "06": data["06"],
    "07": data["07"],
    "09": data["09"],
    "10": data["10"],
    "11": data["11"],
    "13": data["13"],
  };
}

export async function loadChinaGeoJson(): Promise<ChinaGeoJson> {
  chinaGeoJsonPromise ??= text("/data/china-provinces.geojson").then((source) => JSON.parse(source) as ChinaGeoJson);
  return chinaGeoJsonPromise;
}

export type ChartData = SiteData[keyof SiteData];

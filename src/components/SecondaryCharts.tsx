import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import type { EChartsOption, EChartsType, ECElementEvent } from "echarts";
import type {
  AgeStructureRow,
  CompanyDistributionRow,
  CompanyStockRow,
  CrossRegionMedicalRow,
  FlowRow,
  FriendlySuggestionRow,
  ImplementedSecondaryChartId,
  ServiceUserRow,
  SiteData,
  SmartphoneRow,
  TimelineRow,
} from "../data/loaders";
import { loadChinaGeoJson, loadImplementedChartData } from "../data/loaders";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ChartFrame } from "./ChartFrame";
import { EChart } from "./EChart";

export type ImplementedChartId = ImplementedSecondaryChartId;
type ImplementedChartData = Pick<SiteData, ImplementedChartId>;

function chartColors() {
  const styles = getComputedStyle(document.documentElement);
  const palette = Array.from({ length: 8 }, (_, index) => styles.getPropertyValue(`--chart-${index + 1}`).trim());
  return {
    palette,
    primary: palette[0],
    secondary: palette[1],
    tertiary: palette[2],
    fourth: palette[3],
    grid: palette[4],
    text: styles.getPropertyValue("--color-text-muted").trim(),
    surface: styles.getPropertyValue("--color-surface").trim(),
  };
}

function baseTooltip(color: ReturnType<typeof chartColors>) {
  return {
    trigger: "item" as const,
    backgroundColor: color.surface,
    borderColor: color.grid,
    textStyle: { color: color.primary },
  };
}

function donutOption(data: Array<AgeStructureRow | ServiceUserRow>, labelKey: "ageGroup" | "type"): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary, color.secondary, color.tertiary, color.fourth],
    tooltip: { ...baseTooltip(color), formatter: "{b}<br/>{c}%" },
    legend: { bottom: 0, textStyle: { color: color.text } },
    series: [{
      name: "占比",
      type: "pie",
      radius: ["43%", "70%"],
      center: ["50%", "45%"],
      avoidLabelOverlap: true,
      label: { color: color.primary, formatter: "{b}\n{c}%" },
      labelLine: { lineStyle: { color: color.grid } },
      data: data.map((row) => ({
        name: labelKey === "ageGroup" ? (row as AgeStructureRow).ageGroup : (row as ServiceUserRow).type,
        value: row.ratio,
      })),
    }],
  };
}

function roseOption(data: ServiceUserRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: color.palette.slice(0, 4),
    tooltip: { ...baseTooltip(color), formatter: "{b}<br/>占比：{c}%" },
    legend: { bottom: 0, textStyle: { color: color.text, fontSize: 11 } },
    series: [{
      name: "陪诊服务需求对象占比",
      type: "pie",
      roseType: "area",
      radius: ["17%", "66%"],
      center: ["50%", "43%"],
      startAngle: 90,
      itemStyle: { borderColor: color.surface, borderWidth: 2, borderRadius: 6 },
      label: { color: color.primary, formatter: "{b}\n{c}%", lineHeight: 17 },
      labelLine: { lineStyle: { color: color.grid } },
      emphasis: { focus: "self", scale: true, scaleSize: 8 },
      blur: { itemStyle: { opacity: 0.45 } },
      data: data.map((row) => ({ name: row.type, value: row.ratio })),
    }],
  };
}

function crossRegionOption(data: CrossRegionMedicalRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: color.palette.slice(0, 2),
    tooltip: { trigger: "axis", backgroundColor: color.surface, borderColor: color.grid, textStyle: { color: color.primary } },
    legend: { bottom: 0, textStyle: { color: color.text } },
    grid: { top: 44, right: 38, bottom: 62, left: 38, containLabel: true },
    xAxis: { type: "category", data: data.map((row) => row.type), axisTick: { show: false }, axisLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
    yAxis: [
      { type: "value", name: "万人次", nameTextStyle: { color: color.text }, splitLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
      { type: "value", name: "%", max: 100, nameTextStyle: { color: color.text }, splitLine: { show: false }, axisLabel: { color: color.text } },
    ],
    series: [
      { name: "就医人次", type: "bar", barMaxWidth: 56, data: data.map((row) => row.visits), itemStyle: { borderRadius: [7, 7, 0, 0] } },
      { name: "占比", type: "bar", yAxisIndex: 1, barMaxWidth: 34, data: data.map((row) => row.ratio), itemStyle: { borderRadius: [7, 7, 0, 0] } },
    ],
  };
}

function horizontalBarOption(data: FriendlySuggestionRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary],
    tooltip: { ...baseTooltip(color), valueFormatter: (value) => `${value}%` },
    grid: { top: 20, right: 56, bottom: 20, left: 10, containLabel: true },
    xAxis: { type: "value", max: 70, name: "%", nameTextStyle: { color: color.text }, splitLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
    yAxis: {
      type: "category",
      inverse: true,
      data: data.map((row) => row.suggestion),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: color.grid } },
      axisLabel: { color: color.text, width: 220, overflow: "break", lineHeight: 17 },
    },
    series: [{
      name: "受访者占比",
      type: "bar",
      barMaxWidth: 38,
      data: data.map((row) => row.ratio),
      label: { show: true, position: "right", color: color.primary, formatter: "{c}%" },
      itemStyle: { borderRadius: [0, 8, 8, 0] },
    }],
  };
}

function companyStockOption(data: CompanyStockRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary],
    tooltip: {
      trigger: "axis",
      backgroundColor: color.surface,
      borderColor: color.grid,
      textStyle: { color: color.primary },
      valueFormatter: (value) => `${value} 家`,
    },
    grid: { top: 28, right: 24, bottom: 34, left: 28, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((row) => row.year),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: color.grid } },
      axisLabel: { color: color.text },
    },
    yAxis: {
      type: "value",
      name: "家",
      nameTextStyle: { color: color.text },
      splitLine: { lineStyle: { color: color.grid } },
      axisLabel: { color: color.text },
    },
    series: [{
      name: "企业存量",
      type: "bar",
      barMaxWidth: 42,
      data: data.map((row) => row.count),
      itemStyle: { borderRadius: [7, 7, 0, 0] },
    }],
  };
}

function smartphoneCompositeOption(data: SmartphoneRow[]): EChartsOption {
  const color = chartColors();
  const population = data.slice(0, 3);
  const applications = data.slice(3, 7);
  const progressColors = color.palette.slice(0, 4);

  return {
    color: color.palette,
    tooltip: {
      ...baseTooltip(color),
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        const scope = point.seriesName === "全体老人"
          ? "全体60岁及以上老年人"
          : "会使用智能手机的老年人中（各项独立，以100%为分母）";
        return `${scope}<br/>${point.name}：${point.value}%`;
      },
    },
    title: [
      { text: "全体老人", subtext: "三项合计 100%", left: "25%", top: 0, textAlign: "center", textStyle: { color: color.primary, fontSize: 14 }, subtextStyle: { color: color.text, fontSize: 11 } },
      { text: "会用智能手机的人中", subtext: "四项独立计算，不相加", left: "75%", top: 0, textAlign: "center", textStyle: { color: color.primary, fontSize: 14 }, subtextStyle: { color: color.text, fontSize: 11 } },
    ],
    legend: [
      { data: population.map((row) => row.indicator), left: "3%", bottom: 0, width: "44%", textStyle: { color: color.text, fontSize: 11 } },
      {
        id: "smartphone-applications-legend",
        data: applications.map((row) => row.indicator),
        right: "3%",
        bottom: 0,
        width: "44%",
        itemStyle: { opacity: 0.3 },
        lineStyle: { opacity: 0.3 },
        textStyle: { color: color.text, fontSize: 11, opacity: 0.3 },
      },
    ],
    series: [
      {
        name: "全体老人",
        type: "pie",
        center: ["25%", "46%"],
        radius: ["29%", "48%"],
        label: { color: color.primary, formatter: "{b}\n{c}%" },
        labelLine: { lineStyle: { color: color.grid } },
        data: population.map((row) => ({ name: row.indicator, value: row.value })),
      },
      ...applications.map((row, index) => ({
        name: "智能手机应用能力",
        type: "pie" as const,
        center: ["75%", "46%"],
        radius: [`${25 + index * 9}%`, `${31 + index * 9}%`],
        startAngle: 90,
        clockwise: true,
        silent: false,
        label: { show: false },
        emphasis: { scale: false, itemStyle: { opacity: 1 } },
        data: [
          { name: row.indicator, value: row.value, itemStyle: { color: progressColors[index], opacity: 0.3 } },
          { name: `${row.indicator}未达到`, value: 100 - row.value, itemStyle: { color: color.grid, opacity: 0.3 }, tooltip: { show: false } },
        ],
      })),
    ],
  };
}

const provinceRegions: Record<string, string> = {
  北京市: "华北地区", 天津市: "华北地区", 河北省: "华北地区", 山西省: "华北地区", 内蒙古自治区: "华北地区",
  辽宁省: "东北地区", 吉林省: "东北地区", 黑龙江省: "东北地区",
  上海市: "华东地区", 江苏省: "华东地区", 浙江省: "华东地区", 安徽省: "华东地区", 福建省: "华东地区", 江西省: "华东地区", 山东省: "华东地区", 台湾省: "华东地区",
  河南省: "华中地区", 湖北省: "华中地区", 湖南省: "华中地区",
  广东省: "华南地区", 广西壮族自治区: "华南地区", 海南省: "华南地区", 香港特别行政区: "华南地区", 澳门特别行政区: "华南地区", 南海诸岛: "华南地区",
  重庆市: "西南地区", 四川省: "西南地区", 贵州省: "西南地区", 云南省: "西南地区", 西藏自治区: "西南地区",
  陕西省: "西北地区", 甘肃省: "西北地区", 青海省: "西北地区", 宁夏回族自治区: "西北地区", 新疆维吾尔自治区: "西北地区",
};

function chinaMapOption(data: CompanyDistributionRow[], isMobile: boolean): EChartsOption {
  const color = chartColors();
  const ratios = Object.fromEntries(data.map((row) => [row.region, row.ratio]));
  const regionColors = Object.fromEntries(data.map((row, index) => [row.region, color.palette[index]]));
  const provinces = Object.entries(provinceRegions).map(([name, region]) => ({
    name,
    region,
    value: ratios[region],
    itemStyle: { areaColor: regionColors[region] },
  }));

  return {
    tooltip: {
      ...baseTooltip(color),
      formatter: (params) => {
        const point = (Array.isArray(params) ? params[0] : params).data as { name: string; region: string; value: number } | undefined;
        return point ? `${point.name}<br/>${point.region.replace(/地区$/, "")} · ${point.value}%` : "暂无数据";
      },
    },
    title: {
      text: "按大区近似",
      right: 12,
      top: 8,
      textStyle: { color: color.text, fontSize: 12, fontWeight: "normal" },
    },
    series: [{
      name: "企业分布",
      type: "map",
      map: "china-provinces",
      roam: true,
      scaleLimit: { min: 1, max: 6 },
      layoutCenter: ["50%", isMobile ? "43%" : "48%"],
      layoutSize: isMobile ? "88%" : "102%",
      selectedMode: false,
      label: { show: false },
      emphasis: {
        label: { show: true, color: color.primary },
        itemStyle: { areaColor: color.palette[7], borderColor: color.surface },
      },
      itemStyle: { borderColor: color.surface, borderWidth: 0.8 },
      data: provinces,
    }],
  };
}

function timelineOption(data: TimelineRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary],
    tooltip: {
      ...baseTooltip(color),
      formatter: (params) => {
        const point = (Array.isArray(params) ? params[0] : params).data as { event: TimelineRow };
        return `${point.event.date} · ${point.event.category}<br/>${point.event.title}<br/>${point.event.description}`;
      },
    },
    grid: { top: 82, right: 34, bottom: 34, left: 34, containLabel: true },
    xAxis: { type: "category", data: data.map((row) => row.date), axisLine: { lineStyle: { color: color.grid, width: 2 } }, axisTick: { show: false }, axisLabel: { color: color.text } },
    yAxis: { type: "value", min: 0, max: 1, show: false },
    series: [{
      name: "平台行动",
      type: "line",
      data: data.map((row) => ({ value: 0.5, event: row })),
      symbol: "circle",
      symbolSize: 16,
      lineStyle: { width: 3 },
      label: { show: true, position: "top", color: color.primary, formatter: (params) => (params.data as { event: TimelineRow }).event.title, lineHeight: 18 },
    }],
  };
}

function FlowDiagram({ data }: { data: FlowRow[] }) {
  return (
    <ol className="flow-diagram" aria-label="陪诊服务核心流程">
      {data.map((step, index) => (
        <li key={step.step}>
          <span className="flow-diagram__number">{String(step.step).padStart(2, "0")}</span>
          <strong>{step.title}</strong>
          <small>{step.description}</small>
          {index < data.length - 1 && <i aria-hidden="true">→</i>}
        </li>
      ))}
    </ol>
  );
}

function MobileTimeline({ data }: { data: TimelineRow[] }) {
  return (
    <ol className="mobile-timeline" aria-label="陪诊行业平台行动时间线">
      {data.map((event) => (
        <li key={`${event.date}-${event.title}`}>
          <span>{event.date}</span>
          <div>
            <small>{event.category}</small>
            <strong>{event.title}</strong>
            <p>{event.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function createOption(chartId: ImplementedChartId, data: ImplementedChartData, isMobile: boolean): EChartsOption | undefined {
  if (chartId === "03") return donutOption(data["03"], "ageGroup");
  if (chartId === "04") return crossRegionOption(data["04"]);
  if (chartId === "05") return smartphoneCompositeOption(data["05"]);
  if (chartId === "07") return roseOption(data["07"]);
  if (chartId === "09") return companyStockOption(data["09"]);
  if (chartId === "10") return chinaMapOption(data["10"], isMobile);
  if (chartId === "11") return timelineOption(data["11"]);
  if (chartId === "13") return horizontalBarOption(data["13"]);
  return undefined;
}

const ariaLabels: Record<Exclude<ImplementedChartId, "06">, string> = {
  "03": "中国就医老年人年龄结构环形图",
  "04": "中国60周岁及以上老年人跨区就医情况柱状图",
  "05": "老年人智能手机使用情况子母环图",
  "07": "陪诊服务需求对象占比环形图",
  "09": "陪诊服务相关企业存量柱状图",
  "10": "我国陪诊相关现存企业大区分布中国地图",
  "11": "陪诊行业平台行动时间线",
  "13": "老年受访者对医院智慧终端建议水平条形图",
};

export function SecondaryCharts({ chartId }: { chartId: ImplementedChartId }) {
  const [data, setData] = useState<ImplementedChartData>();
  const [error, setError] = useState<string>();
  const [mapReady, setMapReady] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const mapChartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    let mounted = true;
    loadImplementedChartData()
      .then((loaded) => { if (mounted) setData(loaded); })
      .catch(() => { if (mounted) setError("数据暂时无法加载"); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (chartId !== "10") return;
    let mounted = true;
    loadChinaGeoJson()
      .then((geoJson) => {
        echarts.registerMap("china-provinces", geoJson as Parameters<typeof echarts.registerMap>[1]);
        if (mounted) setMapReady(true);
      })
      .catch(() => { if (mounted) setError("地图数据暂时无法加载"); });
    return () => { mounted = false; };
  }, [chartId]);

  const option = useMemo(
    () => data && (chartId !== "10" || mapReady) ? createOption(chartId, data, isMobile) : undefined,
    [chartId, data, isMobile, mapReady],
  );

  const bindChartInteractions = useCallback((chart: EChartsType) => {
    if (chartId === "10") {
      mapChartRef.current = chart;
      return () => { mapChartRef.current = null; };
    }
    if (chartId !== "05") return undefined;

    const rightSeries = [1, 2, 3, 4];
    let locked = false;
    const setRightLegendActive = (active: boolean) => {
      const opacity = active ? 1 : 0.3;
      chart.setOption({
        legend: [{
          id: "smartphone-applications-legend",
          itemStyle: { opacity },
          lineStyle: { opacity },
          textStyle: { opacity },
        }],
      });
    };
    const downplayRight = () => rightSeries.forEach((seriesIndex) => chart.dispatchAction({ type: "downplay", seriesIndex }));
    const reset = () => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
      downplayRight();
      setRightLegendActive(false);
    };
    const activate = (dataIndex: number) => {
      chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex });
      rightSeries.forEach((seriesIndex) => chart.dispatchAction({ type: "highlight", seriesIndex }));
      setRightLegendActive(true);
    };
    const handleMouseOver = (event: ECElementEvent) => {
      if (locked || event.seriesIndex !== 0) return;
      reset();
      if (event.name === "会使用智能手机") {
        activate(event.dataIndex);
      }
    };
    const handleMouseOut = (event: ECElementEvent) => {
      if (!locked && event.seriesIndex === 0) reset();
    };
    const handleClick = (event: ECElementEvent) => {
      if (event.seriesIndex === 0 && event.name === "会使用智能手机") {
        locked = !locked;
        if (locked) activate(event.dataIndex);
        else reset();
        return;
      }
      locked = false;
      reset();
    };
    const handleCanvasClick = (event: { target?: unknown }) => {
      if (event.target) return;
      locked = false;
      reset();
    };
    const handleGlobalOut = () => {
      if (!locked) reset();
    };

    chart.on("mouseover", handleMouseOver);
    chart.on("mouseout", handleMouseOut);
    chart.on("click", handleClick);
    chart.getZr().on("click", handleCanvasClick);
    chart.getZr().on("globalout", handleGlobalOut);
    return () => {
      chart.off("mouseover", handleMouseOver);
      chart.off("mouseout", handleMouseOut);
      chart.off("click", handleClick);
      chart.getZr().off("click", handleCanvasClick);
      chart.getZr().off("globalout", handleGlobalOut);
    };
  }, [chartId]);

  const resetMapHighlight = useCallback(() => {
    mapChartRef.current?.dispatchAction({ type: "downplay", seriesIndex: 0 });
  }, []);

  const highlightMapRegion = useCallback((region: string) => {
    const chart = mapChartRef.current;
    if (!chart) return;
    resetMapHighlight();
    Object.entries(provinceRegions).forEach(([, provinceRegion], dataIndex) => {
      if (provinceRegion === region) chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex });
    });
  }, [resetMapHighlight]);

  if (error) return <ChartFrame chartId={chartId}><p className="chart-message">{error}</p></ChartFrame>;
  if (!data) return <ChartFrame chartId={chartId}><p className="chart-message">正在加载数据…</p></ChartFrame>;
  if (chartId === "10" && !mapReady) return <ChartFrame chartId={chartId}><p className="chart-message">正在加载地图…</p></ChartFrame>;
  if (chartId === "06") return <ChartFrame chartId={chartId}><FlowDiagram data={data["06"]} /></ChartFrame>;
  if (chartId === "11" && isMobile) return <ChartFrame chartId={chartId}><MobileTimeline data={data["11"]} /></ChartFrame>;

  const renderedChart = (
    <EChart
      option={option!}
      ariaLabel={ariaLabels[chartId as Exclude<ImplementedChartId, "06">]}
      onChartReady={chartId === "05" || chartId === "10" ? bindChartInteractions : undefined}
    />
  );

  return (
    <ChartFrame chartId={chartId}>
      {chartId === "10" ? (
        <div className="map-chart">
          {renderedChart}
          <ul className="map-chart__legend" aria-label="七大区企业分布占比">
            {data["10"].map((row, index) => {
              const regionName = row.region.replace(/地区$/, "");
              return (
                <li key={row.region}>
                  <button
                    type="button"
                    className="map-chart__legend-button"
                    data-region={regionName}
                    onMouseEnter={() => highlightMapRegion(row.region)}
                    onMouseLeave={resetMapHighlight}
                    onFocus={() => highlightMapRegion(row.region)}
                    onBlur={resetMapHighlight}
                  >
                    <span className="map-chart__swatch" style={{ backgroundColor: chartColors().palette[index] }} aria-hidden="true" />
                    <span>{regionName} {row.ratio}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : chartId === "05" ? (
        <div className="smartphone-chart">
          {renderedChart}
          <button
            type="button"
            className="smartphone-chart__prompt"
            aria-describedby="smartphone-chart-tip"
          >
            <span aria-hidden="true">←</span>
            点击试试
            <span id="smartphone-chart-tip" className="smartphone-chart__tooltip" role="tooltip">
              点击'会使用智能手机'可查看具体功能使用情况
            </span>
          </button>
        </div>
      ) : renderedChart}
    </ChartFrame>
  );
}

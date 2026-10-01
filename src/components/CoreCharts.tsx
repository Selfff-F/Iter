import { useEffect, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import type { EmptyNestRow, PopulationRow } from "../data/loaders";
import { loadFirstChartData } from "../data/loaders";
import { ChartFrame } from "./ChartFrame";
import { EChart } from "./EChart";

type CoreChartData = { "01": PopulationRow[]; "02": EmptyNestRow[] };

function chartColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    primary: styles.getPropertyValue("--chart-1").trim(),
    secondary: styles.getPropertyValue("--chart-2").trim(),
    tertiary: styles.getPropertyValue("--chart-3").trim(),
    grid: styles.getPropertyValue("--chart-5").trim(),
    text: styles.getPropertyValue("--color-text-muted").trim(),
    surface: styles.getPropertyValue("--color-surface").trim(),
  };
}

function populationOption(data: PopulationRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary, color.secondary],
    tooltip: { trigger: "axis", backgroundColor: color.surface, borderColor: color.grid, textStyle: { color: color.primary } },
    legend: { bottom: 0, textStyle: { color: color.text } },
    grid: { top: 36, right: 28, bottom: 54, left: 42, containLabel: true },
    xAxis: { type: "category", data: data.map((row) => row.year), axisLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
    yAxis: [
      { type: "value", name: "人口规模", nameTextStyle: { color: color.text }, splitLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
      { type: "value", name: "占比", min: 0, max: 20, nameTextStyle: { color: color.text }, splitLine: { show: false }, axisLabel: { color: color.text } },
    ],
    series: [
      { name: "65岁及以上人口", type: "line", smooth: true, symbolSize: 7, data: data.map((row) => row.elderlyPopulation), lineStyle: { width: 3 } },
      { name: "占总人口比重", type: "line", yAxisIndex: 1, smooth: true, symbolSize: 7, data: data.map((row) => row.share), lineStyle: { width: 3 } },
    ],
  };
}

function emptyNestOption(data: EmptyNestRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary, color.tertiary, color.secondary],
    tooltip: { trigger: "axis", backgroundColor: color.surface, borderColor: color.grid, textStyle: { color: color.primary } },
    legend: { bottom: 0, textStyle: { color: color.text } },
    grid: { top: 36, right: 28, bottom: 54, left: 42, containLabel: true },
    xAxis: { type: "category", data: data.map((row) => row.year), axisLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
    yAxis: [
      { type: "value", name: "家庭数量", nameTextStyle: { color: color.text }, splitLine: { lineStyle: { color: color.grid } }, axisLabel: { color: color.text } },
      { type: "value", name: "空巢占比", min: 0, max: 50, nameTextStyle: { color: color.text }, splitLine: { show: false }, axisLabel: { color: color.text } },
    ],
    series: [
      { name: "夫妻空巢家庭", type: "bar", data: data.map((row) => row.couple), itemStyle: { borderRadius: [6, 6, 0, 0] } },
      { name: "独居空巢家庭", type: "bar", data: data.map((row) => row.solo), itemStyle: { borderRadius: [6, 6, 0, 0] } },
      { name: "空巢家庭占比", type: "line", yAxisIndex: 1, smooth: true, symbolSize: 8, data: data.map((row) => row.share), lineStyle: { width: 3 } },
    ],
  };
}

export function CoreCharts({ chartId }: { chartId: "01" | "02" }) {
  const [data, setData] = useState<CoreChartData>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;
    loadFirstChartData()
      .then((loaded) => { if (mounted) setData(loaded); })
      .catch(() => { if (mounted) setError("数据暂时无法加载"); });
    return () => { mounted = false; };
  }, []);

  const option = useMemo(() => {
    if (!data) return undefined;
    return chartId === "01" ? populationOption(data["01"]) : emptyNestOption(data["02"]);
  }, [chartId, data]);

  const file = chartId === "01" ? "elderly_population_2016_2025.csv" : "empty_nest_households_2000_2020.csv";
  if (error) return <ChartFrame chartId={chartId} dataFile={file}><p className="chart-message">{error}</p></ChartFrame>;
  if (!option) return <ChartFrame chartId={chartId} dataFile={file}><p className="chart-message">正在加载数据…</p></ChartFrame>;

  return (
    <ChartFrame chartId={chartId} dataFile={file}>
      <EChart option={option} ariaLabel={chartId === "01" ? "2016年至2025年65岁及以上人口数量及占比图" : "2000年至2020年空巢老年家庭变化图"} />
    </ChartFrame>
  );
}

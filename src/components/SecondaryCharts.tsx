import { useEffect, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import type { FlowRow, SmartphoneRow, TimelineRow } from "../data/loaders";
import { loadSecondaryChartData } from "../data/loaders";
import { ChartFrame } from "./ChartFrame";
import { EChart } from "./EChart";
import { useMediaQuery } from "../hooks/useMediaQuery";

type SecondaryChartData = { "03": SmartphoneRow[]; "04": FlowRow[]; "05": TimelineRow[] };

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

function smartphoneOption(data: SmartphoneRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary, color.tertiary],
    tooltip: { trigger: "item", backgroundColor: color.surface, borderColor: color.grid, textStyle: { color: color.primary }, valueFormatter: (value) => `${value}` },
    grid: { top: 24, right: 8, bottom: 24, left: 8, containLabel: true },
    xAxis: { type: "value", max: 100, show: false },
    yAxis: { type: "category", data: ["老年人智能手机使用"], show: false },
    series: data.map((row) => ({
      name: row.indicator,
      type: "bar" as const,
      stack: "total",
      barWidth: 56,
      data: [row.value],
      label: { show: true, position: "inside", formatter: `${row.indicator}\n${row.value}`, color: color.surface, fontWeight: 700 },
      itemStyle: { borderRadius: row.indicator.startsWith("使用") ? [8, 0, 0, 8] : [0, 8, 8, 0] },
    })),
  };
}

function timelineOption(data: TimelineRow[]): EChartsOption {
  const color = chartColors();
  return {
    color: [color.primary],
    tooltip: {
      trigger: "item",
      backgroundColor: color.surface,
      borderColor: color.grid,
      textStyle: { color: color.primary },
      formatter: (params) => {
        const point = (Array.isArray(params) ? params[0] : params).data as { event: TimelineRow };
        return `${point.event.date} · ${point.event.category}<br/>${point.event.title}`;
      },
    },
    grid: { top: 72, right: 32, bottom: 30, left: 32, containLabel: true },
    xAxis: { type: "category", data: data.map((row) => row.date), axisLine: { lineStyle: { color: color.grid, width: 2 } }, axisTick: { show: false }, axisLabel: { color: color.text } },
    yAxis: { type: "value", min: 0, max: 1, show: false },
    series: [{
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

export function SecondaryCharts({ chartId }: { chartId: "03" | "04" | "05" }) {
  const [data, setData] = useState<SecondaryChartData>();
  const [error, setError] = useState<string>();
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    let mounted = true;
    loadSecondaryChartData()
      .then((loaded) => { if (mounted) setData(loaded); })
      .catch(() => { if (mounted) setError("数据暂时无法加载"); });
    return () => { mounted = false; };
  }, []);

  const option = useMemo(() => {
    if (!data) return undefined;
    if (chartId === "03") return smartphoneOption(data["03"]);
    if (chartId === "05") return timelineOption(data["05"]);
    return undefined;
  }, [chartId, data]);

  const file = chartId === "03"
    ? "elderly_smartphone_usage.csv"
    : chartId === "04"
      ? "accompaniment_service_flow.json"
      : "accompaniment_industry_timeline.csv";

  if (error) return <ChartFrame chartId={chartId} dataFile={file}><p className="chart-message">{error}</p></ChartFrame>;
  if (!data) return <ChartFrame chartId={chartId} dataFile={file}><p className="chart-message">正在加载数据…</p></ChartFrame>;
  if (chartId === "04") return <ChartFrame chartId={chartId} dataFile={file}><FlowDiagram data={data["04"]} /></ChartFrame>;
  if (chartId === "05" && isMobile) return <ChartFrame chartId={chartId} dataFile={file}><MobileTimeline data={data["05"]} /></ChartFrame>;

  return (
    <ChartFrame chartId={chartId} dataFile={file}>
      <EChart option={option!} ariaLabel={chartId === "03" ? "老年人智能手机使用比例图" : "陪诊行业平台行动时间线"} />
    </ChartFrame>
  );
}

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useOnceInView } from "../hooks/useMotion";

interface EChartProps {
  option: EChartsOption;
  ariaLabel: string;
}

export function EChart({ option, ariaLabel }: EChartProps) {
  const chartRef = useRef<echarts.ECharts | null>(null);
  const hasAnimatedRef = useRef(false);
  const { ref: containerRef, visible, reducedMotion } = useOnceInView<HTMLDivElement>();
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const chart = echarts.init(container, undefined, { renderer: "svg" });
    chartRef.current = chart;
    hasAnimatedRef.current = false;
    chart.setOption({ ...option, animation: false }, { notMerge: true });
    chart.setOption({ tooltip: { triggerOn: isMobile ? "click" : "mousemove|click" } });
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [isMobile, option]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !visible || reducedMotion || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    chart.clear();
    chart.setOption({
      ...option,
      animation: true,
      animationDuration: isMobile ? 420 : 650,
      animationEasing: "cubicOut",
    }, { notMerge: true });
    chart.setOption({ tooltip: { triggerOn: isMobile ? "click" : "mousemove|click" } });
  }, [isMobile, option, reducedMotion, visible]);

  return <div ref={containerRef} className="echart" role="img" aria-label={ariaLabel} />;
}

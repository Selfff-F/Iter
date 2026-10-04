import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import "echarts-wordcloud";
import type { WordCloudRow } from "../data/loaders";
import { loadWordCloudData } from "../data/loaders";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useOnceInView } from "../hooks/useMotion";
import { ChartFrame } from "./ChartFrame";

interface WordGraphicElement {
  y: number;
  scaleX: number;
  scaleY: number;
  attr(properties: { y: number; scaleX: number; scaleY: number }): void;
  setStyle(style: { opacity: number }): void;
  animateTo(
    target: { y: number; scaleX: number; scaleY: number; style: { opacity: number } },
    options: { delay: number; duration: number; easing: string },
  ): void;
}

interface WordCloudSeriesModel {
  getData(): {
    getItemGraphicEl(index: number): WordGraphicElement | undefined;
  };
}

function chartPalette() {
  const styles = getComputedStyle(document.documentElement);
  return Array.from({ length: 8 }, (_, index) => styles.getPropertyValue(`--chart-${index + 1}`).trim());
}

function fontSizeFor(weight: number, minimum: number, maximum: number, outputMin: number, outputMax: number) {
  if (maximum === minimum) return outputMax;
  return outputMin + ((weight - minimum) / (maximum - minimum)) * (outputMax - outputMin);
}

function createWordCloudOption(data: WordCloudRow[], isMobile: boolean): EChartsOption {
  const themeWord = "陪诊服务";
  const palette = chartPalette();
  const weights = data.map((row) => row.weight);
  const minimum = Math.min(...weights);
  const maximum = Math.max(...weights);
  const sizeRange = isMobile ? [22, 44] : [36, 72];
  const themeFontSize = isMobile ? 52 : 82;
  const fontFamily = '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif';
  const wordData = data.map((row, index) => {
    const fontSize = fontSizeFor(row.weight, minimum, maximum, sizeRange[0], sizeRange[1]);
    return {
      name: row.word,
      value: row.weight,
      textStyle: {
        color: palette[(index + 1) % palette.length],
        fontFamily,
        fontSize,
      },
      emphasis: {
        focus: "self",
        textStyle: {
          fontFamily,
          fontSize: fontSize * 1.14,
          fontWeight: 700,
        },
      },
    };
  });

  return {
    animation: false,
    tooltip: {
      trigger: "item",
      triggerOn: isMobile ? "click" : "mousemove|click",
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        if (point.name === themeWord) return `主题：${themeWord}`;
        return `${point.name}<br/>词频：${point.value} 次`;
      },
    },
    series: [{
      type: "wordCloud",
      shape: "square",
      left: "center",
      top: "center",
      width: "100%",
      height: "100%",
      gridSize: 4,
      sizeRange,
      rotationRange: [0, 0],
      rotationStep: 0,
      drawOutOfBound: false,
      shrinkToFit: true,
      layoutAnimation: false,
      stateAnimation: { duration: 160, easing: "cubicOut" },
      textStyle: { fontFamily },
      data: [
        {
          name: themeWord,
          value: maximum + 1,
          textStyle: {
            color: palette[0],
            fontFamily,
            fontSize: themeFontSize,
            fontWeight: 700,
          },
          emphasis: {
            focus: "self",
            textStyle: {
              fontFamily,
              fontSize: themeFontSize * 1.08,
              fontWeight: 700,
            },
          },
        },
        ...wordData,
      ],
    }],
  } as EChartsOption;
}

export function WordCloudChart() {
  const [data, setData] = useState<WordCloudRow[]>();
  const [error, setError] = useState<string>();
  const [chartReady, setChartReady] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const hasPlayedRef = useRef(false);
  const { ref: blockRef, visible, reducedMotion } = useOnceInView<HTMLDivElement>(0.25);
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    let mounted = true;
    loadWordCloudData()
      .then((rows) => {
        if (mounted) setData([...rows].sort((first, second) => second.weight - first.weight));
      })
      .catch(() => {
        if (mounted) {
          setError("数据暂时无法加载");
          setRevealReady(true);
        }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    const chart = echarts.init(container, undefined, { renderer: "canvas" });
    chartRef.current = chart;
    setChartReady(true);
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !chartReady || !data || !visible) return;

    let frameId = 0;
    let attempts = 0;
    let cancelled = false;
    const shouldAnimate = !reducedMotion && !hasPlayedRef.current;
    chart.clear();
    chart.setOption(createWordCloudOption(data, isMobile), { notMerge: true });

    if (!shouldAnimate) {
      hasPlayedRef.current = true;
      setRevealReady(true);
      return;
    }

    const revealWords = () => {
      if (cancelled) return;
      attempts += 1;
      const model = (chart as unknown as {
        getModel(): { getSeriesByIndex(index: number): WordCloudSeriesModel };
      }).getModel();
      const seriesModel = model.getSeriesByIndex(0);
      const seriesData = seriesModel.getData();
      const wordCount = data.length + 1;
      const words = Array.from({ length: wordCount }, (_, index) => seriesData.getItemGraphicEl(index))
        .filter((element): element is WordGraphicElement => Boolean(element));

      if (words.length < wordCount && attempts < 60) {
        frameId = requestAnimationFrame(revealWords);
        return;
      }

      const finalStates = words.map((word) => ({
        y: word.y,
        scaleX: word.scaleX,
        scaleY: word.scaleY,
      }));
      words.forEach((word, index) => {
        const finalState = finalStates[index];
        word.setStyle({ opacity: 0 });
        word.attr({
          y: finalState.y + 8,
          scaleX: finalState.scaleX * 0.96,
          scaleY: finalState.scaleY * 0.96,
        });
      });
      chart.getZr().refreshImmediately();
      setRevealReady(true);
      words.forEach((word, index) => {
        const finalState = finalStates[index];
        word.animateTo(
          { ...finalState, style: { opacity: 1 } },
          { delay: index * 170, duration: 560, easing: "backOut" },
        );
      });
      hasPlayedRef.current = true;
    };

    frameId = requestAnimationFrame(revealWords);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [chartReady, data, isMobile, reducedMotion, visible]);

  return (
    <div ref={blockRef} className={`wordcloud-chart-block ${revealReady ? "is-visible" : ""}`}>
      <ChartFrame chartId="08">
        <div className="wordcloud-chart__stage">
          <div
            ref={canvasRef}
            className="wordcloud-chart__canvas"
            role="img"
            aria-label="关于陪诊服务微博用户评论的主题词云图"
          />
          {!data && <p className="wordcloud-chart__status">{error ?? "正在加载数据…"}</p>}
        </div>
      </ChartFrame>
    </div>
  );
}

import { useEffect, useState, type CSSProperties } from "react";
import { loadPolicyTimelineData, type PolicyTimelineRow } from "../data/loaders";
import { useOnceInView } from "../hooks/useMotion";
import { ChartFrame } from "./ChartFrame";

function readChartPalette() {
  const styles = getComputedStyle(document.documentElement);
  return Array.from({ length: 8 }, (_, index) =>
    styles.getPropertyValue(`--chart-${index + 1}`).trim(),
  );
}

export function PolicyTimelineChart() {
  const [events, setEvents] = useState<PolicyTimelineRow[]>();
  const [error, setError] = useState<string>();
  const [palette, setPalette] = useState<string[]>([]);
  const { ref, visible, reducedMotion } = useOnceInView<HTMLOListElement>(0.2);

  useEffect(() => {
    let mounted = true;
    setPalette(readChartPalette());
    loadPolicyTimelineData()
      .then((data) => {
        if (mounted) setEvents([...data].sort((a, b) => a.date.localeCompare(b.date)));
      })
      .catch(() => {
        if (mounted) setError("数据暂时无法加载");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ChartFrame chartId="12">
      {error ? (
        <p className="chart-message">{error}</p>
      ) : !events ? (
        <p className="chart-message">数据加载中…</p>
      ) : (
        <ol
          ref={ref}
          className={`policy-timeline ${visible || reducedMotion ? "is-visible" : ""}`}
          aria-label="陪诊服务行业产业政策时间线"
        >
          {events.map((event, index) => (
            <li
              key={`${event.date}-${event.title}`}
              className="policy-timeline__item"
              style={{
                "--policy-color": palette[index % palette.length] || `var(--chart-${(index % 8) + 1})`,
                "--policy-delay": `${index * 140}ms`,
              } as CSSProperties}
            >
              <span className="policy-timeline__dot" aria-hidden="true" />
              <article className="policy-timeline__card">
                <time dateTime={event.date}>{event.date.replace("-", ".")}</time>
                <strong>{event.title}</strong>
                <p>{event.description}</p>
                <small>来源：{event.source}</small>
              </article>
            </li>
          ))}
        </ol>
      )}
    </ChartFrame>
  );
}

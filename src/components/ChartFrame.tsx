import { useState, type ReactNode } from "react";
import { chartMetadata, type ChartId } from "../content/article";
import { useOnceInView } from "../hooks/useMotion";

interface ChartFrameProps {
  chartId: ChartId;
  dataFile: string;
  children: ReactNode;
}

export function ChartFrame({ chartId, dataFile, children }: ChartFrameProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { ref, visible } = useOnceInView<HTMLElement>();
  const metadata = chartMetadata[chartId];

  return (
    <figure ref={ref} className={`chart-frame ${visible ? "is-revealed" : ""}`} aria-labelledby={`chart-${chartId}-caption`}>
      <div className="chart-frame__header">
        <span>图表 {chartId}</span>
        <button type="button" className="chart-frame__details" onClick={() => setDrawerOpen(true)}>数据说明</button>
      </div>
      <div className="chart-frame__visual">{children}</div>
      <figcaption id={`chart-${chartId}-caption`} className="chart-frame__caption">
        <strong>{metadata.title}</strong>
        <span>{metadata.conclusion}</span>
        <small>数据来源：待补　单位：待补　统计口径：待补</small>
      </figcaption>

      {drawerOpen && (
        <div className="data-drawer" role="dialog" aria-modal="true" aria-labelledby={`drawer-${chartId}-title`}>
          <button className="data-drawer__backdrop" type="button" aria-label="关闭数据说明" onClick={() => setDrawerOpen(false)} />
          <aside className="data-drawer__panel">
            <div className="data-drawer__header">
              <p>图表 {chartId}</p>
              <button type="button" onClick={() => setDrawerOpen(false)}>关闭 ×</button>
            </div>
            <h3 id={`drawer-${chartId}-title`}>{metadata.title}</h3>
            <p>{metadata.conclusion}</p>
            <dl>
              <div><dt>数据文件</dt><dd>{dataFile}</dd></div>
              <div><dt>数据来源</dt><dd>待补</dd></div>
              <div><dt>单位</dt><dd>待补</dd></div>
              <div><dt>统计口径</dt><dd>待补</dd></div>
            </dl>
          </aside>
        </div>
      )}
    </figure>
  );
}

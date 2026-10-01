import type { ReactNode } from "react";
import { useOnceInView } from "../hooks/useMotion";

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
}

export function RevealGroup({ children, className = "" }: RevealGroupProps) {
  const { ref, visible } = useOnceInView<HTMLDivElement>(0.35);
  return <div ref={ref} className={`reveal-group ${visible ? "is-visible" : ""} ${className}`.trim()}>{children}</div>;
}

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useOnceInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, threshold]);

  return { ref, visible, reducedMotion };
}

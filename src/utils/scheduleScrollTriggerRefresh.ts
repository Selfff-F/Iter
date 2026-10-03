import { ScrollTrigger } from "gsap/ScrollTrigger";

let scheduledFrame: number | null = null;

export function scheduleScrollTriggerRefresh() {
  if (scheduledFrame !== null) return;

  scheduledFrame = window.requestAnimationFrame(() => {
    scheduledFrame = null;
    ScrollTrigger.sort();
    ScrollTrigger.refresh(true);
  });
}

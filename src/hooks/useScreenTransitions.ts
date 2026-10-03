import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./useMotion";

export function useScreenTransitions() {
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const carouselScreen = document.querySelector<HTMLElement>(".story-screen--carousel");
      const screens = gsap.utils.toArray<HTMLElement>(".screen-transition:not(.story-screen--carousel)");
      screens.forEach((screen) => {
        const content = screen.querySelector<HTMLElement>(".screen-transition__inner");
        if (!content) return;

        const isBeforeCarousel = carouselScreen
          ? Boolean(screen.compareDocumentPosition(carouselScreen) & Node.DOCUMENT_POSITION_FOLLOWING)
          : true;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: screen,
            start: "top 85%",
            end: "bottom 15%",
            scrub: 0.3,
            refreshPriority: isBeforeCarousel ? 2 : 0,
          },
        });
        timeline.fromTo(
          content,
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 0.25, ease: "none" },
          0,
        );
        timeline.to(
          content,
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "none" },
          0.25,
        );
        timeline.to(
          content,
          { autoAlpha: 0, y: -24, duration: 0.3, ease: "none" },
          0.7,
        );
      });
    });

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [reducedMotion]);
}

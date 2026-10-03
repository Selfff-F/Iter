import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./useMotion";

interface HeroParallaxRefs {
  heroRef: RefObject<HTMLElement | null>;
  visualRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
}

export function useHeroParallax({ heroRef, visualRef, contentRef }: HeroParallaxRefs) {
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const visual = visualRef.current;
    const content = contentRef.current;
    if (!hero || !visual || !content || reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.35,
          invalidateOnRefresh: true,
          refreshPriority: 3,
        },
      });

      timeline.fromTo(
        visual,
        { yPercent: () => (isMobile() ? -2 : -4) },
        { yPercent: () => (isMobile() ? 2 : 4), duration: 1, ease: "none" },
        0,
      );
      timeline.fromTo(
        content,
        { autoAlpha: 1, y: 0 },
        { autoAlpha: 0, y: () => (isMobile() ? -16 : -32), duration: 0.78, ease: "none" },
        0,
      );
    }, hero);

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh(true);
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [contentRef, heroRef, reducedMotion, visualRef]);
}

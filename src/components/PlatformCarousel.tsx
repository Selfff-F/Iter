import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { scheduleScrollTriggerRefresh } from "../utils/scheduleScrollTriggerRefresh";

const placeholderPlatforms = [
  { name: "小易陪伴", time: "2022年", description: "平台提供全国陪诊服务，帮取报告、取号、帮买药、帮问诊等，将“一次陪诊，终身托付”作为其品质追求", image: "/images/platforms/xiaoyi.jpg" },
  { name: "陪诊呗", time: "2023年", description: "平台专注于提供医疗陪诊服务，截至2025年1月，已覆盖全国90%以上的城市，提供全天陪诊、代取报告等多样化服务，并通过严格的陪诊师培训机制保障服务质量", image: "/images/platforms/peizhenbei.jpg" },
  { name: "橙医健康", time: "2022年", description: "橙医健康主要经营陪诊师、健康管理师等技能提升业务，以及提供陪诊、绿色就医等医疗健康服务", image: "/images/platforms/huwuyou.jpg" },
  { name: "滴滴陪诊", time: "2026年" ,description: "滴滴陪诊是滴滴出行于2026年推出的就医陪护服务平台，用户可通过滴滴APP预约持证陪诊师，获得包括挂号、缴费、检查、取药、医患沟通协助及情感陪伴在内的全流程陪同服务", image: "/images/platforms/didi.jpg" },
];

export function PlatformCarousel() {
  const rootRef = useRef<HTMLElement>(null);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !swiper || isMobile || reducedMotion) return;
    const stage = root.closest<HTMLElement>(".carousel-stage");
    if (!stage) return;

    gsap.registerPlugin(ScrollTrigger);
    swiper.allowTouchMove = false;
    swiper.updateSize();
    swiper.updateSlides();
    swiper.setProgress(0, 0);
    const context = gsap.context(() => {
      const scrollState = { progress: 0 };
      const cards = Array.from(root.querySelectorAll<HTMLElement>(".platform-card"));
      const updateCardOpacity = () => {
        const viewport = swiper.el.getBoundingClientRect();
        const viewportCenter = viewport.left + viewport.width / 2;
        const fadeDistance = viewport.width / 2;
        swiper.slides.forEach((slide, index) => {
          const slideBounds = slide.getBoundingClientRect();
          const slideCenter = slideBounds.left + slideBounds.width / 2;
          const distance = Math.abs(slideCenter - viewportCenter);
          const opacity = gsap.utils.clamp(0, 1, 1 - distance / fadeDistance);
          cards[index]?.style.setProperty("opacity", opacity.toFixed(3));
        });
      };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "center center",
          end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
          pin: stage,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          onToggle: (self) => {
            document.documentElement.classList.toggle("is-carousel-pinned", self.isActive);
          },
          onRefresh: () => {
            swiper.update();
            updateCardOpacity();
          },
        },
      });

      timeline.fromTo(
        ".platform-card",
        { x: 96 },
        {
          x: 0,
          duration: 0.32,
          stagger: 0.16,
          ease: "power2.out",
        },
        0,
      );
      timeline.to(scrollState, {
        progress: 1,
        ease: "none",
        duration: 0.8,
        onUpdate: () => {
          swiper.setProgress(scrollState.progress, 0);
          updateCardOpacity();
        },
      }, 0);
    }, root);

    scheduleScrollTriggerRefresh();

    return () => {
      document.documentElement.classList.remove("is-carousel-pinned");
      context.revert();
      root.querySelectorAll<HTMLElement>(".platform-card").forEach((card) => card.style.removeProperty("opacity"));
      swiper.allowTouchMove = true;
      swiper.setProgress(0, 0);
    };
  }, [isMobile, reducedMotion, swiper]);

  return (
    <section ref={rootRef} className="platform-carousel" aria-label="陪诊服务平台卡片轮播">
      <div className="platform-carousel__accent" aria-hidden="true" />
      <Swiper
        className="platform-carousel__swiper"
        modules={[A11y, Keyboard, Pagination]}
        slidesPerView={1.12}
        spaceBetween={16}
        speed={reducedMotion ? 0 : 560}
        allowTouchMove={isMobile || reducedMotion}
        centeredSlides={!isMobile && !reducedMotion}
        grabCursor={isMobile || reducedMotion}
        keyboard={{ enabled: isMobile || reducedMotion }}
        pagination={{ clickable: isMobile || reducedMotion }}
        watchOverflow
        onSwiper={setSwiper}
        breakpoints={{
          640: { slidesPerView: 1.8, spaceBetween: 20 },
          900: { slidesPerView: 2.65, spaceBetween: 24 },
          1200: { slidesPerView: 3.15, spaceBetween: 24 },
        }}
      >
        {placeholderPlatforms.map((platform) => (
          <SwiperSlide key={platform.name}>
            <article className="platform-card">
              <div className="platform-card__media">
                <img src={platform.image} alt={`${platform.name}平台`} />
              </div>
              <div className="platform-card__body">
                <h3>{platform.name}</h3>
                <span className="platform-card__time">{platform.time}</span>
                <p>{platform.description}</p>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

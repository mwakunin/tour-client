"use client";

import Image from "next/image";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** How long each photo holds before the next one fades in */
const ADVANCE_MS = 5000;

interface HeroCarouselProps {
  images: string[];
  /** Used to build each slide's alt text */
  alt: string;
  /** Overlay content — title, badges — rendered above the photo */
  children?: ReactNode;
}

export default function HeroCarousel({ images, alt, children }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  // Tracked apart: taking the pointer away must not resume autoplay while a
  // control still holds focus.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Hover and focus pause only while they last. WCAG 2.2.2 wants a mechanism
  // that stays stopped until asked to resume — and touch has no hover at all.
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const count = images.length;
  // A refetch can hand back fewer images than before while `index` still points
  // past the end — every slide would then render at opacity-0, leaving a blank
  // hero that no control could recover from. Clamp rather than trust the state.
  const active = count > 0 ? Math.min(index, count - 1) : 0;

  const next = useCallback(() => setIndex((i) => (Math.min(i, count - 1) + 1) % count), [count]);
  const previous = useCallback(
    () => setIndex((i) => (Math.min(i, count - 1) - 1 + count) % count),
    [count]
  );

  // Honour the OS setting, and keep honouring it if it changes mid-visit
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Advance on its own — unless there is nothing to advance to, someone is
  // reading it, or they have asked for less movement.
  useEffect(() => {
    if (count < 2 || stopped || hovered || focused || reducedMotion) return;

    const timer = setInterval(next, ADVANCE_MS);
    return () => clearInterval(timer);
  }, [count, stopped, hovered, focused, reducedMotion, next]);

  // Only the current slide and its neighbours stay mounted: the incoming photo
  // is already decoded so the crossfade never flashes, and a ten-image tour
  // doesn't pull ten full-bleed heroes on first paint.
  const isNearby = (i: number) =>
    i === active || i === (active + 1) % count || i === (active - 1 + count) % count;

  return (
    <div
      // min-h floors the hero on short viewports: at 60vh a landscape phone or a
      // short window leaves less room than the title overlay needs, and the
      // overlay then spills off the top behind the fixed header. overflow-hidden
      // keeps any spill inside the hero rather than painting over the page above.
      className="relative h-[60vh] min-h-[26rem] overflow-hidden md:h-[70vh]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        // Moving between the arrows and the dots keeps focus inside; only a
        // departure from the carousel itself should let autoplay resume.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      {images.map((src, i) =>
        isNearby(i) ? (
          <Image
            key={src}
            src={src}
            alt={i === active ? `${alt} — image ${i + 1} of ${count}` : ""}
            aria-hidden={i !== active}
            fill
            sizes="100vw"
            priority={i === 0}
            className={cn(
              "object-cover transition-opacity duration-700 ease-in-out",
              i === active ? "opacity-100" : "opacity-0"
            )}
          />
        ) : null
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      {count > 1 && (
        <>
          {/* 40%, not 50%, below md. Centring on the whole hero drops these onto
              the title — the caption is bottom-anchored and the fixed header
              covers the top 64px, so the band actually free for a control sits
              higher than the midpoint. 40% is its centre across mobile heights. */}
          <button
            onClick={previous}
            className="bg-surface-container-lowest/90 text-on-surface shadow-elevated hover:bg-surface-container-lowest absolute top-[40%] left-1 z-10 -translate-y-1/2 rounded-full p-2 transition-all md:top-1/2 md:left-4 md:p-3"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} className="md:h-6 md:w-6" />
          </button>
          <button
            onClick={next}
            className="bg-surface-container-lowest/90 text-on-surface shadow-elevated hover:bg-surface-container-lowest absolute top-[40%] right-1 z-10 -translate-y-1/2 rounded-full p-2 transition-all md:top-1/2 md:right-4 md:p-3"
            aria-label="Next image"
          >
            <ChevronRight size={20} className="md:h-6 md:w-6" />
          </button>

          {/* Image indicators, with the autoplay switch alongside them. On mobile
              they sit at the very bottom, in the padding the overlay reserves for
              them — at bottom-20 they landed on top of the title's meta chips. */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-24">
            <button
              type="button"
              onClick={() => setStopped((wasStopped) => !wasStopped)}
              className="mr-1 rounded-full bg-black/40 p-1.5 text-white transition-colors hover:bg-black/60"
              aria-label={stopped ? "Start automatic slideshow" : "Stop automatic slideshow"}
              aria-pressed={stopped}
            >
              {stopped ? <Play size={14} /> : <Pause size={14} />}
            </button>
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === active ? "w-8 bg-white" : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === active}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  );
}
